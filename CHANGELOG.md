# Changelog

[简体中文](CHANGELOG.zh-CN.md)

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
