import { after } from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../.test-tmp/', import.meta.url));
const created = [];
mkdirSync(root, { recursive: true });
after(() => { for (const cwd of created) rmSync(cwd, { recursive: true, force: true }); });

export function repo() {
  const cwd = mkdtempSync(join(root, 'repo-'));
  created.push(cwd);
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' });
  git('init', '-q');
  git('config', 'user.name', 'Fixture');
  git('config', 'user.email', 'fixture@example.invalid');
  git('config', 'core.autocrlf', 'false');
  git('config', 'core.quotepath', 'true');
  const write = (path, text) => writeFileSync(join(cwd, path), text);
  const commit = () => { git('add', '.'); git('commit', '-qm', 'fixture'); };
  return { cwd, git, write, commit };
}

export const run = async (args, cwd, allowedCodes = [0]) => {
  try { return { code: 0, stdout: execFileSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' }) }; }
  catch (error) {
    if (allowedCodes.includes(error.status)) return { code: error.status, stdout: error.stdout };
    throw new Error(error.stderr || error.message);
  }
};
