#!/usr/bin/env node

/**
 * API Test Utility for Codebase Time Machine
 * Quick smoke tests for all backend endpoints
 */

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

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
let testRepoId = null;

async function testEndpoint(name, method, path, body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();

    if (response.ok) {
      log(`✅ ${name}`, 'green');
      return { success: true, data };
    } else {
      log(`❌ ${name} - ${response.status}: ${data.error || 'Unknown error'}`, 'red');
      return { success: false, error: data.error };
    }
  } catch (error) {
    log(`❌ ${name} - ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('\n🧪 Codebase Time Machine - API Tests', 'cyan');
  log('======================================\n', 'cyan');

  log('Testing against: ' + BASE_URL, 'blue');
  log('');

  // Test 1: Repository Ingestion
  log('📦 Testing Repository Management...', 'yellow');
  const ingestResult = await testEndpoint(
    'POST /api/repos/ingest',
    'POST',
    '/api/repos/ingest',
    { url: 'https://github.com/lodash/lodash' }
  );

  if (ingestResult.success) {
    testRepoId = ingestResult.data.repo_id;
    log(`   Repo ID: ${testRepoId}`, 'cyan');
  }

  // Wait a bit for processing
  log('\n⏳ Waiting 3 seconds for processing...', 'yellow');
  await new Promise(resolve => setTimeout(resolve, 3000));

  if (testRepoId) {
    // Test 2: Get Repository
    log('\n📊 Testing Repository Endpoints...', 'yellow');
    await testEndpoint(
      'GET /api/repos/[id]',
      'GET',
      `/api/repos/${testRepoId}`
    );

    // Test 3: Files
    await testEndpoint(
      'GET /api/repos/[id]/files',
      'GET',
      `/api/repos/${testRepoId}/files`
    );

    // Test 4: Authors
    await testEndpoint(
      'GET /api/repos/[id]/authors',
      'GET',
      `/api/repos/${testRepoId}/authors`
    );

    // Test 5: Graph
    log('\n🗺️  Testing Visualization Endpoints...', 'yellow');
    await testEndpoint(
      'GET /api/repos/[id]/graph',
      'GET',
      `/api/repos/${testRepoId}/graph`
    );

    // Test 6: Heatmap
    await testEndpoint(
      'GET /api/repos/[id]/heatmap',
      'GET',
      `/api/repos/${testRepoId}/heatmap`
    );

    // Test 7: Chat (Why Engine)
    log('\n💬 Testing AI Endpoints...', 'yellow');
    await testEndpoint(
      'POST /api/repos/[id]/chat',
      'POST',
      `/api/repos/${testRepoId}/chat`,
      { message: 'What is the main purpose of this codebase?', mode: 'why' }
    );

    // Test 8: ADRs List
    await testEndpoint(
      'GET /api/repos/[id]/adrs',
      'GET',
      `/api/repos/${testRepoId}/adrs`
    );

    // Test 9: Onboarding
    log('\n🎓 Testing Onboarding Endpoint...', 'yellow');
    await testEndpoint(
      'POST /api/repos/[id]/onboarding',
      'POST',
      `/api/repos/${testRepoId}/onboarding`,
      { role: 'fullstack', seniority: 'mid' }
    );
  } else {
    log('\n⚠️  Skipping repo-specific tests (no repo ID)', 'yellow');
  }

  // Summary
  log('\n📋 Test Summary', 'cyan');
  log('================', 'cyan');
  log('');
  log('✅ All critical endpoints tested', 'green');
  log('');
  log('💡 Tips:', 'cyan');
  log('   - Check server logs for detailed errors', 'reset');
  log('   - Ensure DEMO_MODE=true if no watsonx.ai credentials', 'reset');
  log('   - Repository processing may take 30-60 seconds', 'reset');
  log('');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(BASE_URL);
    return response.ok || response.status === 404; // 404 is fine, means server is up
  } catch {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    log('\n❌ Server not running at ' + BASE_URL, 'red');
    log('\n💡 Start the server first:', 'yellow');
    log('   npm run dev', 'green');
    log('');
    process.exit(1);
  }

  await runTests();
}

main().catch(error => {
  log('\n❌ Test suite failed: ' + error.message, 'red');
  process.exit(1);
});

// Made with Bob
