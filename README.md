# PasswordGenerator

A password generator built with HTML, CSS, and JS. Generates strong passwords entirely on-device using the Web Crypto API — nothing is stored or transmitted.

**[→ Open the app](https://thibault-savenkoff.github.io/PasswordGenerator)**

## Features

- Configurable length (4–64) and character sets (uppercase, lowercase, numbers, symbols)
- Exclude ambiguous characters (0, O, l, 1, I)
- Strength estimation via [zxcvbn](https://github.com/dropbox/zxcvbn)
- Color-coded password display (uppercase / lowercase / numbers / symbols)
- Copy to clipboard
- Haptic feedback on iOS and Android via [web-haptics](https://haptics.lochie.me/)
- PWA — installable on iPhone and Android from the browser

## Use on iPhone / Android

Open the app in Safari or Chrome, then:
- **iPhone**: Share → "Add to Home Screen"
- **Android**: Chrome menu → "Add to Home Screen" / "Install app"

The app works offline once installed.

## Apple Shortcuts

There's also a [Shortcut](https://www.icloud.com/shortcuts/3c91837f97ad4f618edac6606f410f25) for Apple devices.
You can change the length of the password (by default 25) by modifying the shortcut and changing the "**25**" value with whatever you want.

## Run locally

```console
git clone https://github.com/Thibault-Savenkoff/PasswordGenerator.git
cd PasswordGenerator
open index.html
```

No server or build step required. Or with live-reload:

```console
npm install && npm start
```
