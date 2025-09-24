#!/usr/bin/env node

/**
 * Setup verification script for SDSA
 * Checks that all requirements are met for development
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Verifying SDSA setup...\n');

let errors = 0;

// Check Node version
try {
  const nodeVersion = process.version;
  const requiredMajor = 20;
  const currentMajor = parseInt(nodeVersion.slice(1).split('.')[0]);

  if (currentMajor >= requiredMajor) {
    console.log(`✅ Node.js version: ${nodeVersion}`);
  } else {
    console.log(`❌ Node.js version ${nodeVersion} (requires v${requiredMajor} or higher)`);
    errors++;
  }
} catch (e) {
  console.log('❌ Could not check Node.js version');
  errors++;
}

// Check yarn version
try {
  const yarnVersion = execSync('yarn -v').toString().trim();
  console.log(`✅ Yarn version: ${yarnVersion}`);
} catch (e) {
  console.log('❌ Yarn not found. Install with: npm install -g yarn');
  errors++;
}

// Check if node_modules exists
if (fs.existsSync(path.join(__dirname, '..', 'node_modules'))) {
  console.log('✅ Dependencies installed');
} else {
  console.log('❌ Dependencies not installed. Run: yarn install');
  errors++;
}

// Check required files
const requiredFiles = [
  'package.json',
  'yarn.lock',
  'app.json',
  'tsconfig.json',
  'App.tsx',
  '.nvmrc',
  '.node-version',
];

requiredFiles.forEach((file) => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    errors++;
  }
});

// Check environment
const env = process.env.NODE_ENV || 'development';
console.log(`✅ Environment: ${env}`);

// Check for Gemini API key configuration
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envPath = path.join(__dirname, '..', '.env');
const hasEnvLocal = fs.existsSync(envLocalPath);
const hasEnv = fs.existsSync(envPath);

if (hasEnvLocal || hasEnv) {
  // Check if API key is configured (without exposing it)
  try {
    const envFile = fs.readFileSync(hasEnvLocal ? envLocalPath : envPath, 'utf8');
    const hasApiKey = envFile.includes('EXPO_PUBLIC_GEMINI_API_KEY=') &&
                     !envFile.includes('EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here');

    if (hasApiKey) {
      console.log('✅ Gemini API key configured');
    } else {
      console.log('⚠️  Gemini API key not configured (AI features will not work)');
      console.log('    To configure: cp .env.example .env.local');
      console.log('    Then add your API key from https://aistudio.google.com/app/apikey');
    }
  } catch (e) {
    console.log('⚠️  Could not check API key configuration');
  }
} else {
  console.log('ℹ️  No .env.local file found');
  console.log('    To enable AI features: cp .env.example .env.local');
  console.log('    Then add your Gemini API key');
}

console.log('\n' + '='.repeat(50));

if (errors === 0) {
  console.log('✅ Setup verification complete! Ready to develop.');
  console.log('\nNext steps:');
  console.log('  yarn start       # Start development server');
  console.log('  yarn web         # Open in web browser');
  process.exit(0);
} else {
  console.log(`❌ Setup verification failed with ${errors} error(s).`);
  console.log('\nPlease fix the issues above and try again.');
  process.exit(1);
}
