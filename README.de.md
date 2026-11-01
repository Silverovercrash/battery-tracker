# Battery & Cell Tracker – deutsche Anleitung

[English](README.md) · [Deutsch](README.de.md)

Geräte, Einzelbatterien, feste Sätze und Wechselverlauf gemeinsam verwalten.
Dies ist die bereinigte, zweisprachige Fassung einer bereits laufenden
Home-Assistant-Anwendung. Speicherformat, Laden/Speichern und der Zugriff
angemeldeter Benutzer entsprechen wieder dem Original.

Projekt auf GitHub: [Silverovercrash/battery-tracker](https://github.com/Silverovercrash/battery-tracker).

## Funktionen

- Geräte mit Ort, Symbol, Batteriegröße und 1 bis 500 Batterieplätzen.
- Stammdaten einer Master-Batterie übernehmen; jede Batterie erhält eine eigene ID.
- Einzelbatterien und feste Verbünde; einen festen Satz vollständig wechseln.
- Einlegen, Herausnehmen ohne Ersatz und Satzwechsel dokumentieren.
- Freiwillige IN-/OUT-Spannung je Zelle, Gesamtspannung getrennt.
- Messwerte und Daten nachtragen; abgeschlossene Einsätze mit Schnappschüssen erhalten.
- Bearbeitbarer Einzelbestand, gruppierte Batterien, Verlauf und Laufzeitauswertung.
- Excel-/JSON-Sicherung, Wiederherstellung und Rücksicherung vor Import.
- Batterie-ID-Etiketten über den Browser-Druckdialog.
- Offline im Browser oder gemeinsamer HA-Bestand für PC und Handy.
- Sprachumschaltung Deutsch/Englisch ohne Verlust offener Formulareingaben.

Aus Spannung allein wird kein Ladezustand abgeleitet. Nicht dokumentierte
Messungen und Wechsel bleiben unbekannt.

## Bereinigung

Entfernt sind der persönliche Startbestand, eingebettete Originalexporte,
automatische Korrekturen für bestimmte Batterie-IDs, feste Marken-/Spannungs-
Ergänzungen und der private Windows-Druckzugang. Browser-Etikettendruck bleibt
enthalten. Der persönliche Direktdruckdienst gehört nicht zum Paket.

Datenprüfung, Get-/Save-Funktionen und Setup entsprechen der vorhandenen
Backend-Kopie. Der Startbestand ist für neue Installationen leer. Das ursprüngliche
Storeformat und der Zugriff angemeldeter Benutzer bleiben erhalten.

## Sprache

Oben unter **Language / Sprache** wechseln. Beim ersten Start folgt die Sprache
dem Browser: Deutsch bei deutschem Browser, sonst Englisch. Die Auswahl bleibt
lokal gespeichert. `?lang=de` und `?lang=en` überschreiben sie beim Laden.

Eigene Namen, Orte, IDs, Stammdaten und Messwerte bleiben erhalten. Interne
Statuswerte, Ansichtskennungen und Excel-Blattnamen bleiben kompatibel; gespeicherte
Klassifikationen behalten gegebenenfalls ihre bisherige Schreibweise.

## Lokal öffnen

Mit Python ab 3.12 und aktuellem Browser im Projektordner starten:

```text
python -m http.server 18775 --bind 127.0.0.1 --directory www
```

Unter Windows geht auch `VORSCHAU.bat`. Serverfenster offen lassen und
[die lokale Anwendung](http://127.0.0.1:18775/akku_tracker/index.html?lang=de) öffnen.
`PREVIEW.bat` nennt die englische Startadresse.

Der Startbestand ist leer. Geräte unter „Geräte“, Batterien unter „Anlegen“
erfassen. Unter „Sicherung“ lassen sich auf Knopfdruck markierte DEMO-Einsätze
für die Statistik ergänzen.

Offline liegen die Daten im aktuellen Browserprofil für diesen Host und Port.
Ein anderer Browser oder eine andere Adresse hat einen eigenen Bestand.
JSON-/Excel-Backups zusätzlich herunterladen. Die Bibliotheken liegen lokal.

Die [lokale Speichersimulation](http://127.0.0.1:18775/akku_tracker/demo-ha.html)
zeigt den ursprünglichen Get-/Save-Ablauf ohne Verbindung zu einem HA-Konto.
Ihre Daten gelten bis zum Neuladen.

## In Home Assistant installieren

1. Vor Austausch einer bestehenden Version Programmdateien und Bestand sichern.
2. `custom_components/akku_tracker/` in den gleichnamigen Unterordner des HA-Konfigurationsverzeichnisses kopieren.
3. `www/akku_tracker/` nach `<config>/www/akku_tracker/` kopieren.
4. Falls noch nicht vorhanden, einmal `akku_tracker:` auf oberster Ebene in `configuration.yaml` ergänzen.
5. Konfiguration prüfen und Home Assistant zu einem passenden Zeitpunkt neu starten.
6. `/local/akku_tracker/akku-bridge.js?v=0.1.0` als Dashboard-Ressource vom Typ **JavaScript-Modul** registrieren.
7. Eine manuelle Karte hinzufügen:

```yaml
type: custom:akku-tracker-card
```

Domain, Store-Schlüssel und Kartentyp entsprechen dem vorhandenen Tracker.
Unter diesen Namen eine Version verwenden. Die bereinigte Fassung liest das
ursprüngliche Datenobjekt direkt; eine Migration oder Revisionsnummer ist unnötig.

Karte und HTML müssen denselben Ursprung wie HA verwenden. Die Brücke nutzt
die bestehende angemeldete HA-Verbindung. Keine Token in Frontend-Dateien
eintragen. HACS-Installer und automatische Aktualisierung sind nicht enthalten.

## Speicher und Zugriff

HA speichert weiterhin im Store `akku_tracker_data`, als Objekt mit den Listen
`batteries`, `devices` und `history`. `.storage` nicht von Hand bearbeiten.
Neue Installationen beginnen leer; vorhandene gültige Bestände bleiben erhalten.

Wie im Original können angemeldete HA-Sitzungen den gemeinsamen Bestand lesen
und speichern. Das Paket führt weder neue Admin-Pflicht noch getrennte
Benutzerbestände ein. Speichern ersetzt den gemeinsamen Bestand durch den
übermittelten Zustand. Eine neue Revisions-/Konfliktprüfung ist nicht enthalten.

Der ursprüngliche Speicher- und Bestätigungsablauf bleibt erhalten. Scheitert
das HA-Speichern, kehrt die Oberfläche zum letzten bestätigten Stand zurück.
Für die OSS-Browserkopie gelten eigene Schlüssel; alte private Browserdaten
werden nicht automatisch übernommen.

## Import, Export und Druck

Excel enthält **Batterien, Geraete, Einsaetze, Messwerte, Statistik und
Wiederherstellung**. Import liest das Wiederherstellungsblatt, nicht manuell
geänderte Auswertungszellen. JSON-Backups verwenden `{ "version": 2, "data": ... }`.

Vor Import entsteht eine lokale Rücksicherung. Im HA-Modus ersetzt ein bestätigter
Import den gemeinsamen Bestand. Ein älterer Browserbestand wird nur durch
bewusste Auswahl seiner Sicherung übernommen.

Knopfzellen sind vom ID-Etikettendruck standardmäßig ausgeschlossen. Den eigenen
Drucker, Etikettenformat und Skalierung im Browser-Druckdialog wählen. Physischer
Druck wurde für dieses Paket nicht erneut getestet. Der private Direktdruckdienst
bleibt ausgeschlossen.

## Prüfungen

```text
python -B -m unittest discover -s tests -v
```

Die lokalen Prüfungen testen die ursprünglichen Backend-Handler: Datenformat,
Nachrichten, angemeldetes Speichern ohne Admin-Pflicht, vorhandene Datenprüfung
und Fehler beim Speichern. Die betreffenden Funktionen stimmen mit der
Bereitstellungskopie überein; der private Standardbestand wurde geleert.

Die Browserprüfungen decken beide Sprachen, unveränderte eigene Namen und
Formulare, Geräteanlage, Master-Kopie, Satzwechsel, Einzelspannungen, Excel-
Rückimport und Mobilansicht ab. Der Simulator prüft ursprüngliches Laden/Speichern
und die Fehlerrückmeldung.

Das Original läuft in Home Assistant. Für das bereinigte Paket ist kein separater
vollständiger HA-Neuinstallationstest erfolgt. Die lokale Backend-Kopie konnte
nicht byteweise mit den Pythondateien der laufenden Instanz abgeglichen werden.
Diese Grenze steht getrennt von der bereits laufenden Originalanwendung.

## Aktualisieren und Entfernen

Vor Aktualisierung Bestand sichern. Die Programmdateien gemeinsam austauschen,
Versionskennung der Ressourcen-URL ändern und gegebenenfalls Frontend-Cache neu
laden. Das Storeformat bleibt erhalten.

Zum Entfernen Bestand exportieren, Karte und Ressource sowie YAML-Eintrag
entfernen, Konfiguration prüfen, HA neu starten und die exklusiven Programmordner
entfernen. Das Paket löscht den Store nicht automatisch.

## Lizenz und Projektstatus

Eigener Code MIT; SheetJS CE 0.20.3 unter Apache-2.0, siehe [THIRD_PARTY.md](THIRD_PARTY.md).
Dies ist die erste öffentliche Fassung einer persönlichen Anwendung. Eine Nutzung
in der Community ist bisher nicht belegt. Beiträge und Fehlermeldungen sind willkommen.
