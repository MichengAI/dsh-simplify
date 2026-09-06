import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from '../lib/args.js';
import { collectReview, verifyReview } from '../lib/git.js';
import { repo, run } from './fixture.mjs';
const collect = (r, input = '') => collectReview(run, r.cwd, parseArgs(input));

test('参数支持引号、中文、Windows 反斜杠和选项终止符', () => {
  const result = parseArgs('"C:\\work space\\中文.ts" -- --staged.ts');
  assert.deepEqual(result.files, ['C:\\work space\\中文.ts', '--staged.ts']);
  assert.equal(parseArgs('--ref main').ref, 'main');
  assert.equal(parseArgs('--ref=HEAD').explicitRef, true);
});
test('拒绝非法参数、未闭合引号和冲突选项', () => {
  for (const input of ['--bad', '--ref=', '--ref=-x', '"a.ts', '--staged --ref=HEAD', '""', '--ref a..b']) {
    assert.throws(() => parseArgs(input), undefined, input);
  }
});
test('中文与空格文件名返回准确行号', async () => {
  const r = repo(); r.write('中文 space.ts', 'before\n'); r.commit(); r.write('中文 space.ts', 'after\n');
  const review = await collect(r);
  assert.equal(review.files[0].path, '中文 space.ts');
  assert.deepEqual(review.files[0].ranges, [{ start: 1, end: 1 }]);
});
test('未跟踪文件在自动和显式模式都按整文件处理', async () => {
  const r = repo(); r.write('a.ts', 'base\n'); r.commit(); r.write('new file.ts', 'new\n');
  for (const input of ['', '"new file.ts"']) {
    const review = await collect(r, input);
    assert.equal(review.files[0].path, 'new file.ts');
    assert.equal(review.files[0].status, 'added');
  }
});
test('无首次提交时也收集暂存和未跟踪文件', async () => {
  const r = repo(); r.write('a.ts', 'new\n'); r.git('add', 'a.ts'); r.write('b.ts', 'new\n');
  assert.equal((await collect(r)).files.length, 2);
  assert.deepEqual((await collect(r, '--staged')).files.map(f => f.path), ['a.ts']);
});
test('单提交干净仓库返回无变更', async () => {
  const r = repo(); r.write('a.ts', 'base\n'); r.commit();
  assert.equal((await collect(r)).files.length, 0);
});
test('仅默认范围允许回看上一提交，显式范围和空暂存区不回退', async () => {
  const r = repo(); r.write('a.ts', 'before\n'); r.commit(); r.write('a.ts', 'after\n'); r.commit();
  assert.equal((await collect(r)).source, 'previous-commit');
  for (const input of ['--staged', '--ref=HEAD', 'a.ts']) assert.equal((await collect(r, input)).files.length, 0);
  await assert.rejects(collect(r, '--ref=does-not-exist'));
});
test('暂存文件有未暂存改动时拒绝错位范围', async () => {
  const r = repo(); r.write('a.ts', 'one\ntwo\n'); r.commit();
  r.write('a.ts', 'one\nTWO\n'); r.git('add', 'a.ts'); r.write('a.ts', 'insert\none\nTWO\n');
  await assert.rejects(collect(r, '--staged'), /未暂存/);
});
test('无关文件未暂存不影响指定暂存文件', async () => {
  const r = repo(); r.write('a.ts', 'a\n'); r.write('b.ts', 'b\n'); r.commit();
  r.write('a.ts', 'A\n'); r.git('add', 'a.ts'); r.write('b.ts', 'B\n');
  const review = await collect(r, '--staged a.ts');
  assert.deepEqual(review.files[0].ranges, [{ start: 1, end: 1 }]);
});
test('删除、二进制及纯删除行不会扩大到其他文件', async () => {
  const r = repo(); r.write('a.ts', 'one\ntwo\n'); r.write('b.ts', 'b\n'); r.write('bin', Buffer.from([0, 1])); r.commit();
  r.write('a.ts', 'one\n'); r.git('rm', 'b.ts'); r.write('bin', Buffer.from([0, 2]));
  const review = await collect(r);
  assert.equal(review.source, 'worktree');
  assert.equal(review.files.length, 0);
  assert.equal(review.skipped.length, 3);
});
test('目录参数会展开实际变更文件，子目录会话能定位根目录文件', async () => {
  const r = repo(); mkdirSync(join(r.cwd, 'src')); r.write('src/a.ts', 'a\n'); r.commit(); r.write('src/a.ts', 'A\n');
  assert.equal((await collect(r, 'src')).files[0].path, 'src/a.ts');
  const review = await collectReview(run, join(r.cwd, 'src'), parseArgs('a.ts'));
  assert.equal(review.files[0].path, 'src/a.ts');
});
test('拒绝不存在、忽略、仓库外路径且不把文件名当通配符', async () => {
  const r = repo(); r.write('a.ts', 'a\n'); r.write('.gitignore', 'secret\n'); r.commit(); r.write('secret', 'x\n');
  for (const input of ['missing.ts', 'secret', '../outside', '*.ts']) await assert.rejects(collect(r, input));
});
test('重命名只包含新增内容行而非整文件', async () => {
  const r = repo(); r.write('old.ts', 'one\ntwo\nthree\nfour\nfive\n'); r.commit();
  r.git('mv', 'old.ts', 'new.ts'); r.write('new.ts', 'one\nTWO\nthree\nfour\nfive\n');
  const review = await collect(r);
  assert.equal(review.files[0].path, 'new.ts');
  assert.deepEqual(review.files[0].ranges, [{ start: 2, end: 2 }]);
});
test('Git 失败传播，不返回无变更', async () => {
  await assert.rejects(collectReview(async () => { throw new Error('git failed'); }, process.cwd(), parseArgs('')), /git failed/);
});
test('入队前发现内容、HEAD 或暂存区变化时拒绝旧快照', async () => {
  const r = repo(); r.write('a.ts', 'a\n'); r.commit(); r.write('a.ts', 'A\n');
  const review = await collect(r);
  r.write('a.ts', 'changed again\n');
  await assert.rejects(verifyReview(run, review), /文件已变化/);
  r.git('add', 'a.ts');
  const staged = await collect(r, '--staged');
  r.git('reset', '-q', 'HEAD', '--', 'a.ts');
  await assert.rejects(verifyReview(run, staged), /暂存区/);
  r.commit();
  await assert.rejects(verifyReview(run, review), /HEAD/);
});
test('Git 强制彩色配置不影响 hunk 解析', async () => {
  const r = repo(); r.write('a.ts', 'a\n'); r.commit(); r.git('config', 'color.ui', 'always'); r.write('a.ts', 'A\n');
  assert.deepEqual((await collect(r)).files[0].ranges, [{start:1,end:1}]);
});
test('所选范围发生冲突时拒绝审查', async () => {
  const r = repo(); r.write('a.ts', 'base\n'); r.commit(); const first = r.git('rev-parse', 'HEAD').trim();
  r.git('checkout', '-qb', 'other'); r.write('a.ts', 'other\n'); r.commit();
  r.git('checkout', '-qb', 'primary', first); r.write('a.ts', 'primary\n'); r.commit();
  assert.throws(() => r.git('merge', 'other'));
  await assert.rejects(collect(r), /冲突/);
});
