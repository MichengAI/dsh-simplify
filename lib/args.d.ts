export interface SimplifyOptions {
    readonly files: readonly string[];
    readonly staged: boolean;
    readonly ref: string;
    readonly explicitRef: boolean;
}
/** 解析斜杠命令参数；引号用于组合路径，反斜杠按路径字符保留。非法输入抛出 Error。 */
export declare function parseArgs(input: string): SimplifyOptions;
