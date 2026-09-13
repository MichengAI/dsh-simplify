// 发布前核对标签、包版本及双语说明，避免发布错误版本或不完整的公开说明。
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8").replace(/\r\n/g, "\n");
const pkg = JSON.parse(read("package.json"));
const lock = JSON.parse(read("package-lock.json"));
assert.equal(process.env.GITHUB_REF_TYPE, "tag", "必须从版本标签发布");
assert.match(pkg.version, /^\d+\.\d+\.\d+$/, "此流程仅发布正式版本");
assert.equal(
  process.env.GITHUB_REF_NAME,
  `v${pkg.version}`,
  "Release 标签与包版本不一致",
);
assert.equal(lock.version, pkg.version, "锁文件版本不一致");
assert.equal(lock.packages[""].version, pkg.version, "锁文件根包版本不一致");

function section(path) {
  const lines = read(path).split("\n");
  const start = lines.findIndex((line) =>
    line.startsWith(`## ${pkg.version} - `),
  );
  assert.ok(start >= 0, `${path} 缺少当前版本记录`);
  const date = lines[start].slice(`## ${pkg.version} - `.length);
  assert.match(
    date,
    /^\d{4}-\d{2}-\d{2}$/,
    `${path} 发布日期必须为 YYYY-MM-DD，不能保留未发布标记`,
  );
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  assert.ok(
    Number.isFinite(timestamp) &&
      new Date(timestamp).toISOString().slice(0, 10) === date,
    `${path} 发布日期无效`,
  );
  const remaining = lines.slice(start + 1);
  const end = remaining.findIndex((line) => line.startsWith("## "));
  const content = (end < 0 ? remaining : remaining.slice(0, end))
    .join("\n")
    .trim();
  assert.ok(content.length > 0, `${path} 当前版本说明为空`);
  return { date, content };
}

const zh = section("CHANGELOG.zh-CN.md");
const en = section("CHANGELOG.md");
assert.equal(zh.date, en.date, "双语 CHANGELOG 发布日期不一致");
const expected = `## 简体中文\n\n${zh.content}\n\n## English\n\n${en.content}`;
writeFileSync("release-notes.md", `${expected}\n`, "utf8");
console.log(`版本及双语说明检查通过：${pkg.name}@${pkg.version}`);
