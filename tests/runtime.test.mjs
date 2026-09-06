import test from 'node:test';
import assert from 'node:assert/strict';
import { createGitRunner } from '../lib/exec.js';
import { handleCommand } from '../lib/command.js';
import { apply } from '../lib/index.js';
import { buildPrompt, MAX_PROMPT_BYTES } from '../lib/prompt.js';
import { parseNameStatus, parseChangedLines } from '../lib/git.js';

const reader = (text = '', lossy = false) => ({ readFrom: () => ({ text, lossy, nextOffset: Buffer.byteLength(text) }) });
function subprocess({ code = 0, stdout = '', stderr = '', lossy = false, signal = null } = {}) {
  return { spawn: () => ({ done: Promise.resolve({ exitCode: code, signal }), collected: { stdout: reader(stdout, lossy), stderr: reader(stderr) } }) };
}
const idleSignal = () => new AbortController().signal;

test('Git 使用 argv 而非 Shell，正确传递空格与引号路径', async () => {
  let spec;
  const run = createGitRunner({ spawn(value) { spec = value; return subprocess({stdout:'ok'}).spawn(); } }, idleSignal());
  assert.equal((await run(['diff', '--', "中文 it's.ts"], 'C:\\my repo')).stdout, 'ok');
  assert.deepEqual(spec.argv, ['git', 'diff', '--', "中文 it's.ts"]);
  assert.equal(spec.cwd, 'C:\\my repo');
  assert.equal(spec.stdio.stdin, 'ignore');
});
test('Git 非零退出、信号退出及启动失败不会被吞掉', async () => {
  await assert.rejects(createGitRunner(subprocess({code:128,stderr:'bad ref'}),idleSignal())([],'.'), e => e.code === 'FAILED' && /bad ref/.test(e.message));
  await assert.rejects(createGitRunner(subprocess({code:null,signal:'SIGTERM'}),idleSignal())([],'.'), e => e.code === 'FAILED');
  await assert.rejects(createGitRunner({spawn(){throw new Error('ENOENT');}},idleSignal())([],'.'), e => e.code === 'UNAVAILABLE');
});
test('完整采集是必要条件：stdout 或 stderr 截断都报错', async () => {
  await assert.rejects(createGitRunner(subprocess({stdout:'tail',lossy:true}),idleSignal())([],'.'), e => e.code === 'OUTPUT_TRUNCATED');
  const sub = { spawn() { return {done:Promise.resolve({exitCode:0,signal:null}),collected:{stdout:reader(),stderr:reader('tail',true)}}; } };
  await assert.rejects(createGitRunner(sub,idleSignal())([],'.'), e => e.code === 'OUTPUT_TRUNCATED');
});
test('Git 仅允许调用方指定的探测退出码', async () => {
  assert.equal((await createGitRunner(subprocess({code:1}),idleSignal())([],'.',[0,1])).code,1);
  await assert.rejects(createGitRunner(subprocess({code:1}),idleSignal())([],'.'));
});
test('Git 超时等待进程完成，并区别于用户取消', async () => {
  let stopped = false;
  const sub = {spawn(spec) { return {collected:{stdout:reader(),stderr:reader()},done:new Promise(resolve => {
    spec.signal.addEventListener('abort', () => { stopped = true; resolve({exitCode:null,signal:'SIGTERM'}); },{once:true});
  })}; }};
  await assert.rejects(createGitRunner(sub,idleSignal(),10)([],'.'), e => e.code === 'TIMEOUT');
  assert.equal(stopped,true);
  const abort = new AbortController(); abort.abort();
  await assert.rejects(createGitRunner({spawn(){assert.fail('已取消时不能启动');}},abort.signal)([],'.'), e => e.code === 'ABORTED');
});
test('NUL 路径解析支持制表符换行并拒绝残缺重命名记录', () => {
  assert.equal(parseNameStatus('M\0a\tb\nc.ts\0')[0].path,'a\tb\nc.ts');
  for (const value of ['M\0abc','R100\0old\0','Z\0a\0']) assert.throws(() => parseNameStatus(value));
});
test('补丁正文区分新增行与上下文，不把整个 hunk 作为可编辑范围', () => {
  const patch = 'diff --git a/a.ts b/a.ts\n--- a/a.ts\n+++ b/a.ts\n@@ -1,5 +1,6 @@ function a()\n same\n-old\n+new\n+extra\n middle\n-other\n+replacement\n end\n';
  assert.deepEqual(parseChangedLines(patch), [{start:2,end:3},{start:5,end:5}]);
});
test('补丁正文缺失、计数不符和无效行号不能产生部分范围', () => {
  for (const patch of [
    '@@ -1 +1 @@\n',
    '@@ -1 +1,2 @@\n-old\n+new\n',
    '@@ -1 +1 @@\n-old\n+new\n+extra\n',
    '@@ -1 +0 @@\n-old\n+new\n',
    '@@ -1 +9007199254740991,2 @@\n-old\n+a\n+b\n',
    '@@ -1 +1 @@\ninvalid\n',
  ]) assert.throws(() => parseChangedLines(patch), /补丁/);
});
test('补丁支持纯删除、空侧范围与没有末尾换行的内容', () => {
  assert.deepEqual(parseChangedLines('@@ -1,2 +0,0 @@\n-a\n-b\n'), []);
  assert.deepEqual(parseChangedLines('@@ -0,0 +1,2 @@\n+one\n+two\n\\ No newline at end of file\n'), [{start:1,end:2}]);
  assert.deepEqual(parseChangedLines('@@ -1 +1 @@\n-old\n\\ No newline at end of file\n+new\n\\ No newline at end of file\n'), [{start:1,end:1}]);
});
test('补丁按各块的当前行号定位，正文中的加号不被误判为文件头', () => {
  assert.deepEqual(parseChangedLines('@@ -2 +2 @@\n-old\n+++value\n@@ -8 +8,2 @@\n-before\n+after\n+more\n'), [{start:2,end:2},{start:8,end:9}]);
});
test('提示词限定行为、范围与快照，并转义文件名', () => {
  const review={root:'C:\\repo',base:'a'.repeat(40),source:'previous-commit',staged:false,files:[{path:'a\n## injected.ts',status:'added',ranges:[],sha256:'b'.repeat(64)}],skipped:[]};
  const prompt=buildPrompt(review);
  assert.match(prompt,/行为保持不变/); assert.match(prompt,/AGENTS\.md/); assert.match(prompt,/不得修改清单以外/);
  assert.match(prompt,/第一父提交/); assert.match(prompt,/SHA-256=/);
  assert.ok(prompt.includes(JSON.stringify(review.files[0].path)));
  assert.ok(!prompt.includes('\n## injected.ts'));
  assert.throws(() => buildPrompt({...review,files:[{...review.files[0],path:'x'.repeat(MAX_PROMPT_BYTES)}]}),/128 KiB/);
});
test('无工作目录、非法参数和已取消命令不会发送模型消息', async () => {
  const agent={session:{header:{}},followup(){assert.fail('不应发送消息');}};
  const ctx={subprocess:{spawn(){assert.fail('不应运行 Git');}}};
  for(const rawInput of ['', '--bad']) {
    assert.equal((await handleCommand(ctx,{agent,rawInput,signal:idleSignal()})).kind,'error');
  }
  const controller=new AbortController(); controller.abort();
  assert.match((await handleCommand(ctx,{agent,rawInput:'',signal:controller.signal})).text,/取消/);
});
test('卸载取消进行中的 Git 并注销命令', async () => {
  let definition, dispose, unregistered=false, spawned;
  const began=new Promise(resolve => {spawned=resolve;});
  const ctx={effect(fn){dispose=fn();},commands:{register(d){definition=d;return()=>{unregistered=true;};}},subprocess:{spawn(spec){spawned();return {collected:{stdout:reader()},done:new Promise(resolve=>spec.signal.addEventListener('abort',()=>resolve({exitCode:null,signal:'SIGTERM'}),{once:true}))};}}};
  apply(ctx);
  const operation=definition.handler({rawInput:'',signal:idleSignal(),agent:{session:{header:{cwd:process.cwd()}},followup(){assert.fail('已卸载');}}});
  await began; await dispose();
  assert.equal(unregistered,true);
  assert.match((await operation).text,/取消/);
});
