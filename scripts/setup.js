#!/usr/bin/env node

/**
 * Setup script for Codebase Time Machine
 * Validates environment and provides setup guidance
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envExamplePath = path.join(__dirname, '..', '.env.example');

  if (!fs.existsSync(envPath)) {
    log('\n❌ .env.local not found!', 'red');
    log('\n📝 Creating .env.local from .env.example...', 'yellow');
    
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      log('✅ Created .env.local', 'green');
      log('\n⚠️  Please edit .env.local with your credentials', 'yellow');
      return false;
    } else {
      log('❌ .env.example not found!', 'red');
      return false;
    }
  }

  return true;
}

function validateEnv() {
  // Read .env.local manually instead of using dotenv
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim();
    }
  });

  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const optional = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'WATSONX_API_KEY',
    'WATSONX_PROJECT_ID',
    'WATSONX_REGION',
  ];

  log('\n🔍 Validating environment variables...', 'cyan');

  let allValid = true;
  const missing = [];

  for (const key of required) {
    if (!env[key]) {
      missing.push(key);
      allValid = false;
    }
  }

  if (missing.length > 0) {
    log('\n❌ Missing required variables:', 'red');
    missing.forEach(key => log(`   - ${key}`, 'red'));
    return false;
  }

  log('✅ All required variables present', 'green');

  const missingOptional = optional.filter(key => !env[key]);
  if (missingOptional.length > 0) {
    log('\n⚠️  Missing optional variables:', 'yellow');
    missingOptional.forEach(key => log(`   - ${key}`, 'yellow'));
    
    if (!env.WATSONX_API_KEY && env.DEMO_MODE !== 'true') {
      log('\n💡 Tip: Set DEMO_MODE=true to use mock AI responses', 'cyan');
    }
  }

  return true;
}

function checkDependencies() {
  log('\n📦 Checking dependencies...', 'cyan');
  
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');

  if (!fs.existsSync(nodeModulesPath)) {
    log('❌ node_modules not found!', 'red');
    log('   Run: npm install', 'yellow');
    return false;
  }

  log('✅ Dependencies installed', 'green');
  return true;
}

function printNextSteps() {
  log('\n📋 Next Steps:', 'cyan');
  log('');
  log('1. Set up Supabase:', 'blue');
  log('   - Create a project at https://supabase.com', 'reset');
  log('   - Run supabase-schema.sql in SQL Editor', 'reset');
  log('   - Enable pgvector extension', 'reset');
  log('   - Copy credentials to .env.local', 'reset');
  log('');
  log('2. Set up watsonx.ai (or use demo mode):', 'blue');
  log('   - Get API key from IBM Cloud', 'reset');
  log('   - Add to .env.local', 'reset');
  log('   - OR set DEMO_MODE=true for testing', 'reset');
  log('');
  log('3. Start development server:', 'blue');
  log('   npm run dev', 'green');
  log('');
  log('4. Open http://localhost:3000', 'blue');
  log('');
  log('📚 Documentation:', 'cyan');
  log('   - Backend API: docs/BACKEND.md', 'reset');
  log('   - Main README: README.md', 'reset');
  log('');
}

function main() {
  log('\n🕰️  Codebase Time Machine - Setup', 'cyan');
  log('=====================================\n', 'cyan');

  const hasEnv = checkEnvFile();
  const depsOk = checkDependencies();

  if (!hasEnv) {
    log('\n⚠️  Setup incomplete. Please configure .env.local first.', 'yellow');
    printNextSteps();
    process.exit(1);
  }

  const envValid = validateEnv();

  if (!depsOk || !envValid) {
    log('\n⚠️  Setup incomplete. Please fix the issues above.', 'yellow');
    printNextSteps();
    process.exit(1);
  }

  log('\n✅ Setup complete! Ready to run.', 'green');
  log('\n🚀 Start the dev server:', 'cyan');
  log('   npm run dev', 'green');
  log('');
}

main();

// Made with Bob
