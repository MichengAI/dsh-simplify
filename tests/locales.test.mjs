import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));

const OFFICIAL_LANGUAGES = ['zh', 'en', 'ja', 'es', 'fr', 'de', 'ru', 'pt'];

test('官方 8 门内置语言元数据字典完整性与 detail 路径有效性', () => {
  for (const lang of OFFICIAL_LANGUAGES) {
    const localePath = join(rootDir, 'locale', `${lang}.json`);
    assert.ok(existsSync(localePath), `缺少语言字典: locale/${lang}.json`);
    const content = JSON.parse(readFileSync(localePath, 'utf8'));
    assert.ok(content.meta, `locale/${lang}.json 缺少 meta 字段`);
    assert.equal(typeof content.meta.title, 'string', `locale/${lang}.json meta.title 必须是字符串`);
    assert.ok(content.meta.title.length > 0, `locale/${lang}.json meta.title 不能为空`);
    assert.equal(typeof content.meta.description, 'string', `locale/${lang}.json meta.description 必须是字符串`);
    assert.ok(content.meta.description.length > 0, `locale/${lang}.json meta.description 不能为空`);
    assert.equal(typeof content.meta.detail, 'string', `locale/${lang}.json 必须声明 meta.detail`);
    assert.ok(existsSync(join(rootDir, content.meta.detail)), `locale/${lang}.json 引用的 detail 文件不存在: ${content.meta.detail}`);
    assert.ok(packageJson.files.includes(content.meta.detail), `package.json files 必须包含 detail 文件: ${content.meta.detail}`);
  }
});

test('package.json 插件规范元数据与清单版本一致性', () => {
  assert.equal(packageJson.dsh?.manifestVersion, 1);
  assert.equal(packageJson.author?.name, 'MichengAI');
  assert.equal(packageJson.author?.url, 'https://github.com/MichengAI');
  assert.ok(Array.isArray(packageJson.keywords) && packageJson.keywords.includes('simplify'));
  assert.equal(packageJson.icon, './assets/icon.svg');
  assert.equal(packageJson.exports?.['./icon'], './assets/icon.svg');
  assert.ok(existsSync(join(rootDir, 'assets/icon.svg')));
});
