import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let projectId = process.env.FIREBASE_PROJECT_ID;

if (!projectId) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const firebaseConfig = require('../../firebase-applet-config.json');
    projectId = firebaseConfig.projectId;
  } catch {
    // ignore if file does not exist
  }
}

if (!getApps().length) {
  initializeApp({
    projectId: projectId || 'linen-theory-t74w7',
  });
}

export const adminAuth = getAuth();
