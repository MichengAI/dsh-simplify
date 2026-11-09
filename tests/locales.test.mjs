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

test('全部 9 份 README 导航内部锚点及跨文件锚点均对应实际章节标题，零死链', () => {
  const readmes = [
    'README.md',
    'README.zh-CN.md',
    'README.en.md',
    'README.ja.md',
    'README.es.md',
    'README.fr.md',
    'README.de.md',
    'README.ru.md',
    'README.pt.md',
  ];

  const slugify = (text) => {
    return text.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-');
  };

  const fileHeaders = new Map();
  for (const name of readmes) {
    const filePath = join(rootDir, name);
    assert.ok(existsSync(filePath), `README 不存在: ${name}`);
    const text = readFileSync(filePath, 'utf8');
    const headers = Array.from(text.matchAll(/^#{1,6}\s+(.+)$/gm)).map(m => slugify(m[1]));
    fileHeaders.set(name, headers);
  }

  for (const name of readmes) {
    const filePath = join(rootDir, name);
    const text = readFileSync(filePath, 'utf8');
    const headerMatches = fileHeaders.get(name);
    // 1. 同文件内部锚点 [label](#anchor)
    const anchorMatches = Array.from(text.matchAll(/\[([^\]]+)\]\(#([^\)]+)\)/g));
    assert.ok(anchorMatches.length > 0, `${name} 必须包含导航锚点`);
    for (const [, label, anchor] of anchorMatches) {
      const slug = slugify(anchor);
      assert.ok(
        headerMatches.includes(slug) || headerMatches.includes(anchor),
        `${name} 中的导航锚点 #${anchor} (${label}) 在正文中未找到对应的标题章节`
      );
    }

    // 2. 跨文件锚点链接 [label](target.md#anchor)
    const crossMatches = Array.from(text.matchAll(/\[([^\]]+)\]\(([A-Za-z0-9._-]+\.md)#([^\)\s]+)\)/g));
    for (const [, label, targetFile, targetAnchor] of crossMatches) {
      assert.ok(fileHeaders.has(targetFile), `${name} 引用了未知的 README: ${targetFile}`);
      const targetHeaders = fileHeaders.get(targetFile);
      const slug = slugify(targetAnchor);
      assert.ok(
        targetHeaders.includes(slug) || targetHeaders.includes(targetAnchor),
        `${name} 中的跨文件锚点 ${targetFile}#${targetAnchor} (${label}) 在目标文件中未找到对应章节`
      );
    }
  }
});

test('客户端 SupportedLocale 8 语集合与 locale 字典文件名完全一致', () => {
  const clientTs = readFileSync(join(rootDir, 'src/client.ts'), 'utf8');
  const match = clientTs.match(/export type SupportedLocale = ([^;]+);/);
  assert.ok(match, '未在 src/client.ts 中找到 SupportedLocale 类型定义');
  const localesInClient = match[1]
    .split('|')
    .map(s => s.trim().replace(/['"]/g, ''))
    .sort();
  assert.deepEqual(localesInClient, [...OFFICIAL_LANGUAGES].sort());
});
