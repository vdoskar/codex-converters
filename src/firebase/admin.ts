import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { env } from '../config/env';

let app: App;

export function getFirebaseApp(): App {
  if (!app) {
    if (getApps().length > 0) {
      app = getApps()[0]!;
    } else if (env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
      app = initializeApp({
        credential: cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        storageBucket: env.FIREBASE_STORAGE_BUCKET,
      });
    } else {
      app = initializeApp({
        projectId: env.FIREBASE_PROJECT_ID,
        storageBucket: env.FIREBASE_STORAGE_BUCKET,
      });
    }
  }
  return app;
}

export function getDb() {
  return getFirestore(getFirebaseApp());
}
