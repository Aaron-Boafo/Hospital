import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type Auth, type DecodedIdToken } from "firebase-admin/auth";
import "dotenv/config";
import { ServerError } from "../errors/index.js";

type ServiceAccount = {
  type: string;
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

let authInstance: Auth | undefined;

function loadServiceAccount(): ServiceAccount | null {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId && !clientEmail && !privateKeyRaw) return null;

  if (!projectId || !clientEmail || !privateKeyRaw) {
    const missing = [
      !projectId ? "FIREBASE_PROJECT_ID" : null,
      !clientEmail ? "FIREBASE_CLIENT_EMAIL" : null,
      !privateKeyRaw ? "FIREBASE_PRIVATE_KEY" : null,
    ]
      .filter(Boolean)
      .join(", ");
    throw new Error(`Firebase is missing required env vars: ${missing}`);
  }

  const privateKey = privateKeyRaw.includes("\\n")
    ? privateKeyRaw.replaceAll("\\n", "\n")
    : privateKeyRaw;

  return {
    type: "service_account",
    projectId,
    clientEmail,
    privateKey,
  };
}

function getFirebaseAuth(): Auth {
  if (!authInstance) {
    if (getApps().length === 0) {
      const serviceAccount = loadServiceAccount();
      if (!serviceAccount) {
        throw new ServerError(
          "Firebase is not configured: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY are missing",
          503,
        );
      }
      initializeApp({ credential: cert(serviceAccount) });
    }
    authInstance = getAuth();
  }
  return authInstance;
}

export async function verifyFirebaseIdToken(idToken: string): Promise<DecodedIdToken> {
  const firebaseAuth = getFirebaseAuth();
  try {
    return await firebaseAuth.verifyIdToken(idToken);
  } catch {
    throw new ServerError("Invalid or expired authentication token", 401);
  }
}
