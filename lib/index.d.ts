import type { Context } from '@deepseek-ai/cordis';
export declare const name = "michengai-simplify";
export declare const inject: string[];
/** 注册 /simplify；卸载时取消正在收集的范围，并等待其 Git 进程结束。 */
export declare function apply(ctx: Context): void;
