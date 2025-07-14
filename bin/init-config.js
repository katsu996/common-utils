#!/usr/bin/env node
// common-utils-repo/bin/init-config.js

const fs = require('node:fs');
const path = require('node:path');

const packageRoot = path.resolve(__dirname, '..'); // パッケージのルートディレクトリ

const filesToCopy = [
  {
    source: path.join(packageRoot, 'biome.base.json'),
    destination: path.join(process.cwd(), 'biome.json'),
    contentModifier: (content) => {
      // 基本的なbiome設定にextendsを追加
      const config = JSON.parse(content);
      const baseConfig = {
        extends: ['@katsu996/common-utils/biome'],
        ...config,
      };
      return JSON.stringify(baseConfig, null, 2);
    },
  },
  {
    source: path.join(packageRoot, 'tsconfig.base.json'),
    destination: path.join(process.cwd(), 'tsconfig.json'),
    contentModifier: (content) => {
      // tsconfig.json には extends を追加
      const config = JSON.parse(content);
      const baseConfig = {
        extends: '@katsu996/common-utils/tsconfig',
        compilerOptions: {
          outDir: './dist',
          rootDir: './src',
          noEmit: false
        },
        include: ['src/**/*'],
        exclude: ['node_modules', 'dist']
      };
      return JSON.stringify(baseConfig, null, 2);
    },
  },
];

function initializeConfigFile(file) {
  const { source, destination, contentModifier, name } = file;
  const fileName = name || path.basename(source);

  if (fs.existsSync(destination)) {
    console.log(`⚠️  ${fileName} already exists at ${destination}. Skipping initial creation.`);
    console.log(
      `   To update, please manually edit or consider 'pnpm update @katsu996/common-utils'.`,
    );
  } else {
    try {
      let content = fs.readFileSync(source, 'utf8');
      if (contentModifier) {
        content = contentModifier(content);
      }
      fs.writeFileSync(destination, content, 'utf8');
      console.log(`✅ ${fileName} created successfully at ${destination}.`);
    } catch (error) {
      console.error(`❌ Failed to create ${fileName}:`, error.message);
    }
  }
}

console.log('Initializing common configurations...');
filesToCopy.forEach(initializeConfigFile);
console.log('Configuration initialization complete.');
