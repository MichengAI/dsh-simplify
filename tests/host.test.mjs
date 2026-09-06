import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { repo } from './fixture.mjs';
import * as plugin from '../lib/index.js';

const runtimeRoot = process.env.DSH_RUNTIME_ROOT ?? join(homedir(), '.dsh', 'profiles', 'node_modules');
const available = existsSync(join(runtimeRoot, '@deepseek-ai', 'dsh-subprocess-local', 'lib', 'index.js'));

test('真实 DSH 命令注册、subprocess 执行、消息投递与卸载', {skip: available ? false : '未提供 DSH_RUNTIME_ROOT，且未检测到本地 DSH 运行时'}, async () => {
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
    await installed.dispose();
    assert.ok(!ctx.commands.list(agent).some(command => command.name === 'simplify'));
  } finally { await ctx.fiber.dispose(); }
});
