export interface SimplifyOptions {
  readonly files: readonly string[];
  readonly staged: boolean;
  readonly ref: string;
  readonly explicitRef: boolean;
}

/** 解析斜杠命令参数；引号用于组合路径，反斜杠按路径字符保留。非法输入抛出 Error。 */
export function parseArgs(input: string): SimplifyOptions {
  if (input.length > 16_384 || input.includes('\0')) throw new Error('参数过长或包含 NUL 字符。');
  const tokens: string[] = [];
  let current = '';
  let quote = '';
  let started = false;
  const flush = () => {
    if (!started) return;
    if (!current) throw new Error('不支持空参数。');
    tokens.push(current);
    current = '';
    started = false;
  };
  for (const char of input) {
    if (quote) {
      if (char === quote) quote = '';
      else current += char;
    } else if (char === '"' || char === "'") {
      quote = char;
      started = true;
    } else if (/\s/u.test(char)) flush();
    else { current += char; started = true; }
  }
  if (quote) throw new Error('参数中的引号未闭合。');
  flush();
  const files: string[] = [];
  let ref = 'HEAD';
  let explicitRef = false;
  let staged = false;
  let ended = false;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;
    if (!ended && token === '--') ended = true;
    else if (!ended && token === '--staged') staged = true;
    else if (!ended && (token === '--ref' || token.startsWith('--ref='))) {
      if (explicitRef) throw new Error('--ref 只能指定一次。');
      explicitRef = true;
      ref = token === '--ref' ? (tokens[++i] ?? '') : token.slice(6);
    } else if (!ended && token.startsWith('-')) throw new Error(`未知选项 ${token}；此类文件名请放在 -- 后。`);
    else files.push(token);
  }
  if (!ref || ref.length > 256 || ref.startsWith('-') || /[\s\0]/u.test(ref) || ref.includes('..')) {
    throw new Error('--ref 必须是单个有效的 Git 提交引用，不支持范围表达式。');
  }
  if (staged && explicitRef) throw new Error('--staged 不能与 --ref 同时使用。');
  if (files.length > 200) throw new Error('最多指定 200 个路径。');
  return { files, staged, ref, explicitRef };
}
