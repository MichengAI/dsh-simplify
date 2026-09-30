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

test('中文界面显示中文标题和说明，不改语法提示和其他命令', async () => {
  const client = loadClient();
  const keep = () => null;
  const hint = '[--staged] [--ref=<ref>] [--] [文件或目录...]';
  let active;
  const commandUi = {
    candidates: async () => ([
      { name: 'compact', description: '压缩以上对话内容', icon: keep, label: '压缩' },
      {
        name: 'simplify',
        label: 'Simplify',
        description: 'Simplify recent code changes, preserve behavior, and limit the edit scope.',
        hint,
      },
      { name: 'other', description: '其他' },
    ]),
  };
  client.apply({
    get: name => name === 'locale' && active ? { snapshot: { active } } : undefined,
    inject: (_deps, callback) => callback({ get: () => commandUi }),
  });
  for (const locale of [undefined, 'zh-CN', 'zh_CN']) {
    active = locale;
    const rows = await commandUi.candidates();
    assert.equal(rows[0].icon, keep, String(locale));
    assert.equal(rows[0].label, '压缩', String(locale));
    assert.equal(rows[0].description, '压缩以上对话内容', String(locale));
    assert.equal(rows[1].icon, enhanceIcon, String(locale));
    assert.equal(rows[1].label, '简化', String(locale));
    assert.equal(rows[1].description, '简化最近改动的代码，保持功能并限定修改范围', String(locale));
    assert.equal(rows[1].hint, hint, String(locale));
    assert.equal(rows[2].icon, undefined, String(locale));
    assert.equal(rows[2].label, undefined, String(locale));
    assert.equal(rows[2].description, '其他', String(locale));
  }
});

test('英文界面替换中文目录说明，不改语法提示、已有图标和其他命令', async () => {
  const client = loadClient();
  const keep = () => null;
  const hint = '[--staged] [--ref=<ref>] [--] [文件或目录...]';
  let active = 'en-US';
  const commandUi = {
    candidates: async () => ([
      { name: 'compact', description: '压缩以上对话内容', label: '压缩' },
      {
        name: 'simplify',
        icon: keep,
        label: '简化',
        description: '简化最近改动的代码，保持功能并限定修改范围',
        hint,
      },
      { name: 'other', description: '其他' },
    ]),
  };
  client.apply({
    get: name => name === 'locale' ? { snapshot: { active } } : undefined,
    inject: (_deps, callback) => callback({ get: () => commandUi }),
  });
  for (const locale of ['en-US', 'en_US', 'en']) {
    active = locale;
    const rows = await commandUi.candidates();
    assert.equal(rows[0].label, '压缩', locale);
    assert.equal(rows[0].description, '压缩以上对话内容', locale);
    assert.equal(rows[1].icon, keep, locale);
    assert.equal(rows[1].label, 'Simplify', locale);
    assert.equal(rows[1].description, 'Simplify recent code changes, preserve behavior, and limit the edit scope.', locale);
    assert.equal(rows[1].hint, hint, locale);
    assert.equal(rows[2].label, undefined, locale);
    assert.equal(rows[2].description, '其他', locale);
  }
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
