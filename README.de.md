<p align="center">
  <img src="assets/branding/dsh-simplify-banner.png" alt="DSH Simplify" width="100%">
</p>

<div align="center">

# DSH Simplify

**Kürzlich geänderten Code in DeepSeek Harness vereinfachen und optimieren, bei unverändertem Verhalten.**

[简体中文](README.zh-CN.md) · [English](README.en.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

[Änderungsprotokoll](CHANGELOG.md) · [Apache-2.0](LICENSE)

[![Lizenz: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![npm package](https://img.shields.io/npm/v/%40michengai%2Fdsh-simplify.svg?label=npm%20package)](https://www.npmjs.com/package/@michengai/dsh-simplify)
[![DSH Web Plugin](https://img.shields.io/badge/DSH%20Web-Plugin-0f766e.svg)](https://github.com/deepseek-ai/deepseek-harness)
[![DSH unterstützt bis 0.2.2-rc.3](https://img.shields.io/badge/DSH-up%20to%200.2.2--rc.3-2563eb.svg)](#installation)
[![Node.js 22.19+](https://img.shields.io/badge/Node.js-22.19%2B-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

> DSH Simplify ist ein von der Community gepflegtes Plugin für DeepSeek Harness und kein offizielles Produkt von DeepSeek AI. Geben Sie `/simplify` in der aktuellen Sitzung ein, um den Agenten aufzufordern, den Code innerhalb des Git-Änderungsbereichs zu bereinigen, die Lesbarkeit zu verbessern und das Verhalten beizubehalten.

Aufgaben-Prompts an den Agenten bleiben in vereinfachtem Chinesisch, während Bezeichnungen und Beschreibungen für Befehlsvorschläge sich dynamisch an die Schnittstellensprache anpassen.

## Funktionen

- **Fokus auf aktuelle Änderungen**: Beschränkt Änderungen auf den Git-Änderungsbereich, um irrelevante Dateien zu schützen.
- **Neue Dateien einschließen**: Vollständige Überprüfung neuer (untracked) Dateien und Repositories ohne Initial-Commit.
- **Flexible Bereichswahl**: Standardmäßig wird das Arbeitsverzeichnis geprüft; alternativ nur der Staging-Bereich oder ein bestimmter Commit.
- **Rückblick nach Commit**: Wenn der Arbeitsbereich sauber ist, kann der letzte Commit geprüft werden.
- **Sicherer Abbruch**: Hält sofort an bei Konflikten, Dateiänderungen oder Lesefehlern.

## DSH Produkt-Ökosystem

| Plugin | Beschreibung |
| --- | --- |
| [Codex UI](https://github.com/MichengAI/dsh-codex-ui) | Projekte & Sitzungen organisieren, Aufgaben suchen, Dialoge steuern |
| [Agency Agents](https://github.com/MichengAI/dsh-agency-agents) | Fachspezifische Rollen je nach Aufgabe auswählen und aufrufen |
| [Skills Manager](https://github.com/MichengAI/dsh-skills-manager) | Lokale Fähigkeiten suchen, aktivieren, erstellen und importieren |
| [Archive Manager](https://github.com/MichengAI/dsh-archive-manager) | Archivierte Sitzungen durchsuchen, wiederherstellen oder bereinigen |
| [IM Connect](https://github.com/MichengAI/dsh-im-connect) | Aufgaben über Messaging-Plattformen senden und Antworten empfangen |
| [Automation](https://github.com/MichengAI/dsh-automation) | Geplante Aufgaben automatisieren und Ausführungsergebnisse prüfen |
| [BTW](https://github.com/MichengAI/dsh-btw) | Schnelle Nebenfragen im Kontext stellen, ohne die Hauptaufgabe zu stören |
| [Simplify](https://github.com/MichengAI/dsh-simplify) | Code im Git-Änderungsbereich mit `/simplify` vereinfachen |
| [PUA](https://github.com/MichengAI/dsh-pua) | Agenten anleiten, bei Fehlern alternative Wege zu versuchen und vor Abschluss zu prüfen |
| [Code Review](https://github.com/MichengAI/dsh-code-review) | Unabhängige Code-Reviews mit `/review` starten und Bericht empfangen |
| [Codex Pet](https://github.com/MichengAI/dsh-codex-pet) | Desktop-Begleiter für Benachrichtigungen, Genehmigungen und Fragen |

## Voraussetzungen

- DeepSeek Harness `0.2.x` (`>=0.2.0-rc.1 <0.3.0-0`), getestet mit `0.2.0-rc.1`, `0.2.0-rc.2`, `0.2.1-rc.1`～`0.2.1-rc.5`, `0.2.2-rc.1`, `0.2.2-rc.2`, `0.2.2-rc.3`.
- Frühere Versionen vor `0.2.0-rc.1` werden abgewiesen. Bei DSH `0.1.x` installieren Sie bitte Version `0.1.16`.
- Node.js >= 22.19, Git im PATH verfügbar.
- Sitzung mit lokalem Git-Projekt verknüpft.

## Installation

Verwenden Sie das Profil `web` (oder passen Sie es an):

### Agent zur Installation auffordern (Empfohlen)

```text
Installieren Sie das DSH-Plugin @michengai/dsh-simplify in mein lokales Web-Profil: dsh plugin --profile web add @michengai/dsh-simplify@1.0.9 --registry=https://registry.npmjs.org/. Bestätigen Sie anschließend mit dsh --profile web --dump-config.
```

### Manuelle Installation über npm

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

dsh plugin --profile web add @michengai/dsh-simplify@1.0.9 --registry=https://registry.npmjs.org/
```

<details>
<summary>Installation aus lokalem Paket</summary>

Laden Sie das tgz-Archiv von [GitHub Release](https://github.com/MichengAI/dsh-simplify/releases/tag/v1.0.9) herunter und führen Sie aus:

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

dsh plugin --profile web add .\michengai-dsh-simplify-1.0.9.tgz --ignore-scripts
```

</details>

### Neuladen und Bestätigen

Installieren oder aktualisieren Sie nach Abschluss der aktuellen Aufgabe. Nutzen Sie die Neuladefunktion der Desktop-App oder starten Sie `dsh web` neu.

## Verwendung

```text
/simplify
```

### Bereichsoptionen

| Eingabe | Prüfbereich |
| --- | --- |
| `/simplify` | Netto-Änderungen von HEAD zum aktuellen Arbeitsverzeichnis (inkl. neuer Dateien). Prüft bei sauberem Verzeichnis den letzten Commit |
| `/simplify --staged` | Nur der Staging-Bereich |
| `/simplify --ref=main` | Differenz zwischen angegebenem Commit und aktuellem Arbeitsverzeichnis |
| `/simplify --ref HEAD` | Expliziter HEAD-Bereich ohne Rückgriff auf vorherigen Commit |
| `/simplify src/a.ts "src/pfad mit leerzeichen.ts"` | Nur angegebene Dateien |
| `/simplify src` | Expandiert geänderte Dateien im Verzeichnis |
| `/simplify -- --special.ts` | Der Trenner `--` erlaubt Pfade, die mit Bindestrich beginnen |

## Fehlerbehebung

**Eingabetaste leert das Feld, aber keine Antwort erfolgt**: Bei leerem Prüfumfang wird kein Modellaufruf ausgelöst.

**Aktuelles Verzeichnis ist kein Git-Repository**: Führen Sie den Befehl in einem gültigen Git-Projekt aus.

**Staging-Dateien weisen ungespeicherte Änderungen auf**: Bitte stagen oder committen Sie diese Änderungen vor Aufruf von `--staged`.

## Ausführungsgrenzen

Das Plugin führt ausschließlich schreibgeschützte Git-Abfragen und lokale Dateilesevorgänge durch; es führt niemals automatisch `git add`, `commit` oder `reset` aus.

## Deinstallation

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

dsh plugin --profile web remove @michengai/dsh-simplify
```

> Anleitungen zur Entwicklung und Verifizierung finden Sie in [简体中文](README.zh-CN.md#二次开发) oder [English](README.en.md#development).

## Lizenz

[Apache-2.0](LICENSE)，Copyright 2026 MichengAI.
