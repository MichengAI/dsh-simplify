# Changelog

[简体中文](CHANGELOG.zh-CN.md)

## 0.1.0 (Local Preview, Unreleased)

- Add `/simplify` for current changes, staged changes, a specified commit, and explicit files or directories.
- Add a Chinese editing-task prompt with scope, behavior, snapshot, and verification requirements.
- Use DSH subprocess argument arrays and NUL-delimited parsing for Chinese characters, spaces in paths, and untracked files.
- Prevent queuing on Git failures, cancellation, timeouts, and truncation; bound file counts, content size, and prompt size.
- Add staged consistency checks, HEAD/index/content verification, and previous-commit fallback in default mode only.
- Add real Git regression tests and an optional integration test using real DSH services.
- Parse patch bodies with old/new line-count validation, excluding context lines and rejecting incomplete hunks.
- Initialize the public repository and bilingual documentation under Apache-2.0.

### Known Issues

- Some host interfaces do not visibly display the `没有可简化的当前代码行` (no eligible current lines) command result. The backend returns the result without making a model request; feedback visibility remains under investigation.
