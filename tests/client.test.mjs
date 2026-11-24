import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const enhanceIcon = () => null;

function loadClient(icons = { IconEnhanceOutlineRegular: enhanceIcon }) {
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

function host(commandUi, locale) {
  return {
    get: name => {
      if (name === 'commandUi') return commandUi;
      if (name === 'locale' && locale) return { snapshot: { active: locale } };
      return undefined;
    },
    effect: callback => callback(),
  };
}

test('中文界面显示中文标题和说明，不改语法提示和其他命令', async () => {
  const client = loadClient();
  const keep = () => null;
  const hint = '[--staged] [--ref=<ref>] [--] [<paths>...]';
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
  for (const locale of [undefined, 'zh-CN', 'zh_CN']) {
    client.apply(host(commandUi, locale));
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
  const hint = '[--staged] [--ref=<ref>] [--] [<paths>...]';
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
  for (const locale of ['en-US', 'en_US', 'en']) {
    client.apply(host(commandUi, locale));
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

test('全量 8 门官方语言及回退策略正确呈现对应文案', async () => {
  const client = loadClient();
  const cases = [
    { locale: 'ja-JP', expected: { label: '簡素化', description: '最近の変更コードを簡素化し、機能を維持しながら変更範囲を限定' } },
    { locale: 'es-ES', expected: { label: 'Simplificar', description: 'Simplifica los cambios recientes de código, preservando el comportamiento y limitando el alcance.' } },
    { locale: 'fr-FR', expected: { label: 'Simplifier', description: 'Simplifier les modifications récentes du code, préserver le comportement et limiter la portée.' } },
    { locale: 'de-DE', expected: { label: 'Vereinfachen', description: 'Kürzliche Codeänderungen vereinfachen, Verhalten beibehalten und Bearbeitungsbereich einschränken.' } },
    { locale: 'ru-RU', expected: { label: 'Упростить', description: 'Упростить недавние изменения кода с сохранением поведения и ограничением области правок.' } },
    { locale: 'pt-BR', expected: { label: 'Simplificar', description: 'Simplificar alterações recentes de código, preservando o comportamento e limitando o escopo.' } },
    { locale: 'it-IT', expected: { label: 'Simplify', description: 'Simplify recent code changes, preserve behavior, and limit the edit scope.' } }, // 未知语言回退英文
  ];
  for (const { locale, expected } of cases) {
    const commandUi = { candidates: async () => ([{ name: 'simplify' }]) };
    client.apply(host(commandUi, locale));
    const rows = await commandUi.candidates();
    assert.equal(rows[0].label, expected.label, locale);
    assert.equal(rows[0].description, expected.description, locale);
  }
});

test('宿主没有 Enhance 图标时仍补标题', async () => {
  const client = loadClient({});
  const commandUi = { candidates: async () => ([{ name: 'simplify' }]) };
  client.apply(host(commandUi));
  const rows = await commandUi.candidates();
  assert.equal(rows[0].icon, undefined);
  assert.equal(rows[0].label, '简化');
});

test('卸载后恢复原始 candidates', async () => {
  const client = loadClient();
  const original = async () => ([{ name: 'simplify' }]);
  const commandUi = { candidates: original };
  const dispose = client.apply(host(commandUi));
  assert.notEqual(commandUi.candidates, original);
  assert.equal(typeof dispose, 'function');
  dispose();
  assert.equal(commandUi.candidates, original);
});

test('commandUi 未就绪时不静默失效，服务出现后再装饰', async () => {
  const client = loadClient();
  const rows = () => ([{ name: 'simplify', description: '宿主说明', hint: 'x' }]);
  const commandUi = { candidates: async () => rows() };
  let pending;
  const injected = [];
  const ctx = {
    // 模拟真实时序：apply 时 commandUi 还不存在
    get: name => (name === 'commandUi' ? undefined : undefined),
    effect: callback => callback(),
    inject: (deps, callback) => {
      injected.push([...deps]);
      pending = callback;
    },
  };
  client.apply(ctx);
  assert.deepEqual(injected, [['commandUi']]);
  assert.equal(typeof pending, 'function');

  // 服务就绪后回调，此时注入上下文才看得到 commandUi
  const scope = {
    get: name => (name === 'commandUi' ? commandUi : undefined),
    effect: callback => callback(),
  };
  pending(scope);
  const decorated = await commandUi.candidates();
  assert.equal(decorated[0].icon, enhanceIcon);
  assert.equal(decorated[0].label, '简化');
  assert.equal(decorated[0].description, '简化最近改动的代码，保持功能并限定修改范围');
  assert.equal(decorated[0].hint, 'x');
});

test('服务重建后重复注入不会多层包裹', async () => {
  const client = loadClient();
  let calls = 0;
  const commandUi = {
    candidates: async () => {
      calls += 1;
      return [{ name: 'simplify' }];
    },
  };
  const callbacks = [];
  const scope = {
    get: name => (name === 'commandUi' ? commandUi : undefined),
    effect: callback => callback(),
  };
  client.apply({ get: () => undefined, inject: (deps, callback) => callbacks.push(callback) });
  callbacks[0](scope);
  const afterFirst = commandUi.candidates;
  callbacks[0](scope);
  // 同一服务再次注入时不得再包一层（输出相同，但引用必须不变）。
  assert.equal(commandUi.candidates, afterFirst);
  const decorated = await commandUi.candidates();
  assert.equal(calls, 1);
  assert.equal(decorated.length, 1);
  assert.equal(decorated[0].label, '简化');
  assert.equal(decorated[0].icon, enhanceIcon);
});

test('inject 模式下 apply 返回可调用的注销函数，卸载时恢复原始 candidates', async () => {
  const client = loadClient();
  const original = async () => ([{ name: 'simplify' }]);
  const commandUi = { candidates: original };
  let uninjectCalled = false;
  let injectedCallback;
  const ctx = {
    get: () => undefined,
    inject: (deps, callback) => {
      injectedCallback = callback;
      return () => {
        uninjectCalled = true;
      };
    },
  };
  const dispose = client.apply(ctx);
  assert.equal(typeof dispose, 'function', 'apply 在 inject 模式下必须返回清理函数');

  const scope = {
    get: name => (name === 'commandUi' ? commandUi : undefined),
    effect: callback => {
      const cleaner = callback();
      return cleaner;
    },
  };
  injectedCallback(scope);
  assert.notEqual(commandUi.candidates, original);

  dispose();
  assert.equal(uninjectCalled, true, '必须调用 inject 返回的卸载函数');
});

test('宿主 locale 服务通过 getSnapshot 方法提供语言时也能准确识别', async () => {
  const client = loadClient();
  const commandUi = { candidates: async () => ([{ name: 'simplify' }]) };
  const hostWithGetSnapshot = {
    get: name => {
      if (name === 'commandUi') return commandUi;
      if (name === 'locale') return { getSnapshot: () => ({ active: 'ja-JP' }) };
      return undefined;
    },
    effect: callback => callback(),
  };
  client.apply(hostWithGetSnapshot);
  const rows = await commandUi.candidates();
  assert.equal(rows[0].label, '簡素化');
  assert.equal(rows[0].description, '最近の変更コードを簡素化し、機能を維持しながら変更範囲を限定');
});
