## 简体中文

- 插件版本从 `1.0.0` 起计。支持的宿主为 DeepSeek Harness `0.2.0-rc.1`、`0.2.0-rc.2`、`0.2.1-rc.1`。
- 不再支持 `0.2.0` 之前的宿主，也不再支持中间的 `0.2.1-alpha.1` 至 `0.2.1-alpha.5`。这些宿主启动时会被版本门拒绝，插件不会运行；已保存的配置仍保留。仍在使用 `0.1.x` 的，请安装插件 `0.1.16`，不要装 `@latest`。
- 斜杠菜单图标改用宿主导出的 `IconEnhanceOutlineRegular`。`0.2.0-rc.1` 起已没有 `IconEnhanceOutline16`。

## English

- Plugin version starts at `1.0.0`. Supported hosts are DeepSeek Harness `0.2.0-rc.1`, `0.2.0-rc.2`, and `0.2.1-rc.1`.
- Hosts before `0.2.0`, and intermediate `0.2.1-alpha.1` through `0.2.1-alpha.5`, are rejected by the version gate. The plugin stays installed but does not run; saved configuration is kept. If you still use a `0.1.x` host, install plugin `0.1.16` instead of `@latest`.
- Slash-menu icon uses the host export `IconEnhanceOutlineRegular`. `IconEnhanceOutline16` is not present from `0.2.0-rc.1` onward.
