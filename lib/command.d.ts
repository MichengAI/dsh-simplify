import type { Context } from '@deepseek-ai/cordis';
import type { CommandInvocation, CommandResult } from '@deepseek-ai/dsh-commands';
declare module '@deepseek-ai/dsh-llm' {
    interface MessageSourceMap {
        /** 宿主没有共享的 `plugin` kind，生产者必须声明自己的 kind 才能入队。 */
        'michengai-simplify': {
            readonly kind: 'michengai-simplify';
        };
    }
}
/** 执行一次交互式命令；错误只返回 UI，可靠范围才交给当前 Agent。 */
export declare function handleCommand(ctx: Pick<Context, 'subprocess'>, invocation: CommandInvocation, lifetime?: AbortSignal): Promise<CommandResult>;
