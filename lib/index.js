import { handleCommand } from './command.js';
export const name = 'michengai-simplify';
export const inject = ['commands', 'subprocess'];
/** 注册 /simplify；卸载时取消正在收集的范围，并等待其 Git 进程结束。 */
export function apply(ctx) {
    ctx.effect(() => {
        const lifetime = new AbortController();
        const active = new Set();
        const unregister = ctx.commands.register({
            name: 'simplify',
            description: '简化最近改动的代码，保持功能并限定修改范围',
            input: { hint: '[--staged] [--ref=<ref>] [--] [文件或目录...]' },
            handler: invocation => {
                const operation = handleCommand(ctx, invocation, lifetime.signal);
                active.add(operation);
                void operation.then(() => active.delete(operation), () => active.delete(operation));
                return operation;
            },
        });
        return async () => {
            lifetime.abort();
            unregister();
            await Promise.allSettled(active);
        };
    });
}
//# sourceMappingURL=index.js.map