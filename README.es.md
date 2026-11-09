<p align="center">
  <img src="assets/branding/dsh-simplify-banner.png" alt="DSH Simplify" width="100%">
</p>

<div align="center">

# DSH Simplify

**Simplifica el código modificado recientemente en DeepSeek Harness manteniendo intacto el comportamiento.**

[简体中文](README.zh-CN.md) · [English](README.en.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

[Instalación](#instalación) · [Uso](#uso) · [Solución de problemas](#solución-de-problemas) · [Registro de cambios](CHANGELOG.md) · [Apache-2.0](LICENSE)

[![Licencia: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![npm package](https://img.shields.io/npm/v/%40michengai%2Fdsh-simplify.svg?label=npm%20package)](https://www.npmjs.com/package/@michengai/dsh-simplify)
[![DSH Web Plugin](https://img.shields.io/badge/DSH%20Web-Plugin-0f766e.svg)](https://github.com/deepseek-ai/deepseek-harness)
[![DSH compatible hasta 0.2.2-rc.1](https://img.shields.io/badge/DSH-up%20to%200.2.2--rc.1-2563eb.svg)](#instalación)
[![Node.js 22.19+](https://img.shields.io/badge/Node.js-22.19%2B-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

> DSH Simplify es un complemento mantenido por la comunidad para DeepSeek Harness, no un producto oficial de DeepSeek AI. Escribe `/simplify` en la conversación actual para pedirle al Agent que refine el código dentro del alcance de cambios de Git, mejorando la legibilidad sin alterar el comportamiento. Compatible con DSH Web y aplicaciones de escritorio que integran DSH Web.

## Características

Después de una sesión de programación, usa `/simplify` para solicitar al Agent que optimice la claridad del código recién editado:

- **Enfoque en los cambios actuales**: Acota las ediciones al alcance de Git para evitar tocar archivos irrelevantes.
- **Soporte para archivos nuevos**: Permite la revisión completa de archivos no rastreados y repositorios sin confirmación inicial.
- **Selección de alcance flexible**: De manera predeterminada analiza el espacio de trabajo, pero permite especificar el área de preparación (staged), una confirmación o rutas concretas.
- **Revisión retrospectiva**: Si el espacio de trabajo está limpio, puede revisar la última confirmación realizada.
- **Interrupción segura ante inconsistencias**: Se detiene si detecta conflictos, modificaciones concurrentes o errores de lectura.

## Ecosistema de productos DSH

| Complemento | Qué puedes hacer |
| --- | --- |
| [Codex UI](https://github.com/MichengAI/dsh-codex-ui) | Organizar proyectos y sesiones, buscar tareas y navegar entre turnos |
| [Agency Agents](https://github.com/MichengAI/dsh-agency-agents) | Seleccionar y convocar especialistas según la tarea |
| [Skills Manager](https://github.com/MichengAI/dsh-skills-manager) | Descubrir, activar, crear e importar habilidades locales |
| [Archive Manager](https://github.com/MichengAI/dsh-archive-manager) | Buscar, restaurar o depurar conversaciones archivadas |
| [IM Connect](https://github.com/MichengAI/dsh-im-connect) | Enviar tareas y recibir respuestas mediante plataformas de mensajería |
| [Automation](https://github.com/MichengAI/dsh-automation) | Programar tareas automáticas y auditar los resultados |
| [BTW](https://github.com/MichengAI/dsh-btw) | Hacer preguntas contextuales rápidas sin interrumpir la tarea principal |
| [Simplify](https://github.com/MichengAI/dsh-simplify) | Simplificar el código dentro del alcance de cambios de Git con `/simplify` |
| [PUA](https://github.com/MichengAI/dsh-pua) | Guiar al Agent para probar nuevos enfoques tras un fallo y validar antes de concluir |
| [Code Review](https://github.com/MichengAI/dsh-code-review) | Iniciar una revisión de código con un Agent independiente mediante `/review` |
| [Codex Pet](https://github.com/MichengAI/dsh-codex-pet) | Mascota de escritorio para notificaciones, aprobaciones y preguntas |

## Requisitos previos

- Compatibilidad con DeepSeek Harness `0.2.x` (`>=0.2.0-rc.1 <0.3.0-0`), probado con `0.2.0-rc.1`, `0.2.0-rc.2`, `0.2.1-rc.1`～`0.2.1-rc.5`, `0.2.2-rc.1`.
- Node.js >= 22.19 con Git disponible en PATH.
- Sesión vinculada a un repositorio Git local.

## Instalación

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

dsh plugin --profile web add @michengai/dsh-simplify@1.0.7 --registry=https://registry.npmjs.org/
```

## Uso

En una conversación vinculada a un repositorio Git, ejecuta:

```text
/simplify
```

### Opciones de alcance

| Entrada | Alcance |
| --- | --- |
| `/simplify` | Cambios netos desde HEAD al espacio de trabajo actual (incluye archivos no rastreados) |
| `/simplify --staged` | Solo el área de preparación (staged) |
| `/simplify --ref=main` | Diferencias entre la confirmación indicada y el espacio de trabajo actual |
| `/simplify src/a.ts` | Solo los archivos especificados |

## Licencia

[Apache-2.0](LICENSE)，Copyright 2026 MichengAI。
