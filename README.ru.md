<p align="center">
  <img src="assets/branding/dsh-simplify-banner.png" alt="DSH Simplify" width="100%">
</p>

<div align="center">

# DSH Simplify

**Упрощение недавно измененного кода в DeepSeek Harness с сохранением исходной функциональности.**

[简体中文](README.zh-CN.md) · [English](README.en.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

[Установка](#установка) · [Использование](#использование) · [Устранение неполадок](#устранение-неполадок) · [История изменений](CHANGELOG.md) · [Apache-2.0](LICENSE)

[![Лицензия: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![npm package](https://img.shields.io/npm/v/%40michengai%2Fdsh-simplify.svg?label=npm%20package)](https://www.npmjs.com/package/@michengai/dsh-simplify)
[![DSH Web Plugin](https://img.shields.io/badge/DSH%20Web-Plugin-0f766e.svg)](https://github.com/deepseek-ai/deepseek-harness)
[![Поддержка DSH до 0.2.2-rc.1](https://img.shields.io/badge/DSH-up%20to%200.2.2--rc.1-2563eb.svg)](#установка)
[![Node.js 22.19+](https://img.shields.io/badge/Node.js-22.19%2B-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

> DSH Simplify — плагин для DeepSeek Harness, поддерживаемый сообществом, и не является официальным продуктом DeepSeek AI. Введите `/simplify` в текущей сессии, чтобы попросить Агента упорядочить код в пределах изменений Git, улучшив читаемость и сохранив логику работы.

## Возможности

- **Фокус на текущих изменениях**: ограничение правок областью Git-изменений во избежание затрагивания несвязанных файлов.
- **Поддержка новых файлов**: полный анализ неотслеживаемых (untracked) файлов и репозиториев без начального коммита.
- **Гибкий выбор области**: анализ рабочей области по умолчанию, либо только индекса (staged), либо конкретного коммита/пути.
- **Проверка после коммита**: при чистом рабочем дереве возможность проанализировать последний сделанный коммит.
- **Безопасная остановка**: немедленная остановка при конфликтах, параллельных правках или ошибках чтения.

## Экосистема продуктов DSH

| Плагин | Назначение |
| --- | --- |
| [Codex UI](https://github.com/MichengAI/dsh-codex-ui) | Организация проектов и сессий, поиск задач и навигация |
| [Agency Agents](https://github.com/MichengAI/dsh-agency-agents) | Выбор и вызов специализированных ролей под задачу |
| [Skills Manager](https://github.com/MichengAI/dsh-skills-manager) | Поиск, включение, создание и импорт локальных навыков |
| [Archive Manager](https://github.com/MichengAI/dsh-archive-manager) | Поиск, восстановление и очистка архивированных сессий |
| [IM Connect](https://github.com/MichengAI/dsh-im-connect) | Отправка задач и прием ответов через мессенджеры |
| [Automation](https://github.com/MichengAI/dsh-automation) | Автоматизация задач по расписанию и просмотр отчетов |
| [BTW](https://github.com/MichengAI/dsh-btw) | Быстрые сопутствующие вопросы без прерывания основной задачи |
| [Simplify](https://github.com/MichengAI/dsh-simplify) | Упрощение кода в пределах изменений Git командой `/simplify` |
| [PUA](https://github.com/MichengAI/dsh-pua) | Направление Агента пробовать альтернативные пути и проверять результаты |
| [Code Review](https://github.com/MichengAI/dsh-code-review) | Независимое ревью кода отдельным Агентом через `/review` |
| [Codex Pet](https://github.com/MichengAI/dsh-codex-pet) | Виджет-питомец для уведомлений, подтверждения инструментов и ответов |

## Требования

- DeepSeek Harness `0.2.x` (`>=0.2.0-rc.1 <0.3.0-0`), проверено на `0.2.0-rc.1`, `0.2.0-rc.2`, `0.2.1-rc.1`～`0.2.1-rc.5`, `0.2.2-rc.1`.
- Node.js >= 22.19, Git доступен в PATH.
- Сессия привязана к локальному репозиторию Git.

## Установка

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

dsh plugin --profile web add @michengai/dsh-simplify@1.0.7 --registry=https://registry.npmjs.org/
```

## Использование

```text
/simplify
```

## Лицензия

[Apache-2.0](LICENSE)，Copyright 2026 MichengAI.
