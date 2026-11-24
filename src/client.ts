import { IconEnhanceOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives';

export type SupportedLocale = 'zh' | 'en' | 'ja' | 'es' | 'fr' | 'de' | 'ru' | 'pt';

/** Host `/` 行没有可本地化的说明；同名贡献会撞车，只能在每次 candidates 上覆盖 /simplify。 */
const FACE: {
  icon: typeof IconEnhanceOutlineRegular;
} & Record<SupportedLocale, { label: string; description: string }> = {
  icon: IconEnhanceOutlineRegular,
  zh: { label: '简化', description: '简化最近改动的代码，保持功能并限定修改范围' },
  en: { label: 'Simplify', description: 'Simplify recent code changes, preserve behavior, and limit the edit scope.' },
  ja: { label: '簡素化', description: '最近の変更コードを簡素化し、機能を維持しながら変更範囲を限定' },
  es: { label: 'Simplificar', description: 'Simplifica los cambios recientes de código, preservando el comportamiento y limitando el alcance.' },
  fr: { label: 'Simplifier', description: 'Simplifier les modifications récentes du code, préserver le comportement et limiter la portée.' },
  de: { label: 'Vereinfachen', description: 'Kürzliche Codeänderungen vereinfachen, Verhalten beibehalten und Bearbeitungsbereich einschränken.' },
  ru: { label: 'Упростить', description: 'Упростить недавние изменения кода с сохранением поведения и ограничением области правок.' },
  pt: { label: 'Simplificar', description: 'Simplificar alterações recentes de código, preservando o comportamento e limitando o escopo.' },
};

type Lookup = { get?: (name: string) => unknown };

/** 装饰过的包装函数标记，服务重建或重复注入时据此避免多层包裹。 */
const WRAPPED = Symbol.for('michengai.simplify.slashFace');

/** 识别宿主界面当前生效的语言；未指定默认中文，非中文未知语种回落英文。 */
function resolveLocale(ctx: Lookup): SupportedLocale {
  const locale = ctx.get?.('locale') as { snapshot?: { active?: unknown }; getSnapshot?: () => { active?: unknown } } | undefined;
  const active = locale?.snapshot?.active ?? locale?.getSnapshot?.()?.active;
  if (typeof active !== 'string') return 'zh';
  const tag = active.replace(/_/g, '-').toLowerCase();
  if (/^zh\b/.test(tag)) return 'zh';
  if (/^ja\b/.test(tag)) return 'ja';
  if (/^es\b/.test(tag)) return 'es';
  if (/^fr\b/.test(tag)) return 'fr';
  if (/^de\b/.test(tag)) return 'de';
  if (/^ru\b/.test(tag)) return 'ru';
  if (/^pt\b/.test(tag)) return 'pt';
  return 'en';
}

function decorateSlashFace(commandUi: unknown, ctx: Lookup): () => void {
  const live = commandUi as { candidates?: unknown } | undefined;
  const original = live?.candidates;
  if (!live || typeof original !== 'function') return () => {};
  if ((original as unknown as Record<symbol, unknown>)[WRAPPED] === true) return () => {};
  const wrapper = async (...args: unknown[]) => {
    const rows = await (original as (...rest: unknown[]) => unknown).apply(live, args);
    if (!Array.isArray(rows)) return rows;
    const copy = FACE[resolveLocale(ctx)];
    return rows.map((row: unknown) => {
      if (!row || typeof row !== 'object' || !('name' in row) || typeof (row as { name: unknown }).name !== 'string') return row;
      const item = row as { name: string; icon?: unknown };
      if (item.name !== 'simplify') return item;
      return {
        ...item,
        ...(item.icon === undefined ? { icon: FACE.icon } : {}),
        label: copy.label,
        description: copy.description,
      };
    });
  };
  (wrapper as unknown as Record<symbol, unknown>)[WRAPPED] = true;
  live.candidates = wrapper;
  return () => {
    if (live.candidates === wrapper) live.candidates = original;
  };
}

interface ClientScope extends Lookup {
  effect?(fn: () => (() => void) | void): unknown;
  inject?(deps: string[], callback: (scope: ClientScope) => void): unknown;
}

/**
 * 等 `commandUi` 就绪后再装饰 `/simplify` 的行面。
 *
 * 客户端插件的 apply 早于 UI 服务激活，此时直接 `ctx.get('commandUi')` 只会拿到
 * undefined 并静默失效；`inject` 会在服务就绪时回调，并在服务重建后再次回调，
 * 因此这里同时承担重挂载责任。
 */
export function apply(ctx: ClientScope): () => void {
  // 宿主 effect 返回卸载器；把它交回宿主，服务重建或插件卸载时才能恢复原方法。
  const decorate = (scope: ClientScope): (() => void) => {
    if (typeof scope.effect === 'function') {
      return (scope.effect(() => decorateSlashFace(scope.get?.('commandUi'), scope)) as () => void) ?? (() => {});
    }
    return decorateSlashFace(scope.get?.('commandUi'), scope);
  };
  if (typeof ctx.inject === 'function') {
    const uninject = ctx.inject(['commandUi'], scope => decorate(scope));
    return typeof uninject === 'function' ? (uninject as () => void) : () => {};
  }
  // 兼容不带 inject 的最小夹具：退化为一次性尝试。
  return decorate(ctx);
}
