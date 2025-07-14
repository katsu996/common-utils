#!/usr/bin/env node
// common-utils-repo/bin/init-config.js

const fs = require('node:fs');
const path = require('node:path');

const packageRoot = path.resolve(__dirname, '..'); // パッケージのルートディレクトリ

const filesToCopy = [
  {
    source: path.join(packageRoot, 'biome.json'),
    destination: path.join(process.cwd(), 'biome.json'),
    contentModifier: (content) => {
      // biome.json には extends を追加
      const config = JSON.parse(content);
      if (!config.extends) {
        config.extends = [];
      }
      const extendPath = './node_modules/ @katsu996/common-utils/biome.json';
      if (!config.extends.includes(extendPath)) {
        config.extends.unshift(extendPath); // 先頭に追加
      }
      return JSON.stringify(config, null, 2);
    },
  },
  {
    source: path.join(packageRoot, 'tsconfig.json'),
    destination: path.join(process.cwd(), 'tsconfig.json'),
    contentModifier: (content) => {
      // tsconfig.json には extends を追加
      const config = JSON.parse(content);
      config.extends = ' @katsu996/common-utils/tsconfig.json';
      return JSON.stringify(config, null, 2);
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
