const menuToggle = document.querySelector(".menu-toggle");
const siteMenu = document.querySelector("#site-menu");
const desktopMedia =
  typeof window.matchMedia === "function" ? window.matchMedia("(min-width: 961px)") : null;

if (menuToggle && siteMenu) {
  const closeMenu = ({ returnFocus = false } = {}) => {
    siteMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    if (returnFocus) menuToggle.focus();
  };

  const openMenu = () => {
    siteMenu.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    siteMenu.querySelector("a")?.focus();
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = siteMenu.classList.contains("is-open");
    if (isOpen) closeMenu();
    else openMenu();
  });

  siteMenu.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("a") : null;
    if (target && siteMenu.contains(target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteMenu.classList.contains("is-open")) {
      closeMenu({ returnFocus: true });
    }
  });

  document.addEventListener("click", (event) => {
    if (
      siteMenu.classList.contains("is-open") &&
      event.target instanceof Node &&
      !siteMenu.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  const closeOnDesktop = (event) => {
    if (event.matches) closeMenu();
  };
  if (desktopMedia?.addEventListener) {
    desktopMedia.addEventListener("change", closeOnDesktop);
  } else if (desktopMedia?.addListener) {
    desktopMedia.addListener(closeOnDesktop);
  }
}

const analyticsConfig = window.LVL_ANALYTICS_CONFIG || { enabled: false, measurementId: "" };
const analyticsConsentKey = "lvl_analytics_consent_v1";
let analyticsLoaded = false;

const readAnalyticsConsent = () => {
  try { return window.localStorage.getItem(analyticsConsentKey); } catch { return null; }
};

const writeAnalyticsConsent = (value) => {
  try { window.localStorage.setItem(analyticsConsentKey, value); } catch { /* Continue without persistence. */ }
};

const loadAnalytics = () => {
  if (analyticsLoaded || !analyticsConfig.enabled || !/^G-[A-Z0-9]+$/i.test(analyticsConfig.measurementId)) return;
  analyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", analyticsConfig.measurementId, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsConfig.measurementId)}`;
  document.head.append(script);
};

const privacyPanel = document.createElement("section");
privacyPanel.className = "privacy-controls";
privacyPanel.hidden = true;
privacyPanel.setAttribute("role", "dialog");
privacyPanel.setAttribute("aria-modal", "true");
privacyPanel.setAttribute("aria-labelledby", "privacy-controls-title");
privacyPanel.innerHTML = `<div class="privacy-controls__inner">
  <p class="eyebrow">Website privacy</p>
  <h2 id="privacy-controls-title">Optional analytics</h2>
  <p data-privacy-description></p>
  <div class="privacy-controls__actions">
    <button class="button button-primary" type="button" data-analytics-allow>Allow analytics</button>
    <button class="button button-secondary" type="button" data-analytics-decline>Continue without analytics</button>
  </div>
  <p class="privacy-controls__link"><a href="privacy.html">Read the privacy notice</a></p>
</div>`;
document.body.append(privacyPanel);

const privacyDescription = privacyPanel.querySelector("[data-privacy-description]");
const allowAnalytics = privacyPanel.querySelector("[data-analytics-allow]");
const declineAnalytics = privacyPanel.querySelector("[data-analytics-decline]");
let privacyReturnFocus = null;

const closePrivacyPanel = () => {
  privacyPanel.hidden = true;
  privacyReturnFocus?.focus?.();
  privacyReturnFocus = null;
};

const openPrivacyPanel = (trigger = null) => {
  privacyReturnFocus = trigger;
  const enabled = analyticsConfig.enabled && /^G-[A-Z0-9]+$/i.test(analyticsConfig.measurementId);
  privacyDescription.textContent = enabled
    ? "Allow Lehigh Valley Legal to measure page activity and privacy-limited phone and callback events. Form contents are never sent to analytics."
    : "Optional analytics is turned off on this review build. No Google Analytics library will load.";
  allowAnalytics.hidden = !enabled;
  declineAnalytics.textContent = enabled ? "Continue without analytics" : "Close";
  privacyPanel.hidden = false;
  (enabled ? allowAnalytics : declineAnalytics).focus();
};

allowAnalytics.addEventListener("click", () => {
  writeAnalyticsConsent("granted");
  window.gtag?.("consent", "update", { analytics_storage: "granted" });
  loadAnalytics();
  closePrivacyPanel();
});

declineAnalytics.addEventListener("click", () => {
  if (analyticsConfig.enabled) writeAnalyticsConsent("denied");
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  closePrivacyPanel();
});

privacyPanel.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePrivacyPanel();
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = Array.from(
    privacyPanel.querySelectorAll('a[href], button:not([disabled]):not([hidden]), [tabindex]:not([tabindex="-1"])')
  ).filter((element) => element.getClientRects().length > 0);
  if (!focusable.length) {
    event.preventDefault();
    return;
  }
  const first = focusable.at(0);
  const last = focusable.at(-1);
  if (event.shiftKey && (document.activeElement === first || !privacyPanel.contains(document.activeElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !privacyPanel.contains(document.activeElement))) {
    event.preventDefault();
    first.focus();
  }
});

for (const trigger of document.querySelectorAll("[data-open-privacy-controls]")) {
  trigger.addEventListener("click", () => openPrivacyPanel(trigger));
}

if (analyticsConfig.enabled) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });
  const choice = readAnalyticsConsent();
  if (choice === "granted") {
    window.gtag("consent", "update", { analytics_storage: "granted" });
    loadAnalytics();
  }
  else if (choice !== "denied") openPrivacyPanel();
}

const emitLeadEvent = (eventName, detail = {}) => {
  const safeDetail = {
    channel: "lehigh_valley_legal",
    page_path: window.location.pathname,
    ...detail,
  };
  window.dispatchEvent(new CustomEvent("lehigh-valley-legal:lead-event", { detail: { event: eventName, ...safeDetail } }));
  if (readAnalyticsConsent() === "granted" && Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...safeDetail });
  }
};

document.addEventListener("click", (event) => {
  const link = event.target instanceof Element ? event.target.closest("a") : null;
  if (!link) return;
  if (link.matches('a[href^="tel:"]')) {
    emitLeadEvent("phone_click", { location: link.dataset.location || "page" });
  } else if (link.dataset.event === "callback_form_start") {
    emitLeadEvent("callback_form_start", { location: link.dataset.location || "page" });
  }
});

for (const form of document.querySelectorAll("[data-intake-form]")) {
  const status = form.querySelector("[data-form-status]");
  const summary = form.querySelector('textarea[name="summary"]');
  const count = form.querySelector("[data-summary-count]");
  const submit = form.querySelector('button[type="submit"]');
  const pagePath = form.querySelector('input[name="page_path"]');
  const submissionId = form.querySelector('input[name="submission_id"]');
  if (pagePath) pagePath.value = window.location.pathname;
  if (submissionId && window.crypto?.randomUUID) submissionId.value = window.crypto.randomUUID();

  const setStatus = (message, state = "") => {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  };

  summary?.addEventListener("input", () => {
    if (count) count.textContent = String(summary.value.length);
  });

  form.addEventListener("focusin", () => {
    if (form.dataset.started) return;
    form.dataset.started = "true";
    emitLeadEvent("callback_form_start", { location: "form" });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");
    const method = form.elements.safe_contact_method?.value;
    const phoneValue = form.elements.phone?.value.trim();
    const emailValue = form.elements.email?.value.trim();
    if (!form.reportValidity()) return;
    if ((method === "phone" && !phoneValue) || (method === "email" && !emailValue)) {
      setStatus(`Enter a ${method} address so the office can safely contact you.`, "error");
      form.elements[method]?.focus();
      return;
    }

    submit.disabled = true;
    submit.setAttribute("aria-busy", "true");
    setStatus("Sending your callback request…", "pending");
    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.receipt) throw new Error("intake unavailable");
      form.reset();
      if (pagePath) pagePath.value = window.location.pathname;
      if (submissionId && window.crypto?.randomUUID) submissionId.value = window.crypto.randomUUID();
      if (count) count.textContent = "0";
      setStatus(`Request received. Your receipt is ${result.receipt}. If a deadline is close, call ${document.querySelector('a[href^="tel:"]')?.textContent?.trim() || "the office"}.`, "success");
      emitLeadEvent("callback_form_submit", { location: "form" });
    } catch {
      setStatus("The callback form is unavailable right now. No request was recorded. Please call the office instead.", "error");
    } finally {
      submit.disabled = false;
      submit.removeAttribute("aria-busy");
    }
  });
}
