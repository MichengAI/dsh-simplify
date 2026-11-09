<p align="center">
  <img src="assets/branding/dsh-simplify-banner.png" alt="DSH Simplify" width="100%">
</p>

<div align="center">

# DSH Simplify

**Simplifique o código modificado recentemente no DeepSeek Harness preservando o comportamento original.**

[简体中文](README.zh-CN.md) · [English](README.en.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

[Instalação](#instalação) · [Como usar](#como-usar) · [Solução de problemas](#solução-de-problemas) · [Histórico de alterações](CHANGELOG.md) · [Apache-2.0](LICENSE)

[![Licença: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![npm package](https://img.shields.io/npm/v/%40michengai%2Fdsh-simplify.svg?label=npm%20package)](https://www.npmjs.com/package/@michengai/dsh-simplify)
[![DSH Web Plugin](https://img.shields.io/badge/DSH%20Web-Plugin-0f766e.svg)](https://github.com/deepseek-ai/deepseek-harness)
[![DSH compatível até 0.2.2-rc.1](https://img.shields.io/badge/DSH-up%20to%200.2.2--rc.1-2563eb.svg)](#instalação)
[![Node.js 22.19+](https://img.shields.io/badge/Node.js-22.19%2B-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

> DSH Simplify é um plugin mantido pela comunidade para DeepSeek Harness, e não é um produto oficial da DeepSeek AI. Digite `/simplify` na sessão atual para solicitar ao Agent que organize o código dentro do escopo de alterações do Git, aumentando a legibilidade e preservando a funcionalidade original.

## Recursos

- **Foco nas alterações atuais**: Delimita as edições ao escopo Git para não afetar arquivos não relacionados.
- **Suporte a novos arquivos**: Permite revisão completa de arquivos não rastreados (untracked) e repositórios sem commit inicial.
- **Seleção flexível de escopo**: Analisa o diretório de trabalho por padrão, com opção para staged ou um commit específico.
- **Revisão retrospectiva**: Quando a área de trabalho estiver limpa, permite analisar o último commit realizado.
- **Interrupção segura em caso de inconsistência**: Para imediatamente se houver conflitos, alterações concorrentes ou erros de leitura.

## Ecossistema de produtos DSH

| Plugin | O que você pode fazer |
| --- | --- |
| [Codex UI](https://github.com/MichengAI/dsh-codex-ui) | Organizar projetos e sessões, buscar tarefas e navegar no histórico |
| [Agency Agents](https://github.com/MichengAI/dsh-agency-agents) | Escolher e invocar papéis especializados por tarefa |
| [Skills Manager](https://github.com/MichengAI/dsh-skills-manager) | Descobrir, ativar, criar e importar habilidades locais |
| [Archive Manager](https://github.com/MichengAI/dsh-archive-manager) | Buscar, restaurar e limpar conversas arquivadas |
| [IM Connect](https://github.com/MichengAI/dsh-im-connect) | Enviar tarefas e receber respostas através de mensageiros |
| [Automation](https://github.com/MichengAI/dsh-automation) | Agendar tarefas automáticas e conferir relatórios de execução |
| [BTW](https://github.com/MichengAI/dsh-btw) | Perguntas contextuais rápidas sem interromper o fluxo principal |
| [Simplify](https://github.com/MichengAI/dsh-simplify) | Simplificar código no escopo de alterações do Git com `/simplify` |
| [PUA](https://github.com/MichengAI/dsh-pua) | Orientar o Agent a tentar abordagens alternativas e verificar antes de finalizar |
| [Code Review](https://github.com/MichengAI/dsh-code-review) | Iniciar revisões de código com Agent independente via `/review` |
| [Codex Pet](https://github.com/MichengAI/dsh-codex-pet) | Mascote de desktop para notificações, aprovações e respostas |

## Pré-requisitos

- Compatibilidade com DeepSeek Harness `0.2.x` (`>=0.2.0-rc.1 <0.3.0-0`), validado em `0.2.0-rc.1`, `0.2.0-rc.2`, `0.2.1-rc.1`～`0.2.1-rc.5`, `0.2.2-rc.1`.
- Node.js >= 22.19, Git acessível no PATH.
- Sessão vinculada a um repositório Git local.

## Instalação

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

dsh plugin --profile web add @michengai/dsh-simplify@1.0.7 --registry=https://registry.npmjs.org/
```

## Uso

```text
/simplify
```

## Licença

[Apache-2.0](LICENSE)，Copyright 2026 MichengAI.
