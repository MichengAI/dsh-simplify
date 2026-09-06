<div align="center">

# DSH Simplify

**Simplify recently changed code in DeepSeek Harness while preserving behavior.**

[简体中文](README.zh-CN.md) · [Installation](#installation) · [Usage](#usage) · [Troubleshooting](#troubleshooting) · [Changelog](CHANGELOG.md) · [Apache-2.0](LICENSE)

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![DSH Web Plugin](https://img.shields.io/badge/DSH%20Web-Plugin-0f766e.svg)](https://github.com/deepseek-ai/deepseek-harness)
[![Node.js 22.19+](https://img.shields.io/badge/Node.js-22.19%2B-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

DSH Simplify collects changed files, line ranges, and content snapshots from Git when you run `/simplify`. The current Agent then improves clarity within that scope while preserving functionality.

This is a community-maintained plugin, not an official DeepSeek AI product. It supports DSH Web and desktop apps that include DSH Web.

The plugin has its own review prompt, patch-body parser, Git collection, and DSH integration. Command messages and prompts are in Simplified Chinese.

## Features

- **Scoped review**: current changes, staged changes, a specified commit, or selected files and directories.
- **New files**: review untracked files in full, including repositories without an initial commit.
- **Cross-platform paths**: Git argument arrays and NUL-delimited parsing support Chinese characters, spaces, and quotes in file names.
- **Bounded execution**: Git errors, cancellation, timeouts, truncated output, and conflicts prevent incomplete reviews from being queued.
- **Staged consistency**: reject selected staged files that also have unstaged changes to avoid mismatched line numbers.
- **Snapshot checks**: verify HEAD, the index, and content hashes before queuing; ask the Agent to check again before editing.
- **Previous-commit review**: only the default mode may fall back to HEAD compared with its first parent.

## Installation

Requires Node.js >= 22.19, Git on PATH, and DSH `0.1.2-rc.1` with the `commands` and `subprocess` services. The session must have a local Git working directory. Tested on Windows; Linux and macOS have not been verified on those systems.

Version `0.1.0` is a local preview. **It is not published to npm and has no formal GitHub Release.** The examples use the `web` profile; replace it for your environment.

### From Source

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

git clone https://github.com/MichengAI/dsh-simplify.git
Set-Location dsh-simplify
npm ci --ignore-scripts
npm run check
dsh plugin --profile web add . --ignore-scripts
```

The entry point is `lib/index.js`, so build before installing. Keep the source directory when the profile uses a local link. Disable other plugins that register `/simplify` before installation.

### From a Local Package

Run `npm pack` in the source directory to generate a tgz, then run this from the package directory:

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

dsh plugin --profile web add .\michengai-dsh-simplify-0.1.0.tgz --ignore-scripts
```

### After npm Publication

The following command is for a future npm release. It is not currently an installation path for a published package:

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
dsh plugin --profile web add @michengai/dsh-simplify@latest --registry=https://registry.npmjs.org/
```

### Reload and Verify

Install or update after the current task finishes, since desktop apps may reload automatically. If the plugin does not take effect, use the desktop app's reload action or restart `dsh web`; refreshing the browser alone is insufficient.

Run `dsh --profile web --dump-config` and confirm that it includes `michengai-simplify`. Check for sensitive settings before sharing the full configuration. Then enter `/simplify` in a session associated with a Git project.

## Usage

| Input | Scope |
| --- | --- |
| `/simplify` | Net changes from HEAD to the working tree, including untracked files; fall back to the last commit only when there are no changes |
| `/simplify --staged` | Staged changes only; reject selected staged files that also have unstaged changes |
| `/simplify --ref=main` | The specified commit to the working tree, including untracked files; no fallback |
| `/simplify --ref HEAD` | Explicit HEAD scope without previous-commit fallback |
| `/simplify src/a.ts "src/中文 文件.ts"` | Changes in selected files; review untracked files in full |
| `/simplify src` | Expand changed files within a directory |
| `/simplify -- --special.ts` | Use the option terminator for paths starting with a hyphen |

- Paths are relative to the session directory. Absolute paths inside the repository are supported; prompts use paths relative to the repository root.
- Single and double quotes group paths containing spaces; backslashes remain path characters. No shell expansion, wildcard expansion, or command substitution is performed.
- `--ref` accepts branches, tags, and single-commit expressions, not `a..b` or `a...b`. It cannot be combined with `--staged`.
- New files can be reviewed before the initial commit. A clean repository with only one commit returns no changes.
- Previous-commit fallback compares HEAD with its first parent. Merge commits do not receive a multi-parent review.

## Command Results

| Result | Meaning |
| --- | --- |
| `已提交 N 个文件的简化审查` | Review of N files was queued. The Agent has not necessarily finished editing or testing. |
| `没有可简化的当前代码行` | No current lines are eligible. No model request is made; skipped-file details may be included. |
| An error message | A reliable scope could not be established. No model request is made; address the reported issue before retrying. |

## Troubleshooting

**The input clears after Enter, but no answer appears.** Empty reviews do not start the Agent. In a reported case, the backend returned success and skipped two CHANGELOG files because no eligible current lines were found. Some host interfaces do not visibly display these command results; feedback visibility is still under investigation. A successful backend response does not establish that the UI displayed it.

**The current directory is not a Git repository.** Use a session in the correct Git project, or initialize the project yourself. The plugin does not initialize repositories, stage files, or create commits.

**Staged files also have unstaged changes.** Save or resolve those changes yourself before using `--staged`, or use default `/simplify` to review net working-tree changes. The plugin does not reset or stash changes.

**The installer reports missing peer dependencies.** Official packages may be supplied by the DSH host runtime. Verify actual resolved versions and backend loading before installing duplicate host packages into the profile. Versions must still satisfy `package.json`.

**Timeout, excessive output, or an outdated snapshot.** Narrow the scope to specific files or directories and retry after concurrent edits finish.

## Execution Boundaries

The plugin performs read-only Git queries and local file reads. It does not automatically run `git add`, commit, reset, or stash. Git arguments are passed through DSH `subprocess` as `argv`, independent of PowerShell or Bash quoting rules.

Git failures, signals, cancellation, timeouts, truncated output, unresolved conflicts, and stale snapshots prevent prompt delivery. They are not interpreted as an empty diff. The patch parser counts old and new lines against each hunk header, rejects incomplete bodies, and excludes context lines from editable ranges. Explicit paths that do not exist, are ignored, or lie outside the repository return errors.

Deleted files, deletion-only hunks, rename-only changes, binary files, non-regular files, and files over 5 MiB are excluded from editable ranges with reasons. Submodules are excluded from diff collection. Skipping all detected changes does not expand the review scope. Limits are 200 changed files, 30 seconds per Git command, and 60 seconds for scope collection, with up to 1 additional second for process termination. Git stdout is capped at 8 MiB, stderr at 64 KiB, and prompts at 128 KiB.

`--staged` first checks that selected staged files match the working tree. Before queuing, the plugin rechecks the index, HEAD, and file SHA-256 hashes to avoid applying index line numbers to different working-tree content. The Agent is instructed to verify snapshots again before editing and stop simplifying a file if its content has changed, requiring a new command invocation.

**Scope is a prompt instruction, not a file-write permission boundary.** The Agent edits and tests using host tools and user authorization. This plugin does not intercept writes from other tools or guarantee that files remain unchanged after queuing. A queued review is not a completed simplification.

The implementation assumes the local filesystem and local subprocess share the same workspace. Remote subprocess and remote filesystem combinations have not been verified.

## Uninstall

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

dsh plugin --profile web remove @michengai/dsh-simplify
```

Reload DSH manually if the desktop app does not reload automatically. Uninstalling does not undo code changes already made by the Agent.

## Development and Verification

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
npm ci --ignore-scripts
npm run check
npm pack --dry-run
```

Tests use real temporary Git repositories to cover paths, untracked files, fallback, conflicts, staged mismatches, stale snapshots, and execution errors. Fixtures are created under `.test-tmp` and cleaned up on normal completion.

`tests/host.test.mjs` looks for a DSH runtime at `%USERPROFILE%\.dsh\profiles\node_modules`. Set `DSH_RUNTIME_ROOT` to use another runtime's node_modules path. When detected, it runs isolated integration checks for real service registration, Git execution, message delivery, and disposal; otherwise, that test is explicitly skipped. Tests do not call a model or modify installed profiles.

| Path | Responsibility |
| --- | --- |
| `src/args.ts` | Command argument parsing |
| `src/exec.ts` | DSH subprocess, Git failures, cancellation, and timeouts |
| `src/git.ts` | Git scope, NUL parsing, line ranges, and snapshot verification |
| `src/prompt.ts` | Editing task, scope, and verification instructions |
| `src/command.ts`, `src/index.ts` | Command handling, delivery, and lifecycle |
| `tests` | Regression and host integration checks |

## License

[Apache-2.0](LICENSE), Copyright 2026 MichengAI.
