import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  type Auth,
} from 'firebase/auth'
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
  doc,
  getDocFromServer,
  type Firestore,
} from 'firebase/firestore'
import firebaseAppletConfig from '../../firebase-applet-config.json'
import { toUserFriendlyError } from './errorSanitizer'

/**
 * Connected Firebase Project Configuration (Mandatory Zero-Regression Rule)
 * Strictly uses projectId: gen-lang-client-0327010007
 * and firestoreDatabaseId: ai-studio-srterminalprivat-41ef7494-5a58-4184-8c13-0b1ee9f8f190
 */
const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey,
  authDomain: firebaseAppletConfig.authDomain,
  projectId: firebaseAppletConfig.projectId,
  storageBucket: firebaseAppletConfig.storageBucket,
  messagingSenderId: firebaseAppletConfig.messagingSenderId,
  appId: firebaseAppletConfig.appId,
}

export const CONNECTED_FIREBASE_PROJECT_ID = firebaseAppletConfig.projectId
export const CONNECTED_FIRESTORE_DATABASE_ID = firebaseAppletConfig.firestoreDatabaseId

// Suppress internal @firebase/firestore idle-stream disconnect noise ("1 CANCELLED: Disconnecting idle stream")
setLogLevel('silent')

let app: FirebaseApp
let auth: Auth
let db: Firestore
let googleProvider: GoogleAuthProvider

app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
auth = getAuth(app)
try {
  db = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    firebaseAppletConfig.firestoreDatabaseId
  )
} catch {
  db = getFirestore(app, firebaseAppletConfig.firestoreDatabaseId)
}

googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account',
})

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string
  operationType: OperationType
  path: string | null
  authInfo: {
    userId: string | undefined
    email: string | null | undefined
    emailVerified: boolean | undefined
    isAnonymous: boolean | undefined
    tenantId: string | null | undefined
    providerInfo: {
      providerId: string
      displayName: string | null
      email: string | null
      photoUrl: string | null
    }[]
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  }
  console.warn('Firestore Diagnostic:', JSON.stringify(errInfo))
  throw new Error(toUserFriendlyError(error))
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'))
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: client offline.')
    }
  }
}

void testConnection()

export function isFirebaseReady(): boolean {
  return Boolean(app && auth && db)
}

export { app, auth, db, googleProvider }
