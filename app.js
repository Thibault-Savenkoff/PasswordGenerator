/* ============================================================
   Password Generator — Logic (zxcvbn strength estimation)
   ============================================================ */

import { WebHaptics } from "web-haptics";

(() => {
  "use strict";

  const haptic = new WebHaptics();

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
  };

  const CHARSETS = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };

  // zxcvbn scores 0-4 mapped to Apple system colours & labels
  const STRENGTH_MAP = [
    { label: "Very Weak", color: "var(--sys-red)",    segs: 1 },  // 0
    { label: "Weak",      color: "var(--sys-red)",    segs: 1 },  // 1
    { label: "Fair",      color: "var(--sys-orange)", segs: 2 },  // 2
    { label: "Good",      color: "var(--sys-green)",  segs: 3 },  // 3
    { label: "Strong",    color: "var(--sys-blue)",   segs: 4 },  // 4
  ];

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

    let pool = "";
    const required = [];

    for (const [key, enabled] of Object.entries(opts)) {
      if (enabled) {
        pool += CHARSETS[key];
        required.push(CHARSETS[key][secureRandom(CHARSETS[key].length)]);
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
    els.password.textContent = password;

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
    haptic.trigger("light");
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

  // Init
  updateSliderTrack();
  generate();
})();
