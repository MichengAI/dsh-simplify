import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, realpathSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { repo } from './fixture.mjs';
import * as plugin from '../lib/index.js';
import { createGitRunner } from '../lib/exec.js';
import { collectReview } from '../lib/git.js';
import { parseArgs } from '../lib/args.js';

const runtimeRoot = process.env.DSH_RUNTIME_ROOT ?? fileURLToPath(new URL('../node_modules/', import.meta.url));
const available = existsSync(join(runtimeRoot, '@deepseek-ai', 'dsh-subprocess-local', 'lib', 'index.js'));

test('真实 DSH 命令注册、subprocess 执行、消息投递与卸载', {skip: available ? false : '未检测到项目宿主依赖，请先安装依赖或设置 DSH_RUNTIME_ROOT'}, async () => {
  const load = name => import(pathToFileURL(join(runtimeRoot, '@deepseek-ai', name, 'lib', 'index.js')).href);
  const [{Context}, {CommandRuntime}, {LocalSubprocessRuntime}] = await Promise.all([load('cordis'),load('dsh-commands'),load('dsh-subprocess-local')]);
  const ctx = new Context();
  new CommandRuntime(ctx);
  new LocalSubprocessRuntime(ctx);
  const r = repo(); r.write('中文 space.ts', 'before\n'); r.commit(); r.write('中文 space.ts', 'after\n');
  const messages = [];
  const events = [];
  const agent = {session:{header:{id:'simplify-test',cwd:r.cwd},append(type,data){events.push({type,data});}},followup(message){messages.push(message);}};
  const installed = ctx.plugin(plugin);
  try {
    await installed.await();
    assert.ok(ctx.commands.list(agent).some(command => command.name === 'simplify'));
    const result = await ctx.commands.execute(agent,'/simplify',[],new AbortController().signal);
    assert.equal(result.result.kind,'success',JSON.stringify(result));
    assert.equal(messages.length,1);
    assert.equal(messages[0].source.plugin,'@michengai/dsh-simplify');
    assert.match(messages[0].content[0].text,/中文 space\.ts/);
    assert.match(messages[0].content[0].text,/仅行 1/);
    assert.ok(events.some(event => event.type === 'command/done'));
    const invalid = await ctx.commands.execute(agent,'/simplify --ref=missing',[],new AbortController().signal);
    assert.equal(invalid.result.kind,'error');
    assert.equal(messages.length,1);
    agent.followup = () => { throw new Error('入队失败'); };
    const failed = await ctx.commands.execute(agent, '/simplify', [], new AbortController().signal);
    assert.equal(failed.result.kind, 'error');
    assert.equal(failed.result.text, '入队失败');
    assert.equal(messages.length, 1);
    await installed.dispose();
    assert.ok(!ctx.commands.list(agent).some(command => command.name === 'simplify'));
  } finally { await ctx.fiber.dispose(); }
});

test('真实宿主隔离 Git 定位环境，普通仓库和 worktree 使用各自索引', {skip: !available}, async t => {
  const load = name => import(pathToFileURL(join(runtimeRoot, '@deepseek-ai', name, 'lib', 'index.js')).href);
  const [{Context}, {LocalSubprocessRuntime}] = await Promise.all([load('cordis'), load('dsh-subprocess-local')]);
  const ctx = new Context();
  new LocalSubprocessRuntime(ctx);
  const r = repo(); r.write('own.ts', 'before\n'); r.commit();
  const other = repo(); other.write('foreign.ts', 'foreign\n'); other.commit();
  const linked = join(r.cwd, 'linked');
  r.git('worktree', 'add', '--detach', linked, 'HEAD');
  r.write('own.ts', 'main\n'); r.git('add', 'own.ts');
  writeFileSync(join(linked, 'own.ts'), 'linked\n');
  execFileSync('git', ['add', 'own.ts'], {cwd:linked,stdio:'pipe'});
  const gitDir = join(other.cwd, '.git');
  const cases = [
    {GIT_DIR:gitDir, GIT_WORK_TREE:other.cwd, GIT_COMMON_DIR:gitDir},
    {GIT_INDEX_FILE:join(gitDir, 'index')},
    {GIT_OBJECT_DIRECTORY:join(gitDir, 'objects')},
    {GIT_CONFIG_COUNT:'1', GIT_CONFIG_KEY_0:'core.worktree', GIT_CONFIG_VALUE_0:other.cwd},
  ];
  if (process.platform === 'win32') cases.push({git_dir:gitDir, git_work_tree:other.cwd});
  try {
    for (const [i, overrides] of cases.entries()) {
      await t.test(`环境组合 ${i + 1}`, async () => {
        const previous = Object.fromEntries(Object.keys(overrides).map(key => [key, process.env[key]]));
        try {
          Object.assign(process.env, overrides);
          const run = createGitRunner(ctx.subprocess, new AbortController().signal);
          for (const cwd of [r.cwd, linked]) {
            for (const input of ['', '--staged own.ts']) {
              const review = await collectReview(run, cwd, parseArgs(input));
              assert.equal(review.root, realpathSync(cwd));
              assert.deepEqual(review.files.map(file => file.path), ['own.ts']);
              assert.deepEqual(review.files[0].ranges, [{start:1,end:1}]);
            }
          }
        } finally {
          for (const [key, value] of Object.entries(previous)) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
          }
        }
      });
    }
  } finally { await ctx.fiber.dispose(); }
});
