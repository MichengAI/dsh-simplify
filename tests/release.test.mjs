// 通过实际发布入口验证日期门禁，夹具不修改仓库的未发布记录。
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { repo } from './fixture.mjs';

const script = fileURLToPath(new URL('../.github/scripts/verify-release.mjs', import.meta.url));

for (const [label, zhDate, enDate, expected] of [
  ['有效日期', '2026-09-10', '2026-09-10', null],
  ['有效闰日', '2024-02-29', '2024-02-29', null],
  ['未发布记录', '未发布', 'Unreleased', /发布日期/],
  ['英文未发布记录', '2026-09-10', 'Unreleased', /发布日期/],
  ['不存在的日期', '2026-02-30', '2026-02-30', /发布日期/],
  ['日期格式错误', '2026-9-10', '2026-9-10', /发布日期/],
  ['双语日期不一致', '2026-09-10', '2026-09-11', /日期不一致/],
]) {
  test(`发布校验：${label}`, () => {
    const { cwd, write } = repo();
    write('package.json', JSON.stringify({ name: 'release-fixture', version: '0.1.3' }));
    write('package-lock.json', JSON.stringify({ version: '0.1.3', packages: { '': { version: '0.1.3' } } }));
    write('CHANGELOG.zh-CN.md', `## 0.1.3 - ${zhDate}\n\n- 修复。\n`);
    write('CHANGELOG.md', `## 0.1.3 - ${enDate}\n\n- Fix.\n`);
    write('event.json', JSON.stringify({ release: {
      tag_name: 'v0.1.3', prerelease: false,
      body: '## 简体中文\n\n- 修复。\n\n## English\n\n- Fix.',
    } }));
    const result = spawnSync(process.execPath, [script], {
      cwd, encoding: 'utf8', env: { ...process.env, GITHUB_EVENT_PATH: join(cwd, 'event.json') },
    });
    assert.ifError(result.error);
    if (expected) {
      assert.equal(result.status, 1, result.stdout + result.stderr);
      assert.match(result.stderr, expected);
    } else {
      assert.equal(result.status, 0, result.stdout + result.stderr);
    }
  });
}
