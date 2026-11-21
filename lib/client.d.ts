export type SupportedLocale = 'zh' | 'en' | 'ja' | 'es' | 'fr' | 'de' | 'ru' | 'pt';
type Lookup = {
    get?: (name: string) => unknown;
};
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
export declare function apply(ctx: ClientScope): unknown;
export {};
