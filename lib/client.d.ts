type Lookup = {
    get?: (name: string) => unknown;
};
interface ClientScope extends Lookup {
    effect?(fn: () => () => void): unknown;
}
/** 给宿主 `/simplify` 补官方图标，并按当前界面语言覆盖标题和说明。客户端门面只暴露 effect，不暴露 inject。 */
export declare function apply(ctx: ClientScope): unknown;
export {};
