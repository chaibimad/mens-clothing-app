import { Injectable } from '@angular/core';
import {
  User,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { Observable, shareReplay } from 'rxjs';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { environment, hasFirebaseConfig } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly app = getApps().length ? getApp() : initializeApp(environment.firebase);
  private readonly auth = getAuth(this.app);

  readonly user$: Observable<User | null> = new Observable<User | null>((subscriber) =>
    onAuthStateChanged(
      this.auth,
      (user) => subscriber.next(user),
      (error) => subscriber.error(error),
      () => subscriber.complete()
    )
  ).pipe(shareReplay(1));
  readonly isConfigured = hasFirebaseConfig();
  readonly configPath = 'src/environments/environment.ts';

  async signUp(fullName: string, email: string, password: string): Promise<User> {
    this.ensureConfigured();

    await setPersistence(this.auth, browserLocalPersistence);
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);

    if (fullName.trim()) {
      await updateProfile(credential.user, { displayName: fullName.trim() });
    }

    return credential.user;
  }

  async login(email: string, password: string, rememberMe: boolean): Promise<User> {
    this.ensureConfigured();

    await setPersistence(this.auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    return credential.user;
  }

  async logout(): Promise<void> {
    this.ensureConfigured();
    await signOut(this.auth);
  }

  getErrorMessage(error: unknown): string {
    const code = this.extractErrorCode(error);

    switch (code) {
      case 'auth/configuration-not-found':
        return 'Email/password sign-in is not enabled in Firebase yet.';
      case 'auth/email-already-in-use':
        return 'This email address is already in use.';
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'The email or password is incorrect.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Use a stronger password with at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      default:
        return error instanceof Error ? error.message : 'Authentication failed. Please try again.';
    }
  }

  getConfigurationMessage(): string {
    return `Firebase is not configured yet. Add your Firebase project keys in ${this.configPath}.`;
  }

  private ensureConfigured(): void {
    if (!this.isConfigured) {
      throw new Error(this.getConfigurationMessage());
    }
  }

  private extractErrorCode(error: unknown): string | null {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const code = (error as { code?: unknown }).code;
      return typeof code === 'string' ? code : null;
    }

    return null;
  }
}
