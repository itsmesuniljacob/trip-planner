import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, type Auth } from "firebase/auth";

let firebaseApp: FirebaseApp | undefined;
let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;
let facebookProvider: FacebookAuthProvider | undefined;
let appleProvider: OAuthProvider | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
      appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
    };

    if (Object.values(config).some((v) => !v)) {
      // Provide a clearer error if env vars are missing
      throw new Error(
        "Missing Firebase environment variables. Please set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID in .env.local"
      );
    }

    firebaseApp = getApps().length ? getApps()[0]! : initializeApp(config);
  }
  return firebaseApp!;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export function getGoogleProvider(): GoogleAuthProvider {
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
  }
  return googleProvider;
}

export function getFacebookProvider(): FacebookAuthProvider {
  if (!facebookProvider) {
    facebookProvider = new FacebookAuthProvider();
  }
  return facebookProvider;
}

export function getAppleProvider(): OAuthProvider {
  if (!appleProvider) {
    appleProvider = new OAuthProvider("apple.com");
  }
  return appleProvider;
}


