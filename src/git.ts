import type { SimplifyOptions } from './args.js';
import { createHash } from 'node:crypto';
import { lstat, open, realpath } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';

export type GitRunner = (args: readonly string[], cwd: string, allowedCodes?: readonly number[]) => Promise<{ code: number; stdout: string }>;

export interface LineRange { readonly start: number; readonly end: number }
interface Change { readonly path: string; readonly status: string; readonly oldPath?: string }
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
  readonly skipped: readonly { path: string; reason: string }[];
}
const MAX_FILES = 200;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_REVIEW_RANGES = 4_096;
const MAX_REVIEW_BYTES = 128 * 1024;
const STATUS: Record<string, string> = { A: 'added', M: 'modified', R: 'renamed', C: 'copied', D: 'deleted', T: 'type-changed', U: 'unmerged', X: 'unknown', B: 'broken' };
const DIFF = ['diff', '--no-color', '--no-ext-diff', '--no-textconv', '--no-relative', '--ignore-submodules=all', '--find-renames'];
const GLOBAL = ['--no-pager', '--literal-pathspecs', '-c', 'color.ui=false'];

/** 解析 Git -z 文件列表，拒绝不完整记录以免把截断输出当作完整范围。 */
export function nulFields(text: string): string[] {
  if (!text) return [];
  if (!text.endsWith('\0')) throw new Error('Git 文件列表不完整。');
  return text.slice(0, -1).split('\0');
}

export function parseNameStatus(text: string): Change[] {
  const fields = nulFields(text);
  const files: Change[] = [];
  for (let i = 0; i < fields.length;) {
    const code = fields[i++]!;
    const status = STATUS[code[0]!];
    const first = fields[i++];
    if (!status || !first || !/^[ACDMRTUXB]\d*$/u.test(code)) throw new Error('Git 文件状态格式无效。');
    if (code.startsWith('R') || code.startsWith('C')) {
      const path = fields[i++];
      if (!path) throw new Error('Git 重命名记录不完整。');
      files.push({ path, oldPath: first, status });
    } else files.push({ path: first, status });
  }
  return files;
}

/** 按 unified diff 正文计数；maxRanges 为剩余离散行范围额度，超额或正文不完整时抛错。 */
export function parseChangedLines(text: string, maxRanges = MAX_REVIEW_RANGES): LineRange[] {
  if (!Number.isSafeInteger(maxRanges) || maxRanges < 0 || maxRanges > MAX_REVIEW_RANGES) throw new Error('行范围额度无效。');
  const result: LineRange[] = [];
  let block: { oldLeft: number; newLeft: number; cursor: number } | undefined;
  let segment: number | undefined;
  const flush = (): void => {
    if (segment !== undefined && block) {
      if (result.length >= maxRanges) throw new Error('审查行范围超过 4096 个，请通过路径缩小审查范围。');
      result.push({ start: segment, end: block.cursor - 1 });
    }
    segment = undefined;
  };
  const finish = (): void => {
    if (block && (block.oldLeft !== 0 || block.newLeft !== 0)) throw new Error('Git 补丁正文不完整。');
    flush();
    block = undefined;
  };
  // 逐行消费已有 diff 字符串，避免先分配整份行数组，再因范围超限丢弃。
  for (let offset = 0; offset < text.length;) {
    const newline = text.indexOf('\n', offset);
    const row = text.slice(offset, newline < 0 ? text.length : newline);
    offset = newline < 0 ? text.length : newline + 1;
    if (row.startsWith('@@')) {
      finish();
      const header = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(?: .*)?$/u.exec(row);
      if (!header) throw new Error('Git 补丁块头无效。');
      const [oldStart, oldLeft, cursor, newLeft] = [Number(header[1]), Number(header[2] ?? 1), Number(header[3]), Number(header[4] ?? 1)];
      for (const [start, count] of [[oldStart!, oldLeft!], [cursor!, newLeft!]]) {
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(count) || !Number.isSafeInteger(start! + count!) || (count! > 0 && start === 0)) {
          throw new Error('Git 补丁行号超出有效范围。');
        }
      }
      block = { oldLeft: oldLeft!, newLeft: newLeft!, cursor: cursor! };
      continue;
    }
    if (row.startsWith('diff --git ')) { finish(); continue; }
    if (!block) continue;
    if (row === '\\ No newline at end of file') continue;
    switch (row[0]) {
      case '+':
        segment ??= block.cursor;
        block.cursor++;
        block.newLeft--;
        break;
      case '-':
        block.oldLeft--;
        break;
      case ' ':
        flush();
        block.cursor++;
        block.oldLeft--;
        block.newLeft--;
        break;
      default:
        throw new Error('Git 补丁正文格式无效。');
    }
    if (block.oldLeft < 0 || block.newLeft < 0) throw new Error('Git 补丁正文超过声明行数。');
  }
  finish();
  return result;
}

function inside(root: string, path: string): boolean {
  const rel = relative(root, path);
  return !isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${sep}`);
}

async function fingerprint(root: string, path: string): Promise<{ sha256: string } | { reason: string }> {
  const absolute = resolve(root, path);
  if (!inside(root, absolute)) throw new Error('Git 返回了仓库外路径。');
  const stat = await lstat(absolute);
  if (!stat.isFile()) return { reason: '非普通文件（符号链接或子模块等）' };
  if (!inside(root, await realpath(absolute))) return { reason: '路径指向仓库外' };
  if (stat.size > MAX_FILE_BYTES) return { reason: '文件超过 5 MiB' };
  const handle = await open(absolute, 'r');
  try {
    const buffer = Buffer.alloc(Math.min(stat.size + 1, MAX_FILE_BYTES + 1));
    let offset = 0;
    while (offset < buffer.length) {
      const { bytesRead } = await handle.read(buffer, offset, buffer.length - offset, null);
      if (!bytesRead) break;
      offset += bytesRead;
    }
    if (offset !== stat.size) throw new Error(`文件在读取时发生变化：${JSON.stringify(path)}，请重试。`);
    const content = buffer.subarray(0, offset);
    if (content.includes(0)) return { reason: '二进制文件' };
    return { sha256: createHash('sha256').update(content).digest('hex') };
  } finally { await handle.close(); }
}

async function revision(run: GitRunner, root: string, ref: string): Promise<string | undefined> {
  const result = await run([...GLOBAL, 'rev-parse', '--verify', '--quiet', '--end-of-options', `${ref}^{commit}`], root, [0, 1]);
  return result.code === 0 ? result.stdout.trim() : undefined;
}

async function assertStagedClean(run: GitRunner, root: string, paths: readonly string[]): Promise<void> {
  if (!paths.length) return;
  const result = await run([...GLOBAL, ...DIFF, '--name-only', '-z', '--', ...paths], root);
  if (result.stdout) throw new Error('待审查的暂存文件还有未暂存改动。请先暂存或自行保存这些改动，再运行 --staged。');
}

/** 收集可审查文本文件及行号快照；Git 失败、冲突或不可靠范围会抛错，不产生部分成功。 */
export async function collectReview(run: GitRunner, cwd: string, options: SimplifyOptions): Promise<Review> {
  if (!cwd) throw new Error('当前会话没有工作目录。');
  const rootResult = await run([...GLOBAL, 'rev-parse', '--show-toplevel'], cwd);
  const root = await realpath(rootResult.stdout.replace(/\r?\n$/u, ''));
  const sessionRoot = await realpath(cwd);
  if (!inside(root, sessionRoot)) throw new Error('当前会话工作目录不在 Git 返回的仓库内。');
  const paths = options.files.map(path => {
    const absolute = resolve(sessionRoot, path);
    if (!inside(root, absolute)) throw new Error(`路径不在当前仓库内：${JSON.stringify(path)}`);
    return relative(root, absolute).split(sep).join('/') || '.';
  });
  const head = await revision(run, root, 'HEAD');
  let base = options.explicitRef ? await revision(run, root, options.ref) : head;
  if (options.explicitRef && !base) throw new Error(`无效的 Git 引用：${options.ref}`);
  let source: Review['source'] = options.staged ? 'staged' : options.explicitRef ? 'ref' : 'worktree';
  const scope = ['--', ...paths];
  const indexSnapshot = options.staged ? (await run([...GLOBAL, 'ls-files', '--stage', '-z', ...scope], root)).stdout : undefined;
  const conflicts = await run([...GLOBAL, 'ls-files', '--unmerged', '-z', ...scope], root);
  if (conflicts.stdout) throw new Error('所选范围存在未解决的 Git 冲突，请先解决冲突。');
  for (const path of paths) {
    const existing = await run([...GLOBAL, 'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', path], root);
    if (!existing.stdout) throw new Error(`路径不存在、被忽略或未纳入 Git：${JSON.stringify(path)}`);
  }
  const list = async (ref: string | undefined): Promise<Change[]> => {
    if (!ref && !options.staged) {
      const tracked = await run([...GLOBAL, 'ls-files', '--cached', '-z', ...scope], root);
      return [...new Set(nulFields(tracked.stdout))].map(path => ({ path, status: 'added' }));
    }
    const result = await run([...GLOBAL, ...DIFF, '--name-status', '-z', ...(options.staged ? ['--cached'] : [ref!]), ...scope], root);
    return parseNameStatus(result.stdout);
  };
  let changes = await list(base);
  if (!options.staged) {
    const untracked = await run([...GLOBAL, 'ls-files', '--others', '--exclude-standard', '-z', ...scope], root);
    const known = new Set(changes.map(file => file.path));
    for (const path of nulFields(untracked.stdout)) if (!known.has(path)) { changes.push({ path, status: 'added' }); known.add(path); }
  }
  if (!changes.length && head && !options.staged && !options.explicitRef && !paths.length) {
    const parent = await revision(run, root, `${head}^`);
    if (parent) { base = parent; source = 'previous-commit'; changes = await list(base); }
  }
  if (changes.length > MAX_FILES) throw new Error('变更超过 200 个文件，请通过路径缩小审查范围。');
  if (options.staged) await assertStagedClean(run, root, changes.flatMap(file => file.oldPath ? [file.oldPath, file.path] : [file.path]));
  const files: ReviewFile[] = [];
  const skipped: { path: string; reason: string }[] = [];
  let rangeCount = 0;
  let metadataBytes = 0;
  const accountMetadata = (value: unknown): void => {
    metadataBytes += Buffer.byteLength(JSON.stringify(value), 'utf8');
    if (metadataBytes > MAX_REVIEW_BYTES) throw new Error('审查清单超过 128 KiB，请通过路径缩小审查范围。');
  };
  accountMetadata({ root, head, base, source, staged: options.staged, paths });
  const skip = (path: string, reason: string): void => {
    const file = { path, reason };
    accountMetadata(file);
    skipped.push(file);
  };
  for (const file of changes) {
    if (['deleted', 'type-changed', 'unmerged', 'unknown', 'broken'].includes(file.status)) {
      skip(file.path, `不可编辑的文件状态：${file.status}`);
      continue;
    }
    let before;
    try { before = await fingerprint(root, file.path); }
    catch (error) {
      if (!head && (error as NodeJS.ErrnoException).code === 'ENOENT') { skip(file.path, '新仓库中已从工作区删除'); continue; }
      throw error;
    }
    if ('reason' in before) { skip(file.path, before.reason); continue; }
    let ranges: LineRange[] = [];
    if (file.status !== 'added') {
      const diff = await run([...GLOBAL, ...DIFF, '--unified=0', '--inter-hunk-context=0', ...(options.staged ? ['--cached'] : [base!]), '--', ...(file.oldPath ? [file.oldPath] : []), file.path], root);
      ranges = parseChangedLines(diff.stdout, MAX_REVIEW_RANGES - rangeCount);
      rangeCount += ranges.length;
      const after = await fingerprint(root, file.path);
      if (!('sha256' in after) || after.sha256 !== before.sha256) throw new Error(`文件在收集范围时发生变化：${JSON.stringify(file.path)}，请重试。`);
      if (!ranges.length) { skip(file.path, '没有可简化的当前行（纯删除、仅重命名或非文本 diff）'); continue; }
    }
    const reviewed = { ...file, ranges, sha256: before.sha256 };
    accountMetadata(reviewed);
    files.push(reviewed);
  }
  const review: Review = { root, head, base, source, staged: options.staged, paths, indexSnapshot, files, skipped };
  await verifyReview(run, review);
  return review;
}

/** 在提交提示词前复核内容及 HEAD；这不是 Agent 后续写入权限的硬限制。 */
export async function verifyReview(run: GitRunner, review: Review): Promise<void> {
  if (await revision(run, review.root, 'HEAD') !== review.head) throw new Error('HEAD 在收集范围后发生变化，请重新运行 /simplify。');
  if (review.staged) {
    const index = await run([...GLOBAL, 'ls-files', '--stage', '-z', '--', ...review.paths], review.root);
    if (index.stdout !== review.indexSnapshot) throw new Error('暂存区在收集范围后发生变化，请重新运行 /simplify。');
    await assertStagedClean(run, review.root, review.files.map(file => file.path));
  }
  for (const file of review.files) {
    const current = await fingerprint(review.root, file.path);
    if (!('sha256' in current) || current.sha256 !== file.sha256) throw new Error(`文件已变化：${JSON.stringify(file.path)}，请重新运行 /simplify。`);
  }
}
