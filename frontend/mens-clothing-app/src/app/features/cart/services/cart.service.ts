import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, doc,
  setDoc, deleteDoc, updateDoc, serverTimestamp, getDoc
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CartItem, Product, ProductVariant } from '../../../core/models/db.models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private firestore = inject(Firestore);
  private userId: string | null = null;
  private cartSubject = new BehaviorSubject<CartItem[]>([]);

  constructor(private authService: AuthService) {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.listenToCart();
      } else {
        this.userId = null;
        this.cartSubject.next([]);
      }
    });
  }

  private listenToCart(): void {
    if (!this.userId) return;
    const itemsCol = collection(this.firestore, `carts/${this.userId}/items`);
    (collectionData(itemsCol, { idField: 'id' }) as Observable<CartItem[]>)
      .subscribe(items => this.cartSubject.next(items));
  }

  getCart(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  getTotalItems(): Observable<number> {
    return this.cartSubject.pipe(
      map(items => items.reduce((sum, item) => sum + item.quantity, 0))
    );
  }

  getTotalPrice(): Observable<number> {
    return this.cartSubject.pipe(
      map(items => items.reduce((sum, item) => sum + (item.price_at_add * item.quantity), 0))
    );
  }

  async addToCart(product: Product, variant: ProductVariant, quantity: number = 1): Promise<void> {
    if (!this.userId) return;

    const itemId = `${product.id}_${variant.id}`;
    const itemRef = doc(this.firestore, `carts/${this.userId}/items`, itemId);
    const itemSnap = await getDoc(itemRef);

    // Ensure the cart document itself exists
    const cartRef = doc(this.firestore, 'carts', this.userId);
    await setDoc(cartRef, {
      id: this.userId,
      user_id: this.userId,
      updated_at: serverTimestamp()
    }, { merge: true });

    if (itemSnap.exists()) {
      const existing = itemSnap.data() as CartItem;
      await updateDoc(itemRef, { quantity: existing.quantity + quantity });
    } else {
      const cartItem: CartItem = {
        id: itemId,
        cart_id: this.userId,
        variant_id: variant.id,
        quantity,
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        variant_title: variant.title,
        price_at_add: product.base_price + variant.price_modifier,
        imageUrl: product.imageUrl,
      };
      await setDoc(itemRef, cartItem);
    }
  }

  async removeFromCart(itemId: string): Promise<void> {
    if (!this.userId) return;
    const itemRef = doc(this.firestore, `carts/${this.userId}/items`, itemId);
    await deleteDoc(itemRef);
  }

  async updateQuantity(itemId: string, quantity: number): Promise<void> {
    if (!this.userId) return;
    if (quantity <= 0) {
      return this.removeFromCart(itemId);
    }
    const itemRef = doc(this.firestore, `carts/${this.userId}/items`, itemId);
    await updateDoc(itemRef, { quantity });
  }

  async clearCart(): Promise<void> {
    if (!this.userId) return;
    const items = this.cartSubject.getValue();
    for (const item of items) {
      await this.removeFromCart(item.id);
    }
  }

  // Pending Item Logic (for login redirect flow)
  setPendingItem(product: Product, variant: ProductVariant, quantity: number): void {
    const pending = { product, variant, quantity };
    sessionStorage.setItem('pendingCartItem', JSON.stringify(pending));
  }

  getPendingItem(): { product: Product; variant: ProductVariant; quantity: number } | null {
    const stored = sessionStorage.getItem('pendingCartItem');
    return stored ? JSON.parse(stored) : null;
  }

  clearPendingItem(): void {
    sessionStorage.removeItem('pendingCartItem');
  }

  async processPendingItem(): Promise<boolean> {
    const pending = this.getPendingItem();
    if (pending && this.userId) {
      await this.addToCart(pending.product, pending.variant, pending.quantity);
      this.clearPendingItem();
      return true;
    }
    return false;
  }
}
