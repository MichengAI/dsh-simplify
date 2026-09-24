import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const peers = manifest.peerDependencies;
const dev = manifest.devDependencies;
const host = '0.1.0-rc.8 || 0.1.1-rc.2 || 0.1.2-rc.1 || 0.1.5-rc.1 || 0.1.5-rc.2 || 0.1.7-rc.1 || 0.1.7-rc.2';
const client = '0.1.7-rc.1 || 0.1.7-rc.2';

test('宿主兼容列表只保留 RC，并把开发和 peer 钉到 0.1.7-rc.2', () => {
  for (const name of ['@deepseek-ai/dsh-commands', '@deepseek-ai/dsh-llm', '@deepseek-ai/dsh-subprocess']) {
    assert.equal(peers[name], host);
    assert.equal(dev[name], '0.1.7-rc.2');
  }
  for (const name of ['@deepseek-ai/dsh-client-ui-commands', '@deepseek-ai/dsh-client-ui-primitives']) {
    assert.equal(peers[name], client);
    assert.equal(dev[name], '0.1.7-rc.2');
  }
  assert.equal(dev['@deepseek-ai/dsh-subprocess-local'], '0.1.7-rc.2');
  assert.equal(dev['@deepseek-ai/cordis'], '4.0.4');
  assert.equal(peers['@deepseek-ai/cordis'], '^4.0.2');
  const declared = Object.values(peers).join(' ');
  assert.equal(declared.includes('alpha'), false);
});
