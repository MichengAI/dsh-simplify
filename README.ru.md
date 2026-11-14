<p align="center">
  <img src="assets/branding/dsh-simplify-banner.png" alt="DSH Simplify" width="100%">
</p>

<div align="center">

# DSH Simplify

**Упрощение недавно измененного кода в DeepSeek Harness с сохранением исходной функциональности.**

[简体中文](README.zh-CN.md) · [English](README.en.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

[История изменений](CHANGELOG.md) · [Apache-2.0](LICENSE)

[![Лицензия: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![npm package](https://img.shields.io/npm/v/%40michengai%2Fdsh-simplify.svg?label=npm%20package)](https://www.npmjs.com/package/@michengai/dsh-simplify)
[![DSH Web Plugin](https://img.shields.io/badge/DSH%20Web-Plugin-0f766e.svg)](https://github.com/deepseek-ai/deepseek-harness)
[![Поддержка DSH до 0.2.2-rc.3](https://img.shields.io/badge/DSH-up%20to%200.2.2--rc.3-2563eb.svg)](#установка)
[![Node.js 22.19+](https://img.shields.io/badge/Node.js-22.19%2B-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

> DSH Simplify — плагин для DeepSeek Harness, поддерживаемый сообществом, и не является официальным продуктом DeepSeek AI. Введите `/simplify` в текущей сессии, чтобы попросить Агента упорядочить код в пределах изменений Git, улучшив читаемость и сохранив логику работы.

Промпты задач, отправляемые Агенту, остаются на упрощенном китайском языке, а названия и описания подсказок команд автоматически адаптируются к языку интерфейса.

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

- DeepSeek Harness `0.2.x` (`>=0.2.0-rc.1 <0.3.0-0`), проверено на `0.2.0-rc.1`, `0.2.0-rc.2`, `0.2.1-rc.1`～`0.2.1-rc.5`, `0.2.2-rc.1`, `0.2.2-rc.2`, `0.2.2-rc.3`.
- Версии до `0.2.0-rc.1` отклоняются шлюзом версий. Для DSH `0.1.x` используйте версию `0.1.16`.
- Node.js >= 22.19, Git доступен в PATH.
- Сессия привязана к локальному репозиторию Git.

## Установка

Используйте профиль `web` (или замените на ваш):

### Установка через Агента (Рекомендуется)

```text
Установите плагин DSH @michengai/dsh-simplify в мой локальный профиль web: dsh plugin --profile web add @michengai/dsh-simplify@1.0.9 --registry=https://registry.npmjs.org/. Затем проверьте конфигурацию командой dsh --profile web --dump-config.
```

### Установка через npm вручную

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

dsh plugin --profile web add @michengai/dsh-simplify@1.0.9 --registry=https://registry.npmjs.org/
```

<details>
<summary>Установка из локального пакета</summary>

Загрузите опубликованный архив tgz со страницы [GitHub Release](https://github.com/MichengAI/dsh-simplify/releases/tag/v1.0.9) и выполните:

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

dsh plugin --profile web add .\michengai-dsh-simplify-1.0.9.tgz --ignore-scripts
```

</details>

### Перезагрузка и проверка

Устанавливайте или обновляйте плагин после завершения текущей задачи. Используйте перезагрузку приложения или перезапустите `dsh web`.

## Использование

```text
/simplify
```

### Параметры области

| Команда | Область анализа |
| --- | --- |
| `/simplify` | Изменения между HEAD и рабочей областью (включая untracked файлы). Проверяет последний коммит при чистом дереве |
| `/simplify --staged` | Только подготовленные изменения (staged) |
| `/simplify --ref=main` | Разница между указанным коммитом и текущей рабочей областью |
| `/simplify --ref HEAD` | Явный диапазон HEAD без отката к предыдущему коммиту |
| `/simplify src/a.ts "src/файл с пробелом.ts"` | Только указанные файлы |
| `/simplify src` | Разворачивает измененные файлы внутри каталога |
| `/simplify -- --special.ts` | Разделитель `--` позволяет указывать пути, начинающиеся с дефиса |

## Устранение неполадок

**После нажатия Enter текст очищается, но ответа нет**: пустой диапазон правок не инициирует обращение к модели.

**Текущий каталог не является Git-репозиторием**: запустите команду в проекте Git.

**Файлы в индексе содержат неподготовленные изменения**: сохраните или подготовьте их перед вызовом `--staged`.

## Границы выполнения

Плагин выполняет исключительно запросы Git в режиме чтения и чтение локальных файлов; он никогда не выполняет `git add`, `commit` или `reset`.

## Удаление

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

dsh plugin --profile web remove @michengai/dsh-simplify
```

> Руководство по разработке и проверке доступно на [简体中文](README.zh-CN.md#二次开发) и [English](README.en.md#development).

## Лицензия

[Apache-2.0](LICENSE)，Copyright 2026 MichengAI.
