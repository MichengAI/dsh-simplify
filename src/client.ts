import * as primitives from '@deepseek-ai/dsh-client-ui-primitives';

/** 0.1.6 导出 IconEnhanceOutline16；0.1.7 改为 Regular，画布仍是 16。 */
const icons = primitives as Record<string, unknown>;
const enhanceIcon = icons.IconEnhanceOutline16 ?? icons.IconEnhanceOutlineRegular;

/** Host `/` 行没有 icon/label；官方只给一等命令画脸。同名贡献会撞车，只能补 candidates。 */
const FACE = { icon: enhanceIcon, zh: '简化', en: 'Simplify' } as const;

type Lookup = { get?: (name: string) => unknown };

function english(ctx: Lookup): boolean {
  const locale = ctx.get?.('locale') as { snapshot?: { active?: unknown } } | undefined;
  return typeof locale?.snapshot?.active === 'string' && /^en(?:-|$)/i.test(locale.snapshot.active);
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
      const item = row as { name: string; icon?: unknown; label?: unknown };
      if (item.name !== 'simplify') return item;
      return {
        ...item,
        ...(item.icon === undefined && FACE.icon !== undefined ? { icon: FACE.icon } : {}),
        ...(item.label === undefined ? { label: en ? FACE.en : FACE.zh } : {}),
      };
    });
  };
  return () => { live.candidates = original; };
}

interface ClientScope extends Lookup {
  inject?(deps: string[], callback: (scope: Lookup) => () => void): unknown;
  effect?(fn: () => () => void): unknown;
}

/** 给宿主 `/simplify` 补官方图标和中英文标题；没有 commandUi 的旧宿主会跳过。 */
export function apply(ctx: ClientScope): unknown {
  if (typeof ctx.inject === 'function') return ctx.inject(['commandUi'], scope => decorateSlashFace(scope.get?.('commandUi'), ctx));
  return ctx.effect?.(() => decorateSlashFace(ctx.get?.('commandUi'), ctx));
}
