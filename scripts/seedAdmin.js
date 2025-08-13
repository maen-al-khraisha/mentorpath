#!/usr/bin/env node
/*
  Usage: node scripts/seedAdmin.js <UID>
  Requires GOOGLE_APPLICATION_CREDENTIALS to point to a service account JSON with Firestore access
*/
const admin = require('firebase-admin')

if (!process.argv[2]) {
  console.error('Usage: node scripts/seedAdmin.js <UID>')
  process.exit(1)
}

const uid = process.argv[2]

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  })
}

async function main() {
  const db = admin.firestore()
  await db
    .collection('admins')
    .doc(uid)
    .set({ createdAt: admin.firestore.FieldValue.serverTimestamp() })
  console.log('Admin seeded for uid:', uid)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
