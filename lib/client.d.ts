type Lookup = {
    get?: (name: string) => unknown;
};
interface ClientScope extends Lookup {
    inject?(deps: string[], callback: (scope: Lookup) => () => void): unknown;
    effect?(fn: () => () => void): unknown;
}
/** 给宿主 `/simplify` 补官方图标，并按当前界面语言覆盖标题和说明；没有 commandUi 的旧宿主会跳过。 */
export declare function apply(ctx: ClientScope): unknown;
export {};
