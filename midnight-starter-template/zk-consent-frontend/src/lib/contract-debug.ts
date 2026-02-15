/**
 * Debug helper to test contract service
 */

import { contractService } from './contract';
import { hashIdentifier } from './hash';

export async function testContractFlow() {
  console.log('=== Testing Contract Flow ===');

  // Test 1: Hash generation
  const testId = 'test@example.com';
  const hash = await hashIdentifier(testId);

  console.log('1. Testing hash generation...');
  console.log('   Identifier:', testId);
  console.log('   Hash:', hash.toString(16));

  // Test 2: Verify consent (reads from indexer)
  console.log('\n2. Testing verify consent (indexer query)...');
  const verifyResult = await contractService.verifyConsent(hash);
  console.log('   Verify Result:', verifyResult);

  console.log('\n=== Test Complete ===');
}

// Export for use in browser console
(window as any).testContractFlow = testContractFlow;
