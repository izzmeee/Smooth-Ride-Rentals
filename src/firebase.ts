import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

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
): never {
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

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Sanitize strings to strictly match firebase-blueprint.json maxLength constraints
const truncate = (value: string, maxLen: number) => value.trim().slice(0, maxLen);

export async function syncGoogleProfileToFirestore(firebaseUser: FirebaseUser): Promise<void> {
  if (!firebaseUser.uid || !firebaseUser.email || !firebaseUser.emailVerified) {
    return;
  }

  const uid = truncate(firebaseUser.uid, 128);
  const name = truncate(firebaseUser.displayName || firebaseUser.email.split('@')[0] || 'Student Renter', 120);
  const email = truncate(firebaseUser.email, 254);
  const photoUrl = firebaseUser.photoURL ? truncate(firebaseUser.photoURL, 1000) : '';
  const userPath = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  let exists = false;
  try {
    const snap = await getDoc(userRef);
    exists = snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  if (!exists) {
    try {
      const payload: Record<string, unknown> = {
        uid,
        name,
        email,
        role: 'customer',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (photoUrl) {
        payload.photoUrl = photoUrl;
      }
      await setDoc(userRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, userPath);
    }
  } else {
    try {
      const updatePayload: Record<string, unknown> = {
        name,
        updatedAt: serverTimestamp(),
      };
      if (photoUrl) {
        updatePayload.photoUrl = photoUrl;
      }
      await updateDoc(userRef, updatePayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, userPath);
    }
  }
}

export async function signInWithGooglePopup(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  const firebaseUser = result.user;

  // Sync user profile to Firestore (non-blocking if Firestore quota/network issue occurs after Auth succeeds)
  try {
    await syncGoogleProfileToFirestore(firebaseUser);
  } catch (err) {
    console.warn('Firestore profile sync warning:', err);
  }

  return firebaseUser;
}

export async function signOutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Firebase sign out failed:', err);
  }
}

export { onAuthStateChanged };
export type { FirebaseUser };
