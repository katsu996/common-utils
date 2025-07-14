#!/usr/bin/env node
// テスト用のinit-config.jsの動作確認スクリプト

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execSync } = require('node:child_process');

// カラー出力用の定数
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function createTempDirectory() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'init-config-test-'));
  log(`テスト用一時ディレクトリ作成: ${tempDir}`, colors.blue);
  return tempDir;
}

function cleanupDirectory(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    log(`一時ディレクトリ削除: ${dir}`, colors.blue);
  }
}

function runInitConfig(workingDir) {
  const initConfigPath = path.resolve(__dirname, '..', 'bin', 'init-config.js');
  const originalCwd = process.cwd();

  try {
    process.chdir(workingDir);
    log(`実行中: node ${initConfigPath}`, colors.blue);
    const output = execSync(`node "${initConfigPath}"`, { encoding: 'utf-8' });
    log('init-config.js 出力:', colors.yellow);
    console.log(output);
    return output;
  } catch (error) {
    log(`エラー: ${error.message}`, colors.red);
    throw error;
  } finally {
    process.chdir(originalCwd);
  }
}

function verifyFile(filePath, expectedContentCheck) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`ファイルが生成されませんでした: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const parsedContent = JSON.parse(content);

  if (expectedContentCheck(parsedContent)) {
    log(`✅ ${path.basename(filePath)} 検証成功`, colors.green);
  } else {
    throw new Error(`ファイル内容が期待と異なります: ${filePath}`);
  }

  log(`📄 ${path.basename(filePath)} 内容:`, colors.blue);
  console.log(JSON.stringify(parsedContent, null, 2));
}

function testCase1_NewFiles() {
  log('\n=== テストケース1: 新規ファイル生成 ===', colors.yellow);

  const tempDir = createTempDirectory();

  try {
    runInitConfig(tempDir);

    // biome.json の検証
    verifyFile(path.join(tempDir, 'biome.json'), (content) => {
      return content.extends && 
             content.extends.includes('@katsu996/common-utils/biome') &&
             content.linter && 
             content.formatter;
    });

    // tsconfig.json の検証
    verifyFile(path.join(tempDir, 'tsconfig.json'), (content) => {
      return content.extends === '@katsu996/common-utils/tsconfig' &&
             content.compilerOptions &&
             content.compilerOptions.outDir === './dist' &&
             content.compilerOptions.rootDir === './src' &&
             content.include &&
             content.exclude;
    });

    log('✅ テストケース1: 成功', colors.green);
  } catch (error) {
    log(`❌ テストケース1: 失敗 - ${error.message}`, colors.red);
    throw error;
  } finally {
    cleanupDirectory(tempDir);
  }
}

function testCase2_ExistingFiles() {
  log('\n=== テストケース2: 既存ファイルがある場合 ===', colors.yellow);

  const tempDir = createTempDirectory();

  try {
    // 既存ファイルを作成
    const existingBiome = { existing: 'config' };
    const existingTsconfig = { existing: 'tsconfig' };

    fs.writeFileSync(
      path.join(tempDir, 'biome.json'),
      JSON.stringify(existingBiome, null, 2)
    );
    fs.writeFileSync(
      path.join(tempDir, 'tsconfig.json'),
      JSON.stringify(existingTsconfig, null, 2)
    );

    const output = runInitConfig(tempDir);

    // 既存ファイルがスキップされることを確認
    if (!output.includes('already exists')) {
      throw new Error('既存ファイルのスキップメッセージが表示されませんでした');
    }

    // ファイル内容が変更されていないことを確認
    const biomContent = JSON.parse(fs.readFileSync(path.join(tempDir, 'biome.json'), 'utf-8'));
    const tsconfigContent = JSON.parse(fs.readFileSync(path.join(tempDir, 'tsconfig.json'), 'utf-8'));

    if (JSON.stringify(biomContent) !== JSON.stringify(existingBiome)) {
      throw new Error('既存のbiome.jsonが変更されました');
    }

    if (JSON.stringify(tsconfigContent) !== JSON.stringify(existingTsconfig)) {
      throw new Error('既存のtsconfig.jsonが変更されました');
    }

    log('✅ テストケース2: 成功', colors.green);
  } catch (error) {
    log(`❌ テストケース2: 失敗 - ${error.message}`, colors.red);
    throw error;
  } finally {
    cleanupDirectory(tempDir);
  }
}

function testCase3_PartialExisting() {
  log('\n=== テストケース3: 一部ファイルのみ既存 ===', colors.yellow);

  const tempDir = createTempDirectory();

  try {
    // biome.jsonのみ既存として作成
    const existingBiome = { existing: 'biome' };
    fs.writeFileSync(
      path.join(tempDir, 'biome.json'),
      JSON.stringify(existingBiome, null, 2)
    );

    const output = runInitConfig(tempDir);

    // biome.jsonはスキップ、tsconfig.jsonは作成されることを確認
    if (!output.includes('biome.base.json already exists')) {
      throw new Error('biome.jsonのスキップメッセージが表示されませんでした');
    }

    if (!output.includes('tsconfig.base.json created successfully')) {
      throw new Error('tsconfig.jsonの作成メッセージが表示されませんでした');
    }

    // tsconfig.jsonが正しく生成されていることを確認
    verifyFile(path.join(tempDir, 'tsconfig.json'), (content) => {
      return content.extends === '@katsu996/common-utils/tsconfig';
    });

    log('✅ テストケース3: 成功', colors.green);
  } catch (error) {
    log(`❌ テストケース3: 失敗 - ${error.message}`, colors.red);
    throw error;
  } finally {
    cleanupDirectory(tempDir);
  }
}

function runAllTests() {
  log('🧪 init-config.js テスト開始', colors.blue);

  try {
    testCase1_NewFiles();
    testCase2_ExistingFiles();
    testCase3_PartialExisting();

    log('\n🎉 全テストケース成功！', colors.green);
  } catch (error) {
    log(`\n💥 テスト失敗: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// メイン実行
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testCase1_NewFiles,
  testCase2_ExistingFiles,
  testCase3_PartialExisting,
  runAllTests
};