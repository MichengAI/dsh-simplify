import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const enhanceIcon = () => null;

function loadClient(icons = { IconEnhanceOutline16: enhanceIcon }) {
  let contribution;
  runInNewContext(readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8'), {
    window: { __ModuleLoader__: { load: value => { contribution = value; } } },
  });
  assert.equal(contribution.id, '@michengai/dsh-simplify');
  return contribution.factory(name => {
    if (name === '@deepseek-ai/dsh-client-ui-primitives') return icons;
    throw new Error(`unexpected client require: ${name}`);
  });
}

test('斜杠菜单为 /simplify 补官方图标和中文标题，不覆盖已有字段', async () => {
  const client = loadClient();
  const keep = () => null;
  const commandUi = {
    candidates: async () => ([
      { name: 'compact', description: '压缩以上对话内容', icon: keep, label: '压缩' },
      { name: 'simplify', description: '简化最近改动的代码，保持功能并限定修改范围' },
      { name: 'other', description: '其他' },
    ]),
  };
  client.apply({
    inject: (_deps, callback) => callback({ get: () => commandUi }),
  });
  const rows = await commandUi.candidates();
  assert.equal(rows[0].icon, keep);
  assert.equal(rows[0].label, '压缩');
  assert.equal(rows[1].icon, enhanceIcon);
  assert.equal(rows[1].label, '简化');
  assert.equal(rows[1].description, '简化最近改动的代码，保持功能并限定修改范围');
  assert.equal(rows[2].icon, undefined);
  assert.equal(rows[2].label, undefined);
});

test('英文界面使用 Simplify 标题', async () => {
  const client = loadClient();
  const commandUi = { candidates: async () => ([{ name: 'simplify' }]) };
  client.apply({
    get: name => name === 'locale' ? { snapshot: { active: 'en-US' } } : undefined,
    inject: (_deps, callback) => callback({ get: () => commandUi }),
  });
  const rows = await commandUi.candidates();
  assert.equal(rows[0].label, 'Simplify');
  assert.equal(rows[0].icon, enhanceIcon);
});

test('0.1.7 仅提供 Regular 图标时仍补到斜杠菜单', async () => {
  const regular = () => null;
  const client = loadClient({ IconEnhanceOutlineRegular: regular });
  const commandUi = { candidates: async () => ([{ name: 'simplify' }]) };
  client.apply({ inject: (_deps, callback) => callback({ get: () => commandUi }) });
  const rows = await commandUi.candidates();
  assert.equal(rows[0].icon, regular);
  assert.equal(rows[0].label, '简化');
});

test('新旧图标同时存在时沿用 16 导出', async () => {
  const legacy = () => null;
  const regular = () => null;
  const client = loadClient({ IconEnhanceOutline16: legacy, IconEnhanceOutlineRegular: regular });
  const commandUi = { candidates: async () => ([{ name: 'simplify' }]) };
  client.apply({ inject: (_deps, callback) => callback({ get: () => commandUi }) });
  const rows = await commandUi.candidates();
  assert.equal(rows[0].icon, legacy);
});

test('宿主没有 Enhance 图标时仍补标题', async () => {
  const client = loadClient({});
  const commandUi = { candidates: async () => ([{ name: 'simplify' }]) };
  client.apply({ inject: (_deps, callback) => callback({ get: () => commandUi }) });
  const rows = await commandUi.candidates();
  assert.equal(rows[0].icon, undefined);
  assert.equal(rows[0].label, '简化');
});

test('卸载后恢复原始 candidates', async () => {
  const client = loadClient();
  const original = async () => ([{ name: 'simplify' }]);
  const commandUi = { candidates: original };
  const dispose = client.apply({
    inject: (_deps, callback) => callback({ get: () => commandUi }),
  });
  assert.notEqual(commandUi.candidates, original);
  assert.equal(typeof dispose, 'function');
  dispose();
  assert.equal(commandUi.candidates, original);
});
