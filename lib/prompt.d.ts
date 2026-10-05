import type { Review } from './git.js';
export declare const MAX_PROMPT_BYTES: number;
/** 将已验证的 Git 范围转成当前会话的编辑任务，超出消息预算时抛错。 */
export declare function buildPrompt(review: Review): string;
