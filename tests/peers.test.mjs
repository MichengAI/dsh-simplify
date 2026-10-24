import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import semver from 'semver';

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const peers = manifest.peerDependencies;
const dev = manifest.devDependencies;
const host = '>=0.2.0-rc.1 <0.3.0-0';

test('宿主兼容列表放开至 0.2.x 代际范围，开发依赖钉到 0.2.1-rc.3', () => {
  assert.equal(manifest.engines?.dsh, host);
  for (const name of ['@deepseek-ai/dsh-commands', '@deepseek-ai/dsh-llm', '@deepseek-ai/dsh-subprocess', '@deepseek-ai/dsh-client-ui-commands', '@deepseek-ai/dsh-client-ui-primitives']) {
    assert.equal(peers[name], host);
  }
  for (const v of ['0.2.0-rc.1', '0.2.0-rc.2', '0.2.1-rc.1', '0.2.1-rc.2', '0.2.1-rc.3', '0.2.1-rc.4', '0.2.2-alpha.1', '0.2.2-rc.1', '0.2.9']) {
    assert.ok(semver.satisfies(v, host, { includePrerelease: true }), `放行 0.2.x 版本 ${v}`);
  }
  for (const v of ['0.1.7-rc.2', '0.2.0-alpha.1', '0.3.0-alpha.1', '0.3.0-rc.1', '0.3.0', '1.0.0']) {
    assert.equal(semver.satisfies(v, host, { includePrerelease: true }), false, `拦截范围外版本 ${v}`);
  }
  for (const name of ['@deepseek-ai/dsh-commands', '@deepseek-ai/dsh-llm', '@deepseek-ai/dsh-subprocess', '@deepseek-ai/dsh-client-ui-commands', '@deepseek-ai/dsh-client-ui-primitives', '@deepseek-ai/dsh-subprocess-local']) {
    assert.equal(dev[name], '0.2.1-rc.3');
  }
  assert.equal(dev['@deepseek-ai/cordis'], '4.0.5');
  assert.equal(peers['@deepseek-ai/cordis'], '>=4.0.4 <5');
});
