import type { Context } from '@deepseek-ai/cordis';
import type { CommandInvocation, CommandResult } from '@deepseek-ai/dsh-commands';
declare module '@deepseek-ai/dsh-llm' {
    interface MessageSourceMap {
        /** 0.1.7 拒绝退役的 `kind: 'plugin'` 包装；这个生产者 kind 在更早的宿主里同样可以入队。 */
        'michengai-simplify': {
            readonly kind: 'michengai-simplify';
        };
    }
}
/** 执行一次交互式命令；错误只返回 UI，可靠范围才交给当前 Agent。 */
export declare function handleCommand(ctx: Pick<Context, 'subprocess'>, invocation: CommandInvocation, lifetime?: AbortSignal): Promise<CommandResult>;
