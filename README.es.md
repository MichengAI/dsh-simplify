<p align="center">
  <img src="assets/branding/dsh-simplify-banner.png" alt="DSH Simplify" width="100%">
</p>

<div align="center">

# DSH Simplify

**Simplifica el código modificado recientemente en DeepSeek Harness manteniendo intacto el comportamiento.**

[简体中文](README.zh-CN.md) · [English](README.en.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

[Registro de cambios](CHANGELOG.md) · [Apache-2.0](LICENSE)

[![Licencia: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![npm package](https://img.shields.io/npm/v/%40michengai%2Fdsh-simplify.svg?label=npm%20package)](https://www.npmjs.com/package/@michengai/dsh-simplify)
[![DSH Web Plugin](https://img.shields.io/badge/DSH%20Web-Plugin-0f766e.svg)](https://github.com/deepseek-ai/deepseek-harness)
[![DSH compatible hasta 0.2.2-rc.3](https://img.shields.io/badge/DSH-up%20to%200.2.2--rc.3-2563eb.svg)](#instalación)
[![Node.js 22.19+](https://img.shields.io/badge/Node.js-22.19%2B-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

> DSH Simplify es un complemento mantenido por la comunidad para DeepSeek Harness, no un producto oficial de DeepSeek AI. Escribe `/simplify` en la conversación actual para pedirle al Agent que refine el código dentro del alcance de cambios de Git, mejorando la legibilidad sin alterar el comportamiento. Compatible con DSH Web y aplicaciones de escritorio que integran DSH Web.

Las instrucciones enviadas al Agent se mantienen en chino simplificado, mientras que las etiquetas y descripciones de los comandos sugeridos se adaptan automáticamente al idioma de la interfaz.

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

- Compatibilidad con DeepSeek Harness `0.2.x` (`>=0.2.0-rc.1 <0.3.0-0`), probado con `0.2.0-rc.1`, `0.2.0-rc.2`, `0.2.1-rc.1`～`0.2.1-rc.5`, `0.2.2-rc.1`, `0.2.2-rc.2`, `0.2.2-rc.3`.
- Los entornos anteriores a `0.2.0-rc.1` son rechazados por el control de versiones. Si utilizas `0.1.x`, instala la versión `0.1.16`.
- Node.js >= 22.19 con Git disponible en PATH.
- Sesión vinculada a un repositorio Git local.

## Instalación

Los siguientes comandos utilizan el perfil `web`. Modifícalo según tu entorno.

### Solicitar al Agent la instalación (Recomendado)

Envía el siguiente mensaje a cualquier Agent con permisos de terminal:

```text
Instala el plugin @michengai/dsh-simplify en mi perfil web local ejecutando: dsh plugin --profile web add @michengai/dsh-simplify@1.0.9 --registry=https://registry.npmjs.org/. Luego ejecuta dsh --profile web --dump-config para confirmar que la configuración incluya michengai-simplify, y dime cómo recargar DSH y comenzar a usarlo.
```

### Instalación manual desde npm

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

dsh plugin --profile web add @michengai/dsh-simplify@1.0.9 --registry=https://registry.npmjs.org/
```

<details>
<summary>Instalación desde paquete local</summary>

Descarga el archivo tgz publicado desde [GitHub Release](https://github.com/MichengAI/dsh-simplify/releases/tag/v1.0.9), y ejecuta en el directorio correspondiente:

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

dsh plugin --profile web add .\michengai-dsh-simplify-1.0.9.tgz --ignore-scripts
```

</details>

### Recarga y confirmación

Instala o actualiza una vez finalizada la tarea actual. Si no se refleja, utiliza la opción de recarga de la aplicación o reinicia `dsh web`.

## Uso

En una conversación vinculada a un repositorio Git, ejecuta:

```text
/simplify
```

### Opciones de alcance

| Entrada | Alcance |
| --- | --- |
| `/simplify` | Cambios netos desde HEAD al espacio de trabajo actual (incluye archivos no rastreados). Si no hay cambios, revisa la última confirmación |
| `/simplify --staged` | Solo el área de preparación (staged). Se rechaza si los archivos staged tienen cambios no preparados |
| `/simplify --ref=main` | Diferencias entre la confirmación indicada y el espacio de trabajo actual (incluye archivos no rastreados) |
| `/simplify --ref HEAD` | Alcance explícito de HEAD sin revisión retrospectiva de la confirmación anterior |
| `/simplify src/a.ts "src/archivo con espacio.ts"` | Solo los archivos especificados (los no rastreados se revisan por completo) |
| `/simplify src` | Despliega los archivos modificados dentro del directorio |
| `/simplify -- --especial.ts` | El terminador `--` permite rutas que comiencen con guion |

## Solución de problemas

**Al pulsar Enter se borra el texto pero no hay respuesta**: Una revisión vacía no invocará al Agent. Si no hay cambios o los archivos modificados carecen de líneas operables, no se realiza ninguna petición.

**El directorio actual no es un repositorio Git**: Ejecuta el comando en una sesión vinculada a un repositorio Git válido o inicialízalo previamente.

**Los archivos en preparación tienen modificaciones pendientes**: Guarda o prepara esos cambios antes de usar `--staged`, o ejecuta `/simplify` sin parámetros para revisar el espacio de trabajo actual.

**Tiempo de espera agotado o instantánea caducada**: Acota el alcance mediante rutas específicas y vuelve a intentarlo tras concluir las ediciones en paralelo.

## Límites de ejecución

El plugin solo realiza consultas de solo lectura en Git y lectura de archivos locales; no ejecuta automáticamente `git add`, `commit`, `reset` ni `stash`.

El alcance de modificación es una restricción a nivel de prompt para el Agent, no un aislamiento físico del sistema de archivos.

## Desinstalación

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

dsh plugin --profile web remove @michengai/dsh-simplify
```

> Para guías de desarrollo y verificación, consulte la versión en [简体中文](README.zh-CN.md#二次开发) o [English](README.en.md#development).

## Licencia

[Apache-2.0](LICENSE)，Copyright 2026 MichengAI。
