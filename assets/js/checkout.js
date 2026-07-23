/**
 * NextStepUpward — Stripe Checkout trigger (no dependencies).
 *
 * Any element with `data-checkout` and `data-item="<id>"` becomes a buy button.
 * It asks the backend to create a Checkout Session, then redirects to Stripe's
 * hosted checkout page.
 *
 * API location:
 *   - Same origin by default (when the Node server serves this site).
 *   - Set `window.NSU_API_BASE` before this script loads to point at a separate
 *     backend, e.g. <script>window.NSU_API_BASE="https://api.nextstepupward.com"</script>
 */
(function () {
  "use strict";

  var API_BASE = (window.NSU_API_BASE || "").replace(/\/$/, "");
  var ENDPOINT = API_BASE + "/api/create-checkout-session";

  function setLoading(btn, loading) {
    if (loading) {
      btn.dataset.label = btn.innerHTML;
      btn.setAttribute("disabled", "disabled");
      btn.setAttribute("aria-busy", "true");
      btn.innerHTML = "Redirecting…";
    } else {
      btn.removeAttribute("disabled");
      btn.removeAttribute("aria-busy");
      if (btn.dataset.label) btn.innerHTML = btn.dataset.label;
    }
  }

  function showError(btn, msg) {
    var box = document.querySelector("#checkout-error");
    if (box) {
      box.textContent = msg;
      box.classList.add("show");
      box.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      alert(msg);
    }
  }

  async function startCheckout(btn) {
    var id = btn.getAttribute("data-item");
    if (!id) return;
    setLoading(btn, true);
    try {
      var res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id }),
      });
      var data = await res.json().catch(function () { return {}; });
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout is unavailable right now.");
      }
      window.location.href = data.url; // -> Stripe hosted checkout
    } catch (err) {
      setLoading(btn, false);
      showError(
        btn,
        err.message +
          " If this keeps happening, email ceo@nextstepupward.com and we'll help you complete your booking."
      );
    }
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-checkout]");
    if (!btn) return;
    e.preventDefault();
    startCheckout(btn);
  });
})();
