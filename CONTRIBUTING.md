# Contributing

Test with fictional data and a separate HA instance. Keep devices, fixed sets,
individual cells, active deployments and completed history distinct. Unknown
voltage is not 0 V.

Run `python -B -m unittest discover -s tests -v` before changing persistence.
For UI changes, check desktop, narrow mobile layout, complete Excel restoration,
and English/German. The original backend and its validation are in
`custom_components/akku_tracker/__init__.py`. Keep its Store format, WebSocket
contract and existing authenticated-user access unchanged in cleanup work.
Propose functional changes separately from privacy cleanup and localization.

The optional browser regression test is `node tests/language-browser.cjs`. It
requires Playwright and its Chromium browser (`npm install --no-save playwright`,
then `npx playwright install chromium`), plus the local server from the README
on port 18775. It uses only fictional local data and saves screenshots under
`test-results/`. `PLAYWRIGHT_EXECUTABLE_PATH` can select an existing browser.

## Localization

`www/akku_tracker/translations.js` maps canonical German UI phrases to English.
`i18n.js` translates text and descriptive attributes through `setLocalizedHTML`
and `setLocalizedText`. Escaped inventory values use temporary tokens and are
restored as literal text/attributes. Switching updates remembered nodes in place,
preserving form values and focus.

Keep view keys, statuses, backup keys, worksheet names and message types stable.
Use `uiIs` when inherited code identifies a translated control. New messages need
dictionary entries; new rendered fragments must use localization helpers.
Never translate user-entered names or IDs.

Reports should include versions, expected/actual behavior and a small fictional
example. Never upload private backups, inventory, credentials or unredacted screenshots.
