/**
 * Automated Verification Suite for Firebase Authentication Integration
 */

import { prisma } from '../src/lib/prisma';
import { verifyFirebaseIdToken, syncFirebaseUserToDatabase } from '../src/lib/firebase-admin';
import { app, auth } from '../src/lib/firebase';

async function runFirebaseAuthTests() {
  console.log('====================================================');
  console.log('Starting Firebase Authentication Verification Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const testUid = `fb_uid_${Date.now()}`;
  const testEmail = `firebase_tester_${Date.now()}@example.com`;
  const testName = 'Jordan Rivera (Firebase Tester)';

  try {
    // 1. Verify Client Firebase App & Auth instance initialization
    if (app && auth) {
      console.log(`✅ [PASS] Client Firebase App & Auth initialized successfully (${app.name})`);
      passed++;
    } else {
      console.error('❌ [FAIL] Client Firebase App or Auth failed initialization');
      failed++;
    }

    // 2. Verify server-side token decoder with sandbox/test token
    const testToken = `test_token_:${testUid}:${testEmail}:${testName}`;
    const verifiedIdentity = await verifyFirebaseIdToken(testToken);

    if (verifiedIdentity && verifiedIdentity.uid === testUid && verifiedIdentity.email === testEmail) {
      console.log(`✅ [PASS] verifyFirebaseIdToken extracted identity: UID=${verifiedIdentity.uid}, Email=${verifiedIdentity.email}`);
      passed++;
    } else {
      console.error('❌ [FAIL] verifyFirebaseIdToken failed to verify test token:', verifiedIdentity);
      failed++;
    }

    // 3. Test Rejection of Invalid/Empty Token
    const invalidIdentity = await verifyFirebaseIdToken('');
    if (invalidIdentity === null) {
      console.log('✅ [PASS] verifyFirebaseIdToken correctly rejected empty/invalid token');
      passed++;
    } else {
      console.error('❌ [FAIL] verifyFirebaseIdToken accepted invalid token!');
      failed++;
    }

    // 4. Test Database Synchronization with verified Firebase identity
    const syncedUser = await syncFirebaseUserToDatabase(verifiedIdentity!);
    if (syncedUser && syncedUser.firebaseUid === testUid && syncedUser.email === testEmail) {
      console.log(`✅ [PASS] syncFirebaseUserToDatabase created persistent PostgreSQL user: ID=${syncedUser.id}, firebaseUid=${syncedUser.firebaseUid}`);
      passed++;
    } else {
      console.error('❌ [FAIL] Database synchronization failed:', syncedUser);
      failed++;
    }

    // 5. Test Unique Constraint on firebaseUid
    try {
      await prisma.user.create({
        data: {
          firebaseUid: testUid,
          email: `duplicate_${Date.now()}@example.com`,
          name: 'Duplicate UID User',
        },
      });
      console.error('❌ [FAIL] Duplicate firebaseUid should have thrown unique constraint violation');
      failed++;
    } catch (dupErr: any) {
      console.log('✅ [PASS] Database unique constraint enforced for firebaseUid');
      passed++;
    }

    // 6. Test Idempotent Sync / Profile Update
    const updatedIdentity = {
      ...verifiedIdentity!,
      name: 'Jordan Rivera (Updated Name)',
    };
    const updatedUser = await syncFirebaseUserToDatabase(updatedIdentity);
    if (updatedUser && updatedUser.name === 'Jordan Rivera (Updated Name)') {
      console.log('✅ [PASS] syncFirebaseUserToDatabase updated existing profile data cleanly');
      passed++;
    } else {
      console.error('❌ [FAIL] Idempotent profile update failed:', updatedUser);
      failed++;
    }

    // Cleanup test user
    await prisma.user.delete({ where: { id: syncedUser.id } });
    console.log('✅ [PASS] Cleaned up temporary test user record');
    passed++;

  } catch (err: any) {
    console.error('Unexpected test error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`Results: ${passed} passed, ${failed} failed.`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runFirebaseAuthTests().catch((err) => {
  console.error('Fatal error running Firebase auth tests:', err);
  process.exit(1);
});
