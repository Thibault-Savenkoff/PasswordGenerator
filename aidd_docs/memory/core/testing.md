# Testing

## Strategy

No automated test suite. The project is a small static tool; correctness is verified by opening the app in a browser.

## Manual checks

- Password generates on load and on button click
- All charset toggles work; last one cannot be unchecked
- Slider updates length value and regenerates
- Copy button writes to clipboard and shows checkmark
- Strength bars and label update correctly per zxcvbn score
