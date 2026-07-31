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
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw || !raw.trim()) return null;

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch (error) {
    throw new Error(
      `FIREBASE_SERVICE_ACCOUNT is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const { project_id, client_email, private_key } = parsed;
  if (!project_id || !client_email || !private_key) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is missing required fields (project_id, client_email, private_key)",
    );
  }

  const privateKey = String(private_key).includes("\\n")
    ? String(private_key).replaceAll("\\n", "\n")
    : String(private_key);

  return {
    type: "service_account",
    projectId: String(project_id),
    clientEmail: String(client_email),
    privateKey,
  };
}

function getFirebaseAuth(): Auth {
  if (!authInstance) {
    if (getApps().length === 0) {
      const serviceAccount = loadServiceAccount();
      if (!serviceAccount) {
        throw new ServerError(
          "Firebase is not configured: FIREBASE_SERVICE_ACCOUNT is missing",
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
