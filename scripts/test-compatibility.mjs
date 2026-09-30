import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// 用当前开发基线编译，再把真实命令测试指到各版独立宿主，避免旧版借用新版包。
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const supported = ['0.1.2-rc.1', '0.1.5-rc.1', '0.1.5-rc.2', '0.1.5-rc.3', '0.1.7-rc.1', '0.1.7-rc.2', '0.2.0-rc.1', '0.2.0-rc.2'];
const versions = process.argv.slice(2);
if (!versions.length) versions.push(...supported);
if (versions.some(version => !supported.includes(version))) throw new Error('请使用指定的 DSH 候选版本');
if (!process.env.npm_execpath) throw new Error('请通过 npm run test:compat 执行');

const built = spawnSync(process.execPath, [process.env.npm_execpath, 'run', 'build'], { cwd: root, stdio: 'inherit', windowsHide: true });
if (built.error || built.status !== 0) throw new Error('最新版开发依赖下的构建失败');

const results = [];
for (const version of versions) {
  const directory = join(root, '.cache', 'compatibility', version);
  mkdirSync(directory, { recursive: true });
  const log = join(directory, 'verification.log');
  writeFileSync(log, '', 'utf8');
  console.log(`\nDSH ${version}：准备独立宿主`);
  try {
    writeFileSync(join(directory, 'package.json'), JSON.stringify({
      name: 'dsh-simplify-compatibility',
      private: true,
      dependencies: {
        '@deepseek-ai/cordis': '4.0.4',
        '@deepseek-ai/dsh-commands': version,
        '@deepseek-ai/dsh-subprocess-local': version,
      },
    }, null, 2) + '\n', 'utf8');
    const env = { ...process.env, DSH_RUNTIME_ROOT: join(directory, 'node_modules') };
    const run = args => {
      const result = spawnSync(process.execPath, args, { cwd: directory, env, encoding: 'utf8', timeout: 180_000, windowsHide: true });
      writeFileSync(log, `${readFileSync(log, 'utf8')}\n$ node ${args.join(' ')}\n${result.stdout ?? ''}${result.stderr ?? ''}`, 'utf8');
      if (result.error || result.status !== 0) throw new Error(result.error?.message ?? `${args.at(-1)} 失败；详见 ${log}`);
    };
    run([process.env.npm_execpath, 'install', '--ignore-scripts', '--legacy-peer-deps', '--no-audit', '--no-fund']);
    for (const name of ['@deepseek-ai/dsh-commands', '@deepseek-ai/dsh-subprocess-local']) {
      const installed = JSON.parse(readFileSync(join(directory, 'node_modules', name, 'package.json'), 'utf8'));
      if (installed.version !== version) throw new Error(`${name} 误装为 ${installed.version}`);
    }
    run(['--test', join(root, 'tests', 'host.test.mjs')]);
    results.push({ version, status: 'passed', log });
    console.log(`DSH ${version}：真实命令与 Git 测试通过`);
  } catch (error) {
    results.push({ version, status: 'failed', error: String(error), log });
    console.error(`DSH ${version}：${error}`);
  }
}
writeFileSync(join(root, '.cache', 'compatibility', 'results.json'), JSON.stringify(results, null, 2) + '\n', 'utf8');
if (results.some(result => result.status !== 'passed')) process.exitCode = 1;
