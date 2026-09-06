import type { SubprocessRuntime } from '@deepseek-ai/dsh-subprocess';
import type { GitRunner } from './git.js';

// 清除 Git 仓库局部环境，交由 cwd 和 .git/worktree 元数据确定仓库；保留常规用户配置。
const REPOSITORY_ENV: NodeJS.ProcessEnv = Object.fromEntries([
  'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_CONFIG', 'GIT_CONFIG_PARAMETERS', 'GIT_CONFIG_COUNT',
  'GIT_OBJECT_DIRECTORY', 'GIT_DIR', 'GIT_WORK_TREE', 'GIT_IMPLICIT_WORK_TREE', 'GIT_GRAFT_FILE',
  'GIT_INDEX_FILE', 'GIT_NO_REPLACE_OBJECTS', 'GIT_REPLACE_REF_BASE', 'GIT_PREFIX',
  'GIT_SHALLOW_FILE', 'GIT_COMMON_DIR', 'GIT_NAMESPACE', 'GIT_CEILING_DIRECTORIES',
  'GIT_DISCOVERY_ACROSS_FILESYSTEM',
].map(name => [name, undefined]));

export class GitError extends Error {
  constructor(readonly code: 'ABORTED' | 'TIMEOUT' | 'UNAVAILABLE' | 'OUTPUT_TRUNCATED' | 'FAILED', message: string) {
    super(message);
    this.name = 'GitError';
  }
}

/** 创建一次命令共用的 Git 执行器；调用者负责整个审查的截止时间，单次 Git 默认最多 30 秒。 */
export function createGitRunner(subprocess: Pick<SubprocessRuntime, 'spawn'>, signal: AbortSignal, timeoutMs = 30_000): GitRunner {
  return async (args, cwd, allowedCodes = [0]) => {
    if (signal.aborted) throw new GitError('ABORTED', '简化审查已取消。');
    const timeout = new AbortController();
    const combined = AbortSignal.any([signal, timeout.signal]);
    const timer = setTimeout(() => timeout.abort(), timeoutMs);
    const checkAbort = () => {
      if (signal.aborted) throw new GitError('ABORTED', '简化审查已取消。');
      if (timeout.signal.aborted) throw new GitError('TIMEOUT', `Git 执行超过 ${timeoutMs} 毫秒。`);
    };
    try {
      const handle = subprocess.spawn({
        argv: ['git', ...args], cwd, signal: combined, graceMs: 1_000,
        stdio: { stdin: 'ignore', stdout: { maxBytes: 8 * 1024 * 1024 }, stderr: { maxBytes: 64 * 1024 } },
        env: { ...REPOSITORY_ENV, GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0', GIT_PAGER: 'cat' },
      });
      const outcome = await handle.done;
      checkAbort();
      const stdout = handle.collected.stdout?.readFrom(0);
      const stderr = handle.collected.stderr?.readFrom(0);
      if (!stdout || stdout.lossy || stderr?.lossy) throw new GitError('OUTPUT_TRUNCATED', 'Git 输出缺失或被截断，请缩小审查范围。');
      if (outcome.exitCode === null || outcome.signal || !allowedCodes.includes(outcome.exitCode)) {
        const detail = stderr?.text.trim().slice(0, 2_000);
        throw new GitError('FAILED', `Git 执行失败（退出码 ${outcome.exitCode ?? '未知'}）${detail ? `：${detail}` : '。'}`);
      }
      return { code: outcome.exitCode, stdout: stdout.text };
    } catch (error) {
      checkAbort();
      if (error instanceof GitError) throw error;
      throw new GitError('UNAVAILABLE', `无法执行 Git：${error instanceof Error ? error.message : String(error)}`);
    } finally { clearTimeout(timer); }
  };
}
