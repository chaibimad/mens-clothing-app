import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../../orders/services/order.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CartItem } from '../../../../core/models/db.models';
import { take, Observable, map } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, FormsModule, RouterLink,
    MatButtonModule, MatIconModule, MatCardModule, MatDividerModule,
    MatFormFieldModule, MatInputModule, MatCheckboxModule, MatProgressSpinnerModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  subtotal = 0;
  shippingFee = 5.00;
  taxRate = 0.08;
  tax = 0;
  total = 0;

  // Shipping Form
  shipping = {
    recipient_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA'
  };

  // Billing Form
  billingSameAsShipping = true;
  billing = {
    recipient_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA'
  };

  // Payment Form
  payment = {
    cardNumber: '',
    expiry: '',
    cvv: ''
  };

  isProcessing = false;
  userId: string | null = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.shipping.recipient_name = user.displayName ?? '';
        this.billing.recipient_name = user.displayName ?? '';
      } else {
        this.router.navigate(['/login']);
      }
    });

    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.calculateTotals();
      if (items.length === 0 && !this.isProcessing) {
        this.router.navigate(['/products']);
      }
    });
  }

  private calculateTotals(): void {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.price_at_add * item.quantity), 0);
    this.tax = parseFloat((this.subtotal * this.taxRate).toFixed(2));
    this.total = parseFloat((this.subtotal + this.shippingFee + this.tax).toFixed(2));
  }

  formatCardNumber(): void {
    let card = this.payment.cardNumber.replace(/\D/g, '');
    if (card.length > 16) card = card.substring(0, 16);
    const matches = card.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      this.payment.cardNumber = parts.join(' ');
    } else {
      this.payment.cardNumber = card;
    }
  }

  formatExpiry(): void {
    let exp = this.payment.expiry.replace(/\D/g, '');
    if (exp.length > 4) exp = exp.substring(0, 4);
    if (exp.length >= 2) {
      this.payment.expiry = exp.substring(0, 2) + '/' + exp.substring(2);
    } else {
      this.payment.expiry = exp;
    }
  }

  formatCvv(): void {
    this.payment.cvv = this.payment.cvv.replace(/\D/g, '').substring(0, 3);
  }

  async placeOrder(): Promise<void> {
    if (!this.userId || this.cartItems.length === 0) return;

    this.isProcessing = true;

    // Simulate secure network transaction processing
    setTimeout(async () => {
      try {
        const shippingAddressString = `${this.shipping.address_line1}, ${this.shipping.address_line2 ? this.shipping.address_line2 + ', ' : ''}${this.shipping.city}, ${this.shipping.state} ${this.shipping.postal_code}, ${this.shipping.country}`;
        
        const finalBilling = this.billingSameAsShipping ? this.shipping : this.billing;
        const billingAddressString = `${finalBilling.address_line1}, ${finalBilling.address_line2 ? finalBilling.address_line2 + ', ' : ''}${finalBilling.city}, ${finalBilling.state} ${finalBilling.postal_code}, ${finalBilling.country}`;

        // Create transaction reference
        const transactionId = 'ch_' + Math.random().toString(36).substring(2, 10).toUpperCase();

        const orderId = await this.orderService.createOrder({
          userId: this.userId!,
          cartItems: this.cartItems,
          shippingName: this.shipping.recipient_name,
          shippingAddress: shippingAddressString,
          billingName: finalBilling.recipient_name,
          billingAddress: billingAddressString,
          shippingFee: this.shippingFee,
          taxRate: this.taxRate,
          gatewayName: 'Stripe',
          transactionId: transactionId
        });

        // Clear user cart from Firestore
        await this.cartService.clearCart();

        // Redirect to success page
        this.router.navigate(['/order-success', orderId]);
      } catch (e) {
        alert('Order placement failed: ' + e);
        this.isProcessing = false;
      }
    }, 2000);
  }
}
