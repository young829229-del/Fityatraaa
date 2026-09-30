import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User
} from 'firebase/auth';
import { getFirestore, doc, getDoc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without passing firebaseConfig.firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Configured authorized admin Gmail addresses
const envAdminEmails =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_EMAILS
    ? String(import.meta.env.VITE_ADMIN_EMAILS)
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    : [];

export const AUTHORIZED_ADMIN_EMAILS: string[] = Array.from(
  new Set(['young829229@gmail.com', ...envAdminEmails])
);

/**
 * Synchronously checks whether a Firebase Auth user matches an authorized admin Gmail
 */
export function isAuthorizedAdminUser(user: User | null | undefined): boolean {
  if (!user || !user.email || !user.emailVerified) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(user.email.trim().toLowerCase());
}

/**
 * Verifies admin authorization against configured admin Gmail(s) or the protected /admins/{uid} collection
 */
export async function verifyAdminAccess(user: User | null | undefined): Promise<boolean> {
  if (!user || !user.email || !user.emailVerified) return false;
  if (isAuthorizedAdminUser(user)) return true;

  try {
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    return adminDoc.exists();
  } catch {
    return false;
  }
}

export { signInWithPopup, signOut };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testFirestoreConnection();
