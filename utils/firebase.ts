import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadServiceAccount(): ServiceAccount {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const account = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) as ServiceAccount & {
      private_key?: string;
    };

    if (typeof account.private_key === 'string') {
      account.private_key = account.private_key.replace(/\\n/g, '\n');
    }

    return account;
  }

  const filepath = process.env.ADMIN_SDK_FILEPATH;
  if (!filepath) {
    throw new Error(
      'Firebase Admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT (JSON) or ADMIN_SDK_FILEPATH (local file).'
    );
  }

  const resolvedPath = path.isAbsolute(filepath) ? filepath : path.join(projectRoot, filepath);
  return JSON.parse(fs.readFileSync(resolvedPath, 'utf8')) as ServiceAccount;
}

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  return initializeApp({
    credential: cert(loadServiceAccount()),
  });
}

initializeFirebaseAdmin();

export const auth = getAuth();
export const db = getFirestore();
