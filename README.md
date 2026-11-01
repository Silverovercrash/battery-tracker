# Battery & Cell Tracker for Home Assistant

[English](README.md) · [Deutsch](README.de.md)

Manage devices, individual batteries, fixed sets and replacement history.
This is a cleaned, bilingual distribution of an existing working Home Assistant
application. It retains the original storage format, get/save commands and
authenticated-user access. Fresh installations contain no personal inventory.

Project repository: [Silverovercrash/battery-tracker](https://github.com/Silverovercrash/battery-tracker).

## Features

- Devices with locations, icons, battery sizes and 1–500 battery slots.
- Copy specifications from a master battery while assigning each cell its own ID.
- Individual batteries and fixed sets; replace a fixed set as a complete unit.
- Insert, remove without replacement, and record whole-set replacements.
- Optional IN/OUT voltages per cell, with total set voltage kept separate.
- Correct measurements and dates; retain snapshots of completed deployments.
- Inventory table, grouped batteries, history and duration analysis.
- Excel and JSON backups, full restoration, and a local pre-import recovery copy.
- Battery ID labels using the browser print dialog.
- Offline browser storage or shared Home Assistant storage for desktop and mobile.
- English/German language selection without discarding open form inputs.

Voltage alone does not indicate charge level. Unknown historical measurements
remain unknown.

## What was cleaned

Removed personal starter inventory, original exports, hardcoded corrections for
particular batteries, automatic brand/voltage corrections, and a private Windows
print-service token. Browser printing remains available. The optional printer-
specific direct-print service is not included.

The distribution uses the original implementation for storage validation,
get/save handlers and setup. Only the default inventory loader returns empty
arrays. The original plain Store format and authenticated-user access stay intact.

## Language

Choose **Language / Sprache** at the top. German browsers initially use German;
other browsers use English. The application remembers your choice locally.
`?lang=en` or `?lang=de` overrides it for a page load.

Names, locations, IDs, specifications and measurements stay as entered. Internal
status values, view keys and Excel sheet names stay compatible with the original
application. Stored classifications may retain their original spelling.

## Try locally

With Python 3.12+ and a current browser, run from the project directory:

```text
python -m http.server 18775 --bind 127.0.0.1 --directory www
```

Open [the local application](http://127.0.0.1:18775/akku_tracker/index.html?lang=en).
Windows users can double-click `PREVIEW.bat`; `VORSCHAU.bat` provides German
instructions. Leave the server window open while using the application.

The application starts empty. Add a device under **Devices** and batteries under
**Create**. The **Backup** view can add clearly marked DEMO deployments when you
press its sample-data button.

Offline storage belongs to this browser profile and origin. Another browser,
host or port has a separate inventory. Download additional JSON/Excel backups.
All runtime libraries are bundled locally; no internet connection is needed for
normal use or Excel import.

The optional [local storage simulator](http://127.0.0.1:18775/akku_tracker/demo-ha.html)
demonstrates the existing get/save protocol without connecting to an HA account.
Its data lasts until the page is reloaded.

## Install in Home Assistant

1. Back up your current application and inventory before replacing an existing installation.
2. Copy `custom_components/akku_tracker/` into the matching directory in your HA configuration directory.
3. Copy `www/akku_tracker/` to `<config>/www/akku_tracker/`.
4. Add one top-level `akku_tracker:` entry to `configuration.yaml` if it is not already present.
5. Check configuration, then restart Home Assistant at a suitable time.
6. Register `/local/akku_tracker/akku-bridge.js?v=0.1.0` as a dashboard resource of type **JavaScript module**.
7. Add a manual dashboard card:

```yaml
type: custom:akku-tracker-card
```

The domain, Store key and card type match the existing tracker. Install one
version under these names. The cleaned distribution reads the original plain
inventory directly; no storage migration or revision field is required.

Frontend and HA must share an origin. The bridge uses the existing authenticated
HA connection. Do not put HA tokens in frontend files. There is no HACS installer
or automatic updater in this package.

## Storage and access

HA mode uses the existing `akku_tracker_data` Store. Its content remains a plain
object with `batteries`, `devices` and `history` arrays. Do not edit `.storage`
manually. Fresh setup starts empty; an existing valid inventory stays in place.

As in the original application, authenticated HA sessions can read and save the
shared inventory. This package adds no administrator-only restriction or per-user
inventory separation. The original save behavior replaces the shared inventory
with the submitted state; it does not perform revision-based conflict detection.

Offline and HA modes keep their original save/acknowledgement flow. On a failed
HA save, the application returns to its last confirmed state. The OSS browser
storage keys are separate from the older private prototype's browser keys.

## Import, export and labels

Excel contains **Batterien, Geraete, Einsaetze, Messwerte, Statistik and
Wiederherstellung**. Import reads the restoration sheet, not manually edited
analysis cells. JSON backups use `{ "version": 2, "data": ... }`.

Import creates a local recovery copy first. In HA mode, a confirmed import
replaces the shared inventory. Older browser inventories are not imported
automatically; choose the backup you want to restore.

Coin cells are excluded from ID labels by default. Select your actual printer,
label size and scaling in the print dialog. Physical label printing has not been
retested for this package. The private direct-print agent is excluded.

## Validation

```text
python -B -m unittest discover -s tests -v
```

The offline tests exercise the original handlers and verify the plain Store
format, get/save payloads, authenticated non-admin writes, validation and failed
storage. The corresponding backend functions match the source deployment copy;
the private default inventory has been replaced by an empty default.

Browser checks cover both languages, preservation of user-entered names and
forms, device creation, master copying, whole-set replacement, per-cell voltages,
Excel restoration and mobile layout. The local simulator checks the original
get/save protocol and failed-save acknowledgement.

The original application runs in Home Assistant. The cleaned package has not
undergone a separate full HA reinstall test. The local backend source copy could
not be compared byte for byte with the running instance's Python files. These
limits are documented separately from the original application's working behavior.

## Updates and removal

Keep an inventory backup before updates. Replace the program files together,
change the resource URL version and refresh the frontend cache if needed.
The Store format remains unchanged.

To remove: export inventory, remove the dashboard card/resource and YAML entry,
check configuration, restart HA, then remove the exclusive program directories.
The package does not delete the Store automatically.

## License and project status

Own code: MIT. SheetJS CE 0.20.3: Apache-2.0; see [THIRD_PARTY.md](THIRD_PARTY.md).
This is the first public release of a personal application. Community adoption
has not yet been established. Contributions and issue reports are welcome.
