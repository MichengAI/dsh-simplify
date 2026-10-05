import type { SubprocessRuntime } from '@deepseek-ai/dsh-subprocess';
import type { GitRunner } from './git.js';
export declare class GitError extends Error {
    readonly code: 'ABORTED' | 'TIMEOUT' | 'UNAVAILABLE' | 'OUTPUT_TRUNCATED' | 'FAILED';
    constructor(code: 'ABORTED' | 'TIMEOUT' | 'UNAVAILABLE' | 'OUTPUT_TRUNCATED' | 'FAILED', message: string);
}
/** 创建一次命令共用的 Git 执行器；调用者负责整个审查的截止时间，单次 Git 默认最多 30 秒。 */
export declare function createGitRunner(subprocess: Pick<SubprocessRuntime, 'spawn'>, signal: AbortSignal, timeoutMs?: number): GitRunner;
