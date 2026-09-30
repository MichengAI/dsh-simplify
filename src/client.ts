import * as primitives from '@deepseek-ai/dsh-client-ui-primitives';

/** 0.1.6 导出 IconEnhanceOutline16；0.1.7 改为 Regular，画布仍是 16。 */
const icons = primitives as Record<string, unknown>;
const enhanceIcon = icons.IconEnhanceOutline16 ?? icons.IconEnhanceOutlineRegular;

/** Host `/` 行没有可本地化的说明；同名贡献会撞车，只能在每次 candidates 上覆盖 /simplify。 */
const FACE = {
  icon: enhanceIcon,
  zh: { label: '简化', description: '简化最近改动的代码，保持功能并限定修改范围' },
  en: { label: 'Simplify', description: 'Simplify recent code changes, preserve behavior, and limit the edit scope.' },
} as const;

type Lookup = { get?: (name: string) => unknown };

/** en、en-US、en_US 为英文；下划线先折成连字符，再按 /^en(?:-|$)/i 判断。 */
function english(ctx: Lookup): boolean {
  const locale = ctx.get?.('locale') as { snapshot?: { active?: unknown } } | undefined;
  const active = locale?.snapshot?.active;
  return typeof active === 'string' && /^en(?:-|$)/i.test(active.replace(/_/g, '-'));
}

function decorateSlashFace(commandUi: unknown, ctx: Lookup): () => void {
  const live = commandUi as { candidates?: (...args: unknown[]) => unknown } | undefined;
  const original = live?.candidates;
  if (!live || typeof original !== 'function') return () => {};
  live.candidates = async (...args: unknown[]) => {
    const rows = await original.apply(live, args);
    if (!Array.isArray(rows)) return rows;
    const en = english(ctx);
    return rows.map((row: unknown) => {
      if (!row || typeof row !== 'object' || !('name' in row) || typeof (row as { name: unknown }).name !== 'string') return row;
      const item = row as { name: string; icon?: unknown };
      if (item.name !== 'simplify') return item;
      const copy = en ? FACE.en : FACE.zh;
      return {
        ...item,
        ...(item.icon === undefined && FACE.icon !== undefined ? { icon: FACE.icon } : {}),
        label: copy.label,
        description: copy.description,
      };
    });
  };
  return () => { live.candidates = original; };
}

interface ClientScope extends Lookup {
  inject?(deps: string[], callback: (scope: Lookup) => () => void): unknown;
  effect?(fn: () => () => void): unknown;
}

/** 给宿主 `/simplify` 补官方图标，并按当前界面语言覆盖标题和说明；没有 commandUi 的旧宿主会跳过。 */
export function apply(ctx: ClientScope): unknown {
  if (typeof ctx.inject === 'function') return ctx.inject(['commandUi'], scope => decorateSlashFace(scope.get?.('commandUi'), ctx));
  return ctx.effect?.(() => decorateSlashFace(ctx.get?.('commandUi'), ctx));
}
