import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, doc, docData,
  setDoc, query, where, serverTimestamp, updateDoc, increment, orderBy
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Order, OrderItem, Payment, CartItem } from '../../../core/models/db.models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private firestore = inject(Firestore);
  private ordersCol = collection(this.firestore, 'orders');

  getOrders(userId: string): Observable<Order[]> {
    const q = query(this.ordersCol, where('user_id', '==', userId));
    return collectionData(q, { idField: 'id' }) as Observable<Order[]>;
  }

  getOrder(orderId: string): Observable<Order> {
    const orderDoc = doc(this.firestore, `orders/${orderId}`);
    return docData(orderDoc, { idField: 'id' }) as Observable<Order>;
  }

  getOrderItems(orderId: string): Observable<OrderItem[]> {
    const itemsCol = collection(this.firestore, `orders/${orderId}/items`);
    return collectionData(itemsCol, { idField: 'id' }) as Observable<OrderItem[]>;
  }

  async createOrder(params: {
    userId: string;
    cartItems: CartItem[];
    shippingName: string;
    shippingAddress: string;
    billingName: string;
    billingAddress: string;
    shippingFee?: number;
    taxRate?: number;
    gatewayName?: 'Stripe' | 'PayPal';
    transactionId?: string;
  }): Promise<string> {
    const {
      userId, cartItems, shippingName, shippingAddress,
      billingName, billingAddress,
      shippingFee = 5.00, taxRate = 0.08,
      gatewayName = 'Stripe', transactionId = ''
    } = params;

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price_at_add * item.quantity, 0
    );
    const taxFee = parseFloat((subtotal * taxRate).toFixed(2));
    const totalAmount = parseFloat((subtotal + shippingFee + taxFee).toFixed(2));

    // Create order document
    const orderRef = doc(this.ordersCol);
    const order: Order = {
      id: orderRef.id,
      user_id: userId,
      shipping_name: shippingName,
      shipping_address: shippingAddress,
      billing_name: billingName,
      billing_address: billingAddress,
      subtotal,
      shipping_fee: shippingFee,
      tax_fee: taxFee,
      total_amount: totalAmount,
      order_status: 'Processing',
      created_at: serverTimestamp() as any,
    };
    await setDoc(orderRef, order);

    // Write order items subcollection and decrement stock atomically
    for (const item of cartItems) {
      const itemRef = doc(collection(this.firestore, `orders/${orderRef.id}/items`));
      const orderItem: OrderItem = {
        id: itemRef.id,
        order_id: orderRef.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price_at_purchase: item.price_at_add,
        product_name: item.product_name,
        variant_title: item.variant_title,
        imageUrl: item.imageUrl,
      };
      await setDoc(itemRef, orderItem);

      // Decrement variant stock atomically!
      const variantRef = doc(this.firestore, `products/${item.product_id}/variants`, item.variant_id);
      await updateDoc(variantRef, {
        stock_quantity: increment(-item.quantity)
      });
    }

    // Write payment document
    const paymentRef = doc(this.firestore, `orders/${orderRef.id}/payment`, 'record');
    const payment: Payment = {
      id: 'record',
      order_id: orderRef.id,
      gateway_name: gatewayName,
      transaction_id: transactionId,
      payment_status: transactionId ? 'Succeeded' : 'Pending',
      amount: totalAmount,
      created_at: serverTimestamp() as any,
    };
    await setDoc(paymentRef, payment);

    return orderRef.id;
  }

  getAllOrders(): Observable<Order[]> {
    const q = query(this.ordersCol, orderBy('created_at', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Order[]>;
  }

  async updateOrderStatus(orderId: string, status: Order['order_status']): Promise<void> {
    const orderDoc = doc(this.firestore, `orders/${orderId}`);
    await updateDoc(orderDoc, {
      order_status: status
    });
  }
}
