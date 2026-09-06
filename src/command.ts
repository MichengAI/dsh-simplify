import type { Context } from '@deepseek-ai/cordis';
import type { CommandInvocation, CommandResult } from '@deepseek-ai/dsh-commands';
import { createUserMessage } from '@deepseek-ai/dsh-llm';
import { parseArgs } from './args.js';
import { createGitRunner } from './exec.js';
import { collectReview, verifyReview } from './git.js';
import { buildPrompt } from './prompt.js';

/** 执行一次交互式命令；错误只返回 UI，可靠范围才交给当前 Agent。 */
export async function handleCommand(ctx: Pick<Context, 'subprocess'>, invocation: CommandInvocation, lifetime?: AbortSignal): Promise<CommandResult> {
  const deadline = new AbortController();
  const timer = setTimeout(() => deadline.abort(), 60_000);
  const signal = AbortSignal.any([invocation.signal, deadline.signal, ...(lifetime ? [lifetime] : [])]);
  try {
    signal.throwIfAborted();
    const options = parseArgs(invocation.rawInput);
    const cwd = invocation.agent.session.header.cwd;
    if (!cwd) throw new Error('当前会话没有工作目录，无法确定审查仓库。');
    const run = createGitRunner(ctx.subprocess, signal);
    const review = await collectReview(run, cwd, options);
    signal.throwIfAborted();
    if (!review.files.length) {
      const skipped = review.skipped.slice(0, 10).map(file => `${JSON.stringify(file.path)}：${file.reason}`).join('\n');
      return { kind: 'success', text: `没有可简化的当前代码行。${skipped ? `\n已跳过 ${review.skipped.length} 个文件：\n${skipped}` : ''}` };
    }
    const prompt = buildPrompt(review);
    await verifyReview(run, review);
    signal.throwIfAborted();
    // followup 在当前宿主中同时负责持久入队与唤醒，避免直接操作 inbox 后缺少唤醒。
    invocation.agent.followup(createUserMessage({
      content: [{ type: 'text', text: prompt }],
      source: { kind: 'plugin', plugin: '@michengai/dsh-simplify' },
    }));
    return { kind: 'success', text: `已提交 ${review.files.length} 个文件的简化审查${review.source === 'previous-commit' ? '（回看上一提交）' : ''}。${review.skipped.length ? `已跳过 ${review.skipped.length} 个不可编辑文件。` : ''}` };
  } catch (error) {
    const text = deadline.signal.aborted ? '审查范围收集超过 60 秒，请缩小范围后重试。'
      : signal.aborted ? '简化审查已取消。'
      : error instanceof Error ? error.message : String(error);
    return { kind: 'error', text };
  } finally { clearTimeout(timer); }
}
