import type { SimplifyOptions } from './args.js';
export type GitRunner = (args: readonly string[], cwd: string, allowedCodes?: readonly number[]) => Promise<{
    code: number;
    stdout: string;
}>;
export interface LineRange {
    readonly start: number;
    readonly end: number;
}
interface Change {
    readonly path: string;
    readonly status: string;
    readonly oldPath?: string;
}
export interface ReviewFile extends Change {
    readonly ranges: readonly LineRange[];
    readonly sha256: string;
}
export interface Review {
    readonly root: string;
    readonly head: string | undefined;
    readonly base: string | undefined;
    readonly staged: boolean;
    readonly paths: readonly string[];
    readonly indexSnapshot: string | undefined;
    readonly source: 'worktree' | 'staged' | 'ref' | 'previous-commit';
    readonly files: readonly ReviewFile[];
    readonly skipped: readonly {
        path: string;
        reason: string;
    }[];
}
/** 解析 Git -z 文件列表，拒绝不完整记录以免把截断输出当作完整范围。 */
export declare function nulFields(text: string): string[];
export declare function parseNameStatus(text: string): Change[];
/** 按 unified diff 正文计数；maxRanges 为剩余离散行范围额度，超额或正文不完整时抛错。 */
export declare function parseChangedLines(text: string, maxRanges?: number): LineRange[];
/** 收集可审查文本文件及行号快照；Git 失败、冲突或不可靠范围会抛错，不产生部分成功。 */
export declare function collectReview(run: GitRunner, cwd: string, options: SimplifyOptions): Promise<Review>;
/** 在提交提示词前复核内容及 HEAD；这不是 Agent 后续写入权限的硬限制。 */
export declare function verifyReview(run: GitRunner, review: Review): Promise<void>;
export {};
