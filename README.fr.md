<p align="center">
  <img src="assets/branding/dsh-simplify-banner.png" alt="DSH Simplify" width="100%">
</p>

<div align="center">

# DSH Simplify

**Simplifiez le code récemment modifié dans DeepSeek Harness tout en préservant son comportement.**

[简体中文](README.zh-CN.md) · [English](README.en.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

[Installation](#installation) · [Utilisation](#utilisation) · [Dépannage](#dépannage) · [Journal des modifications](CHANGELOG.md) · [Apache-2.0](LICENSE)

[![Licence: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![npm package](https://img.shields.io/npm/v/%40michengai%2Fdsh-simplify.svg?label=npm%20package)](https://www.npmjs.com/package/@michengai/dsh-simplify)
[![DSH Web Plugin](https://img.shields.io/badge/DSH%20Web-Plugin-0f766e.svg)](https://github.com/deepseek-ai/deepseek-harness)
[![DSH compatible jusqu'à 0.2.2-rc.1](https://img.shields.io/badge/DSH-up%20to%200.2.2--rc.1-2563eb.svg)](#installation)
[![Node.js 22.19+](https://img.shields.io/badge/Node.js-22.19%2B-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

> DSH Simplify est un plugin maintenu par la communauté pour DeepSeek Harness, et n'est pas un produit officiel de DeepSeek AI. Saisissez `/simplify` dans la session actuelle pour demander à l'Agent d'organiser le code dans le périmètre des modifications Git, en améliorant la lisibilité tout en préservant le comportement original.

## Fonctionnalités

- **Ciblage précis des modifications** : Limite les modifications au périmètre Git afin d'éviter d'impacter des fichiers non concernés.
- **Prise en charge des nouveaux fichiers** : Permet une revue complète des fichiers non suivis (untracked) ainsi que des dépôts sans commit initial.
- **Sélection flexible de la portée** : Examine par défaut l'espace de travail, avec option pour la zone de staging ou un commit spécifique.
- **Revue rétrospective** : Lorsque l'espace de travail est propre, permet d'examiner le commit le plus récent.
- **Arrêt sécurisé en cas d'incohérence** : Interruption immédiate en cas de conflit ou de modification concurrente.

## Écosystème de produits DSH

| Plugin | Utilisation |
| --- | --- |
| [Codex UI](https://github.com/MichengAI/dsh-codex-ui) | Organisation des projets et sessions, recherche de tâches et navigation fluide |
| [Agency Agents](https://github.com/MichengAI/dsh-agency-agents) | Sélection et invocation de rôles spécialisés |
| [Skills Manager](https://github.com/MichengAI/dsh-skills-manager) | Découverte, activation, création et gestion des compétences locales |
| [Archive Manager](https://github.com/MichengAI/dsh-archive-manager) | Recherche, restauration et nettoyage des sessions archivées |
| [IM Connect](https://github.com/MichengAI/dsh-im-connect) | Envoi de tâches et réception de réponses via les plateformes de messagerie |
| [Automation](https://github.com/MichengAI/dsh-automation) | Planification et exécution automatisée de tâches |
| [BTW](https://github.com/MichengAI/dsh-btw) | Questions contextuelles rapides sans interrompre la tâche principale |
| [Simplify](https://github.com/MichengAI/dsh-simplify) | Simplification du code dans le périmètre Git avec `/simplify` |
| [PUA](https://github.com/MichengAI/dsh-pua) | Encadrement de l'Agent pour persévérer et valider avant finalisation |
| [Code Review](https://github.com/MichengAI/dsh-code-review) | Revue de code indépendante avec rapport dans la session via `/review` |
| [Codex Pet](https://github.com/MichengAI/dsh-codex-pet) | Compagnon de bureau pour les notifications et approbations |

## Prérequis

- DeepSeek Harness `0.2.x` (`>=0.2.0-rc.1 <0.3.0-0`), vérifié avec `0.2.0-rc.1`, `0.2.0-rc.2`, `0.2.1-rc.1`～`0.2.1-rc.5`, `0.2.2-rc.1`.
- Node.js >= 22.19, Git accessible dans le PATH.
- Session liée à un dépôt Git local.

## Installation

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

dsh plugin --profile web add @michengai/dsh-simplify@1.0.7 --registry=https://registry.npmjs.org/
```

## Utilisation

```text
/simplify
```

## Licence

[Apache-2.0](LICENSE)，Copyright 2026 MichengAI。
