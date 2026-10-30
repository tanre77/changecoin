# Updating translations

English is the source of truth for the documentation in this repository. The other languages are machine-assisted. If a translation and the English text disagree, follow the English.

## What is translated

- `README.md`, with one `README.<lang>.md` beside it for each language
- `docs/ethics.md`, `docs/product.md`, `docs/roadmap.md`, and `docs/team.md`
- The same four files under `docs/<lang>/`

## What stays in English

- Source code, code comments, and in-app UI strings
- `scripts/install-page.html` (install screen, not a doc)
- License text, and any legal or privacy document added later. Link those from the docs. Do not translate them.
- This file

## Layout

| Language | README | Other docs |
| --- | --- | --- |
| English (`en`) | `README.md` | `docs/<file>.md` |
| Every other language | `README.<lang>.md` | `docs/<lang>/<file>.md` |

Language codes: `es`, `fr`, `de`, `pt-BR`, `it`, `zh-CN`, `zh-TW`, `ja`, `ko`, `ar`, `hi`, `ru`, `vi`, `tr`, `id`, `pl`, `nl`, `uk`, `fil`, `sw`.

Each README, in English and in translation, starts with a language line that links every language. The docs pages use the same line. Each translation also starts with a short note that it is machine-assisted and that English is authoritative.

## When the English changes

1. Edit the English file (`README.md` or `docs/<file>.md`).
2. Update every translation of that file in the same change, or as soon as you can. Do not leave a translation that describes behavior the English no longer describes.
3. Keep the opening note and the language line.
4. Do not add product behavior, screens, or promises that are not in the English text.
5. Do not translate by summarizing. Cover the same sections and the same claims.

## Leave these as written in English

- Fenced code, commands, file paths, and URLs
- Product and technology names: ChangeCoin, Change Coin, MindCoin, MindCoins, Apple Pay, Google Pay, Google Drive, WebRTC, Firebase, Crashlytics, Discord, Patreon, AdSense, Google Gemini, UIKit, SwiftUI, Swift, Salesforce, Excel, Access
- The screen names Home and Money
- The level names Sanctuary and Launchpad, and the feature name Low Power Mode
- People's names
- Amounts such as `$16` and `$50,000`, percentages, and version numbers (`iOS 16`, `Android 8`)
- `401(k)`, LLC, and C-corp
- Badges, if any are added later

Translate the surrounding sentence. A name that is not in the list above (a role, a principle, an ordinary feature description) is translated.

## Links

From `README.<lang>.md` (same folder as `README.md`):

- English README: `README.md`
- Another README: `README.<other>.md`
- A translated doc: `docs/<lang>/<file>.md`
- This guide: `docs/TRANSLATIONS.md`

From `docs/<lang>/<file>.md`:

- English page: `../<file>.md`
- Another language: `../<other-lang>/<file>.md`
- Translated README: `../../README.<lang>.md`
- This guide: `../TRANSLATIONS.md`

From an English doc in `docs/`:

- A translation: `<lang>/<file>.md`
- This guide: `TRANSLATIONS.md`

Check that a relative link resolves to a file. The “English is authoritative” note is the link that should point at the English page. Other links in a translation should stay inside that language.

## Arabic

Arabic files put the language line in `<div dir="ltr">` and the translated body in `<div dir="rtl">`, so GitHub lays the page out right to left. When a left-to-right token includes punctuation (`401(k)`, `$16`, `iOS 16`), wrap it in `<span dir="ltr">` inside the Arabic sentence.

## Adding a language

1. Copy the English README to `README.<lang>.md` and the four docs into `docs/<lang>/`.
2. Translate them, including the opening note.
3. Add the language to the language line on every README and every doc, in English and in each existing translation.
