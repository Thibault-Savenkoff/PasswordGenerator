# Design

## System

- Apple HIG aesthetic: dark background, system colors, SF Pro font stack fallback
- Tailwind CSS (Play CDN) for layout and spacing; `style.css` for custom design tokens and components not expressible in Tailwind

## Tokens

- CSS custom properties in `style.css`: `--sys-red`, `--sys-orange`, `--sys-green`, `--sys-blue` for strength colors; standard Apple system color semantics
- Typography: Inter (web) falling back to `-apple-system` / SF Pro

## Components

- **Toggle** (`.toggle-cell`): native `<input type="checkbox">` visually replaced by a CSS toggle; last checked cannot be unchecked
- **Range slider** (`.range-slider`): native `<input type="range">`; track fill updated via inline `background` style
- **Strength segments** (`.strength-seg`): four `<span>` bars colored by `--sys-*` tokens based on zxcvbn score
- **Copy button** (`.copy-btn`): switches icon (copy → checkmark) via `.copied` class for 1.5 s

## Accessibility

- Password output uses `<output aria-live="polite">` — screen readers announce new passwords
- Buttons and slider have `aria-label`
- No skip-links (single-page, no navigation)
