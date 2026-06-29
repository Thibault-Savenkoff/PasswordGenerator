# Project Brief

## What it is

- A client-side password generator for personal use, open-sourced on GitHub.
- Runs entirely in the browser — no server, no accounts, no telemetry.

## Why it exists

- Generate strong, configurable passwords without trusting a third-party service or sending data over the network.

## Domain language

| Term | Meaning |
| ---- | ------- |
| pool | The combined character set from enabled options (upper/lower/numbers/symbols) |
| required | One guaranteed character per enabled charset, injected to ensure policy coverage |
| score | zxcvbn's 0–4 strength rating |
| strength segment | One of four visual bars showing password strength |

## Key features

- Configurable length (4–64) via range slider
- Character set toggles: uppercase, lowercase, numbers, symbols
- Cryptographically secure generation via `crypto.getRandomValues`
- Strength estimation via zxcvbn (score + feedback)
- Copy to clipboard with visual confirmation
- Haptic feedback on mobile (web-haptics)
