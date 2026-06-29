/* ============================================================
   Password Generator — Logic (zxcvbn strength estimation)
   ============================================================ */

(() => {
  "use strict";

  // ponytail: inline web-haptics — iOS via input[switch].click(), Android via navigator.vibrate()
  const haptic = (() => {
    const sw = document.createElement("input");
    sw.type = "checkbox";
    sw.setAttribute("switch", "");
    sw.style.cssText = "position:fixed;opacity:0;pointer-events:none;width:0;height:0";
    document.body.appendChild(sw);
    const ms = { light: [10], selection: [8], medium: [20], heavy: [40],
                 success: [10, 40, 10], warning: [20, 40, 20], error: [10, 30, 10, 30, 10] };
    return {
      trigger(type = "medium") {
        sw.click();
        if (navigator.vibrate) navigator.vibrate(ms[type] ?? [20]);
      },
    };
  })();

  const els = {
    password: document.getElementById("password"),
    copyBtn: document.getElementById("copy-btn"),
    generateBtn: document.getElementById("generate-btn"),
    lengthSlider: document.getElementById("length-slider"),
    lengthValue: document.getElementById("length-value"),
    strengthLabel: document.getElementById("strength-label"),
    strengthFeedback: document.getElementById("strength-feedback"),
    strengthSegs: document.querySelectorAll(".strength-seg"),
    optUpper: document.getElementById("opt-upper"),
    optLower: document.getElementById("opt-lower"),
    optNumbers: document.getElementById("opt-numbers"),
    optSymbols: document.getElementById("opt-symbols"),
    optNoAmbiguous: document.getElementById("opt-no-ambiguous"),
  };

  const CHARSETS = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };

  const AMBIGUOUS = new Set("0Ol1I");

  // zxcvbn scores 0-4 mapped to Apple system colours & labels
  const STRENGTH_MAP = [
    { label: "Very Weak", color: "var(--sys-red)",    segs: 1 },  // 0
    { label: "Weak",      color: "var(--sys-red)",    segs: 1 },  // 1
    { label: "Fair",      color: "var(--sys-orange)", segs: 2 },  // 2
    { label: "Good",      color: "var(--sys-green)",  segs: 3 },  // 3
    { label: "Strong",    color: "var(--sys-blue)",   segs: 4 },  // 4
  ];

  function charClass(ch) {
    if (/[A-Z]/.test(ch)) return "ch-upper";
    if (/[a-z]/.test(ch)) return "ch-lower";
    if (/[0-9]/.test(ch)) return "ch-num";
    return "ch-sym";
  }

  function renderPassword(password) {
    els.password.textContent = "";
    for (const ch of password) {
      const span = document.createElement("span");
      span.textContent = ch;
      span.className = charClass(ch);
      els.password.appendChild(span);
    }
  }

  function secureRandom(max) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  }

  function generate() {
    const opts = {
      upper: els.optUpper.checked,
      lower: els.optLower.checked,
      numbers: els.optNumbers.checked,
      symbols: els.optSymbols.checked,
    };

    const noAmbiguous = els.optNoAmbiguous.checked;
    const filter = (s) => noAmbiguous ? s.split("").filter((c) => !AMBIGUOUS.has(c)).join("") : s;

    let pool = "";
    const required = [];

    for (const [key, enabled] of Object.entries(opts)) {
      if (enabled) {
        const charset = filter(CHARSETS[key]);
        if (charset.length === 0) continue;
        pool += charset;
        required.push(charset[secureRandom(charset.length)]);
      }
    }

    if (pool.length === 0) {
      els.password.textContent = "Select at least one option";
      updateStrength(null);
      return;
    }

    const length = parseInt(els.lengthSlider.value, 10);
    const chars = [];

    for (let i = 0; i < length; i++) {
      chars.push(pool[secureRandom(pool.length)]);
    }

    // Guarantee at least one char from each enabled set
    for (let i = 0; i < required.length && i < length; i++) {
      chars[secureRandom(length)] = required[i];
    }

    const password = chars.join("");
    renderPassword(password);

    // Use zxcvbn for strength analysis
    const result = zxcvbn(password);
    updateStrength(result);
  }

  function updateStrength(result) {
    if (!result) {
      els.strengthSegs.forEach((seg) => (seg.style.backgroundColor = ""));
      els.strengthLabel.textContent = "";
      els.strengthFeedback.textContent = "";
      return;
    }

    const level = STRENGTH_MAP[result.score];

    els.strengthSegs.forEach((seg, i) => {
      seg.style.backgroundColor = i < level.segs ? level.color : "";
    });

    els.strengthLabel.textContent = level.label;
    els.strengthLabel.style.color = level.color;

    // Show zxcvbn feedback (warning or first suggestion)
    const fb = result.feedback;
    const message = fb.warning || (fb.suggestions.length > 0 ? fb.suggestions[0] : "");
    els.strengthFeedback.textContent = message;
  }

  async function copyPassword() {
    const text = els.password.textContent;
    if (!text || text.startsWith("Select")) return;

    try {
      await navigator.clipboard.writeText(text);
      haptic.trigger("success");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      haptic.trigger("success");
    }

    els.copyBtn.classList.add("copied");
    setTimeout(() => els.copyBtn.classList.remove("copied"), 1500);
  }

  function updateSliderTrack() {
    const slider = els.lengthSlider;
    const min = +slider.min;
    const max = +slider.max;
    const pct = ((+slider.value - min) / (max - min)) * 100;
    slider.style.background =
      `linear-gradient(to right, var(--sys-blue) ${pct}%, rgba(255,255,255,0.1) ${pct}%)`;
    els.lengthValue.textContent = slider.value;
  }

  function guardCheckboxes(changed) {
    const boxes = [els.optUpper, els.optLower, els.optNumbers, els.optSymbols];
    if (!boxes.some((b) => b.checked)) {
      changed.checked = true;
    }
  }

  // Events
  els.generateBtn.addEventListener("click", () => {
    haptic.trigger("medium");
    generate();
  });

  els.copyBtn.addEventListener("click", () => {
    copyPassword();
  });

  let lastSliderValue = els.lengthSlider.value;
  let sliderDragging = false;

  function sliderTick() {
    if (!sliderDragging) return;
    if (els.lengthSlider.value !== lastSliderValue) {
      lastSliderValue = els.lengthSlider.value;
      haptic.trigger("selection");
    }
    requestAnimationFrame(sliderTick);
  }

  els.lengthSlider.addEventListener("pointerdown", () => {
    sliderDragging = true;
    lastSliderValue = els.lengthSlider.value;
    haptic.trigger("light");
    requestAnimationFrame(sliderTick);
  });

  window.addEventListener("pointerup", () => {
    sliderDragging = false;
  });

  els.lengthSlider.addEventListener("input", () => {
    updateSliderTrack();
    generate();
  });

  [els.optUpper, els.optLower, els.optNumbers, els.optSymbols].forEach((cb) => {
    cb.addEventListener("change", () => {
      haptic.trigger("light");
      guardCheckboxes(cb);
      generate();
    });
  });

  els.optNoAmbiguous.addEventListener("change", () => {
    haptic.trigger("light");
    generate();
  });

  // Init
  updateSliderTrack();
  generate();

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");
})();
