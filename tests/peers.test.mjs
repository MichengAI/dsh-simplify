import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const peers = manifest.peerDependencies;
const dev = manifest.devDependencies;
const host = '0.2.0-rc.1 || 0.2.0-rc.2 || 0.2.1-rc.1';

test('宿主兼容列表只保留 0.2.0 以后的 rc，开发依赖钉到 0.2.1-rc.1', () => {
  for (const name of ['@deepseek-ai/dsh-commands', '@deepseek-ai/dsh-llm', '@deepseek-ai/dsh-subprocess', '@deepseek-ai/dsh-client-ui-commands', '@deepseek-ai/dsh-client-ui-primitives']) {
    assert.equal(peers[name], host);
  }
  for (const name of ['@deepseek-ai/dsh-commands', '@deepseek-ai/dsh-llm', '@deepseek-ai/dsh-subprocess', '@deepseek-ai/dsh-client-ui-commands', '@deepseek-ai/dsh-client-ui-primitives', '@deepseek-ai/dsh-subprocess-local']) {
    assert.equal(dev[name], '0.2.1-rc.1');
  }
  assert.equal(dev['@deepseek-ai/cordis'], '4.0.5');
  assert.equal(peers['@deepseek-ai/cordis'], '>=4.0.4 <5');
  const declared = Object.values(peers).join(' ');
  assert.equal(declared.includes('0.1.'), false);
  assert.equal(declared.includes('alpha'), false);
  assert.equal(declared.includes('0.2.1-rc.1'), true);
});
