import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createTempDirectory() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'init-config-test-'));
  return tempDir;
}

function cleanupDirectory(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function runInitConfig(workingDir) {
  const initConfigPath = path.resolve(__dirname, '..', 'bin', 'init-config.js');
  const originalCwd = process.cwd();

  try {
    process.chdir(workingDir);
    const output = execSync(`node "${initConfigPath}"`, { encoding: 'utf-8' });
    return output;
  } catch (error) {
    throw error;
  } finally {
    process.chdir(originalCwd);
  }
}

function verifyFile(filePath, expectedContentCheck, isJsonFile = true) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`ファイルが生成されませんでした: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (isJsonFile) {
    const parsedContent = JSON.parse(content);
    
    if (!expectedContentCheck(parsedContent)) {
      throw new Error(`ファイル内容が期待と異なります: ${filePath}`);
    }
    
    return parsedContent;
  } else {
    if (!expectedContentCheck(content)) {
      throw new Error(`ファイル内容が期待と異なります: ${filePath}`);
    }
    
    return content;
  }
}

describe('init-config.js（設定ファイル初期化機能）', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDirectory();
  });

  afterEach(() => {
    cleanupDirectory(tempDir);
  });

  it('すべての設定ファイルが存在しない場合、すべてのファイルを作成する', () => {
    const output = runInitConfig(tempDir);

    // biome.json の検証
    const biomeContent = verifyFile(path.join(tempDir, 'biome.json'), (content) => {
      return content.extends && 
             content.extends.includes('@katsu996/common-utils/biome') &&
             content.linter && 
             content.formatter;
    });
    expect(biomeContent.extends).toContain('@katsu996/common-utils/biome');

    // tsconfig.json の検証
    const tsconfigContent = verifyFile(path.join(tempDir, 'tsconfig.json'), (content) => {
      return content.extends === '@katsu996/common-utils/tsconfig' &&
             content.compilerOptions &&
             content.compilerOptions.outDir === './dist' &&
             content.compilerOptions.rootDir === './src' &&
             content.include &&
             content.exclude;
    });
    expect(tsconfigContent.extends).toBe('@katsu996/common-utils/tsconfig');

    // mise.toml の検証
    const miseContent = verifyFile(path.join(tempDir, 'mise.toml'), (content) => {
      return content.includes('node = "22.16.0"') &&
             content.includes('pnpm = "10.12.4"');
    }, false);
    expect(miseContent).toContain('node = "22.16.0"');
    expect(miseContent).toContain('pnpm = "10.12.4"');

    // vite.config.ts の検証
    const viteContent = verifyFile(path.join(tempDir, 'vite.config.ts'), (content) => {
      return content.includes('import') &&
             content.includes('@katsu996/common-utils/vite') &&
             content.includes('mergeConfig');
    }, false);
    expect(viteContent).toContain('@katsu996/common-utils/vite');
    expect(viteContent).toContain('mergeConfig');

    // vitest.config.ts の検証
    const vitestContent = verifyFile(path.join(tempDir, 'vitest.config.ts'), (content) => {
      return content.includes('import') &&
             content.includes('@katsu996/common-utils/vitest') &&
             content.includes('mergeConfig');
    }, false);
    expect(vitestContent).toContain('@katsu996/common-utils/vitest');
    expect(vitestContent).toContain('mergeConfig');

    expect(output).toContain('created successfully');
  });

  it('既存ファイルはスキップし、変更を行わない', () => {
    // 既存ファイルを作成
    const existingBiome = { existing: 'config' };
    const existingTsconfig = { existing: 'tsconfig' };
    const existingMise = '[tools]\nexisting = "tool"';
    const existingVite = '// existing vite config';
    const existingVitest = '// existing vitest config';

    fs.writeFileSync(
      path.join(tempDir, 'biome.json'),
      JSON.stringify(existingBiome, null, 2)
    );
    fs.writeFileSync(
      path.join(tempDir, 'tsconfig.json'),
      JSON.stringify(existingTsconfig, null, 2)
    );
    fs.writeFileSync(
      path.join(tempDir, 'mise.toml'),
      existingMise
    );
    fs.writeFileSync(
      path.join(tempDir, 'vite.config.ts'),
      existingVite
    );
    fs.writeFileSync(
      path.join(tempDir, 'vitest.config.ts'),
      existingVitest
    );

    const output = runInitConfig(tempDir);

    // 既存ファイルがスキップされることを確認
    expect(output).toContain('already exists');

    // ファイル内容が変更されていないことを確認
    const biomContent = JSON.parse(fs.readFileSync(path.join(tempDir, 'biome.json'), 'utf-8'));
    const tsconfigContent = JSON.parse(fs.readFileSync(path.join(tempDir, 'tsconfig.json'), 'utf-8'));
    const miseContent = fs.readFileSync(path.join(tempDir, 'mise.toml'), 'utf-8');
    const viteContent = fs.readFileSync(path.join(tempDir, 'vite.config.ts'), 'utf-8');
    const vitestContent = fs.readFileSync(path.join(tempDir, 'vitest.config.ts'), 'utf-8');

    expect(JSON.stringify(biomContent)).toBe(JSON.stringify(existingBiome));
    expect(JSON.stringify(tsconfigContent)).toBe(JSON.stringify(existingTsconfig));
    expect(miseContent).toBe(existingMise);
    expect(viteContent).toBe(existingVite);
    expect(vitestContent).toBe(existingVitest);
  });

  it('一部のファイルが存在する場合、不足しているファイルのみを作成する', () => {
    // biome.jsonのみ既存として作成
    const existingBiome = { existing: 'biome' };
    fs.writeFileSync(
      path.join(tempDir, 'biome.json'),
      JSON.stringify(existingBiome, null, 2)
    );

    const output = runInitConfig(tempDir);

    // biome.jsonはスキップ、他のファイルは作成されることを確認
    expect(output).toContain('biome.base.json already exists');
    expect(output).toContain('tsconfig.base.json created successfully');
    expect(output).toContain('mise.toml created successfully');
    expect(output).toContain('vite.config.template.ts created successfully');
    expect(output).toContain('vitest.config.template.ts created successfully');

    // 新しく作成されたファイルが正しく生成されていることを確認
    verifyFile(path.join(tempDir, 'tsconfig.json'), (content) => {
      return content.extends === '@katsu996/common-utils/tsconfig';
    });

    verifyFile(path.join(tempDir, 'mise.toml'), (content) => {
      return content.includes('node = "22.16.0"');
    }, false);

    verifyFile(path.join(tempDir, 'vite.config.ts'), (content) => {
      return content.includes('@katsu996/common-utils/vite');
    }, false);

    verifyFile(path.join(tempDir, 'vitest.config.ts'), (content) => {
      return content.includes('@katsu996/common-utils/vitest');
    }, false);
  });
});

