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

/** 识别宿主界面当前生效的语言；未指定默认中文，非中文未知语种回落英文。 */
function resolveLocale(ctx: Lookup): SupportedLocale {
  const locale = ctx.get?.('locale') as { snapshot?: { active?: unknown } } | undefined;
  const active = locale?.snapshot?.active;
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
  const live = commandUi as { candidates?: (...args: unknown[]) => unknown } | undefined;
  const original = live?.candidates;
  if (!live || typeof original !== 'function') return () => {};
  live.candidates = async (...args: unknown[]) => {
    const rows = await original.apply(live, args);
    if (!Array.isArray(rows)) return rows;
    const lang = resolveLocale(ctx);
    const copy = FACE[lang];
    return rows.map((row: unknown) => {
      if (!row || typeof row !== 'object' || !('name' in row) || typeof (row as { name: unknown }).name !== 'string') return row;
      const item = row as { name: string; icon?: unknown };
      if (item.name !== 'simplify') return item;
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
  effect?(fn: () => () => void): unknown;
}

/** 给宿主 `/simplify` 补官方图标，并按当前界面语言覆盖标题和说明。客户端门面只暴露 effect，不暴露 inject。 */
export function apply(ctx: ClientScope): unknown {
  return ctx.effect?.(() => decorateSlashFace(ctx.get?.('commandUi'), ctx));
}
