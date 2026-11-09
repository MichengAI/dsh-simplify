<p align="center">
  <img src="assets/branding/dsh-simplify-banner.png" alt="DSH Simplify" width="100%">
</p>

<div align="center">

# DSH Simplify

**Kürzlich geänderten Code in DeepSeek Harness vereinfachen und optimieren, bei unverändertem Verhalten.**

[简体中文](README.zh-CN.md) · [English](README.en.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

[Installation](#installation) · [Verwendung](#verwendung) · [Fehlerbehebung](#fehlerbehebung) · [Änderungsprotokoll](CHANGELOG.md) · [Apache-2.0](LICENSE)

[![Lizenz: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![npm package](https://img.shields.io/npm/v/%40michengai%2Fdsh-simplify.svg?label=npm%20package)](https://www.npmjs.com/package/@michengai/dsh-simplify)
[![DSH Web Plugin](https://img.shields.io/badge/DSH%20Web-Plugin-0f766e.svg)](https://github.com/deepseek-ai/deepseek-harness)
[![DSH unterstützt bis 0.2.2-rc.1](https://img.shields.io/badge/DSH-up%20to%200.2.2--rc.1-2563eb.svg)](#installation)
[![Node.js 22.19+](https://img.shields.io/badge/Node.js-22.19%2B-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

> DSH Simplify ist ein von der Community gepflegtes Plugin für DeepSeek Harness und kein offizielles Produkt von DeepSeek AI. Geben Sie `/simplify` in der aktuellen Sitzung ein, um den Agenten aufzufordern, den Code innerhalb des Git-Änderungsbereichs zu bereinigen, die Lesbarkeit zu verbessern und das Verhalten beizubehalten.

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

- DeepSeek Harness `0.2.x` (`>=0.2.0-rc.1 <0.3.0-0`), getestet mit `0.2.0-rc.1`, `0.2.0-rc.2`, `0.2.1-rc.1`～`0.2.1-rc.5`, `0.2.2-rc.1`.
- Node.js >= 22.19, Git im PATH verfügbar.
- Sitzung mit lokalem Git-Projekt verknüpft.

## Installation

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

dsh plugin --profile web add @michengai/dsh-simplify@1.0.7 --registry=https://registry.npmjs.org/
```

## Verwendung

```text
/simplify
```

## Lizenz

[Apache-2.0](LICENSE)，Copyright 2026 MichengAI.
