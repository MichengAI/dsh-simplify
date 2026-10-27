# Changelog

[简体中文](CHANGELOG.zh-CN.md)

## Unreleased

## 1.0.5 - 2026-10-27

- Add custom transparent vector SVG plugin icon (`assets/icon.svg`) and configure package manifest.
- Include plugin icon asset in release distribution package whitelist.

## 1.0.4 - 2026-10-24

- Upgrade host admission policy: Declare `engines.dsh: ">=0.2.0-rc.1 <0.3.0-0"` to support the entire DeepSeek Harness `0.2.x` line (including `0.2.0-rc.1` onwards, future alphas, RCs, and stable releases) without requiring routine plugin version bumps.
- Decouple peerDependencies locks: Broaden all `@deepseek-ai/dsh-*` peer dependencies to the `0.2.x` generation range.
- Upgrade build-time development dependencies: Synchronize all `@deepseek-ai/dsh-*` devDependencies to latest `0.2.1-rc.3`.

## 1.0.3 - 2026-10-24

- Fix package-lock.json version sync in release pipeline.

## 1.0.2 - 2026-10-24

- Support DeepSeek Harness `0.2.1-rc.3` while retaining all existing supported versions.

## 1.0.1 - 2026-10-17

- Support DeepSeek Harness `0.2.1-rc.2`. Supported hosts are `0.2.0-rc.1`, `0.2.0-rc.2`, `0.2.1-rc.1`, and `0.2.1-rc.2`.
- Hosts before `0.2.0`, and `0.2.1-alpha.1` through `0.2.1-alpha.5`, are still rejected by the version gate. The plugin stays installed but does not run; saved configuration is kept. If you still use a `0.1.x` host, install plugin `0.1.16` instead of `@latest`.

## 1.0.0 - 2026-10-17

- Plugin version starts at `1.0.0`. Supported hosts are DeepSeek Harness `0.2.0-rc.1`, `0.2.0-rc.2`, and `0.2.1-rc.1`.
- Hosts before `0.2.0`, and intermediate `0.2.1-alpha.1` through `0.2.1-alpha.5`, are rejected by the version gate. The plugin stays installed but does not run; saved configuration is kept. If you still use a `0.1.x` host, install plugin `0.1.16` instead of `@latest`.
- Slash-menu icon uses the host export `IconEnhanceOutlineRegular`. `IconEnhanceOutline16` is not present from `0.2.0-rc.1` onward.

## 0.1.16 - 2026-10-15

- Support DSH `0.2.1-alpha.3` while retaining all existing supported versions; pin development `@deepseek-ai/dsh*` dependencies to host `0.2.1-alpha.3` and Cordis to `4.0.5-alpha.2`.
- No production plugin API breaks for this release (peer / documentation / development dependency alignment only).

## 0.1.15 - 2026-10-12

- Support DSH `0.2.1-alpha.2` while retaining all existing supported versions.

## 0.1.14 - 2026-10-06

- The installed-plugin list shows “Simplify” and a localized description instead of the package name. Titles and descriptions come from `meta.title` and `meta.description` in `locale/zh.json` and `locale/en.json`.
- Installing from GitHub now includes the compiled runtime, so no manual build is required.

## 0.1.13 - 2026-09-30

- Slash-menu title and description follow the host language instead of the Chinese registry string. The syntax hint is unchanged.

## 0.1.12 - 2026-09-30

- Support DSH `0.2.0-rc.2` while retaining `0.2.0-rc.1`, `0.1.7-rc.2`, `0.1.7-rc.1`, `0.1.5-rc.3`, `0.1.5-rc.2`, `0.1.5-rc.1`, and `0.1.2-rc.1`.
- The declared host range includes `0.1.5-rc.3` and no longer lists `0.1.0-rc.8` or `0.1.1-rc.2`.

## 0.1.11 - 2026-09-28

- Support DSH `0.2.0-rc.1` while retaining compatibility with `0.1.7-rc.2`, `0.1.7-rc.1`, `0.1.0-rc.8`, `0.1.1-rc.2`, `0.1.2-rc.1`, `0.1.5-rc.1`, and `0.1.5-rc.2`.

## 0.1.10 - 2026-09-25

- Support DSH `0.1.7-rc.2` while retaining compatibility with `0.1.7-rc.1`, `0.1.0-rc.8`, `0.1.1-rc.2`, `0.1.2-rc.1`, `0.1.5-rc.1`, and `0.1.5-rc.2`.

## 0.1.9 - 2026-09-24

- Support DSH `0.1.7-rc.1` while retaining compatibility with `0.1.0-rc.8`, `0.1.1-rc.2`, `0.1.2-rc.1`, `0.1.5-rc.1`, and `0.1.5-rc.2`.
- Drop alpha hosts from the compatibility list.

## 0.1.8 - 2026-09-22

- Support DSH `0.1.7-alpha.1` while retaining compatibility with `0.1.0-rc.8`, `0.1.1-rc.2`, `0.1.2-rc.1`, `0.1.5-rc.1`, `0.1.5-rc.2`, `0.1.6-alpha.1`, and `0.1.6-alpha.2`.
- Queue simplification with a producer-owned message source so DSH 0.1.7 accepts it, and keep that same source on earlier hosts.
- Use whichever Enhance icon the installed host exports, including the icon renamed in 0.1.7.

## 0.1.7 - 2026-09-18

- Show the official Enhance icon and a Simplify/简化 title on the `/simplify` slash-menu row, matching commands such as BTW and review.
- Use a bilingual package description so the plugin manager matches the GitHub About text.

## 0.1.6 - 2026-09-18

- Support DSH `0.1.6-alpha.2` while retaining compatibility with `0.1.0-rc.8`, `0.1.1-rc.2`, `0.1.2-rc.1`, `0.1.5-rc.1`, `0.1.5-rc.2`, and `0.1.6-alpha.1`.

## 0.1.5 - 2026-09-16

- Support DSH `0.1.6-alpha.1` while retaining compatibility with `0.1.0-rc.8`, `0.1.1-rc.2`, `0.1.2-rc.1`, `0.1.5-rc.1`, and `0.1.5-rc.2`.

## 0.1.4 - 2026-09-11

- Support DSH `0.1.5-rc.2` while retaining compatibility with `0.1.0-rc.8`, `0.1.1-rc.2`, `0.1.2-rc.1`, and `0.1.5-rc.1`.

## 0.1.3 - 2026-09-10

- Support DSH `0.1.5-rc.1`, with compatibility for `0.1.0-rc.8`, `0.1.1-rc.2`, and `0.1.2-rc.1`.

## 0.1.2 - 2026-09-06

- Fix inherited Git environment settings selecting the wrong repository or staging area, including in linked worktrees.
- Stop collecting excessively fragmented changes or oversized review lists early and ask for a narrower scope.
- Clarify that new files before the initial commit are eligible for whole-file simplification.

### Known Issues

- When there are no eligible code lines to simplify, the Agent does not start. Some host interfaces may not display the result, making the command appear unresponsive.

## 0.1.1 - 2026-09-06

- Update the documentation in the package to focus on features, usage scope, and known issues. Code simplification behavior is unchanged from `0.1.0`.

### Known Issues

- When there are no eligible code lines to simplify, the Agent does not start. Some host interfaces may not display the result, making the command appear unresponsive.

## 0.1.0 - 2026-09-06

- Add `/simplify` to ask the current Agent to simplify code and improve readability while preserving existing behavior.
- Support current changes, staged changes only, changes relative to a specified commit, and selected files or directories.
- Support untracked new files and file paths containing Chinese characters or spaces.
- In default mode, review the most recent commit when there are no current changes.
- Stop the task if Git fails, times out, returns incomplete output, or files change during collection. Retry with a smaller scope or after editing has finished.
- In staged-only mode, ask you to resolve any unstaged changes in the selected files before proceeding.

### Known Issues

- When there are no eligible code lines to simplify, the Agent does not start. Some host interfaces may not display the result, making the command appear unresponsive.
