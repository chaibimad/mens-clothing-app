import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData,
  doc, docData, setDoc, updateDoc, deleteDoc, query, where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Category } from '../../../core/models/db.models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private firestore = inject(Firestore);
  private categoriesCol = collection(this.firestore, 'categories');

  getCategories(): Observable<Category[]> {
    return collectionData(this.categoriesCol, { idField: 'id' }) as Observable<Category[]>;
  }

  getTopLevelCategories(): Observable<Category[]> {
    const q = query(this.categoriesCol, where('parent_id', '==', null));
    return collectionData(q, { idField: 'id' }) as Observable<Category[]>;
  }

  getCategoryBySlug(slug: string): Observable<Category[]> {
    const q = query(this.categoriesCol, where('slug', '==', slug));
    return collectionData(q, { idField: 'id' }) as Observable<Category[]>;
  }

  async seedCategories(): Promise<void> {
    const categories: Omit<Category, 'id'>[] = [
      { name: 'T-Shirts',     slug: 't-shirts',     parent_id: null },
      { name: 'Jackets',      slug: 'jackets',      parent_id: null },
      { name: 'Shoes',        slug: 'shoes',        parent_id: null },
      { name: 'Accessories',  slug: 'accessories',  parent_id: null },
    ];

    // Use fixed IDs so products can reference them
    const ids = ['cat-1', 'cat-2', 'cat-3', 'cat-4'];
    for (let i = 0; i < categories.length; i++) {
      const ref = doc(this.firestore, 'categories', ids[i]);
      await setDoc(ref, { id: ids[i], ...categories[i] });
    }
  }

  async createCategory(cat: Omit<Category, 'id'>): Promise<void> {
    const newRef = doc(this.categoriesCol);
    await setDoc(newRef, { id: newRef.id, ...cat });
  }
}
