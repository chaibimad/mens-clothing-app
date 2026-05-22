import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData,
  doc, docData, setDoc, updateDoc, deleteDoc, serverTimestamp
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UserProfile, UserAddress } from '../models/db.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);

  // ── Profile ────────────────────────────────
  getUserProfile(uid: string): Observable<UserProfile | undefined> {
    const userDoc = doc(this.firestore, 'users', uid);
    return docData(userDoc, { idField: 'id' }) as Observable<UserProfile | undefined>;
  }

  async createUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userRef = doc(this.firestore, 'users', uid);
    const email = data.email || '';
    const assignedRole = email.toLowerCase() === 'admin@admin.com' ? 'admin' : 'customer';

    await setDoc(userRef, {
      id: uid,
      is_active: true,
      role: assignedRole,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      phone_number: '',
      ...data
    }, { merge: true });
  }

  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userRef = doc(this.firestore, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updated_at: serverTimestamp()
    });
  }

  // ── Addresses ──────────────────────────────
  getAddresses(uid: string): Observable<UserAddress[]> {
    const addressesCol = collection(this.firestore, `users/${uid}/addresses`);
    return collectionData(addressesCol, { idField: 'id' }) as Observable<UserAddress[]>;
  }

  async addAddress(uid: string, address: Omit<UserAddress, 'id' | 'user_id'>): Promise<void> {
    const addressesCol = collection(this.firestore, `users/${uid}/addresses`);
    const newRef = doc(addressesCol);
    await setDoc(newRef, {
      id: newRef.id,
      user_id: uid,
      ...address
    });
  }

  async updateAddress(uid: string, addressId: string, data: Partial<UserAddress>): Promise<void> {
    const addressRef = doc(this.firestore, `users/${uid}/addresses`, addressId);
    await updateDoc(addressRef, { ...data });
  }

  async deleteAddress(uid: string, addressId: string): Promise<void> {
    const addressRef = doc(this.firestore, `users/${uid}/addresses`, addressId);
    await deleteDoc(addressRef);
  }
}
