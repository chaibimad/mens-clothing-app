import { Component } from '@angular/core';
import { CommonModule, NgFor, NgIf, AsyncPipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Observable } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../../../core/models/db.models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, AsyncPipe, CurrencyPipe, RouterLink, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  cartItems$: Observable<CartItem[]>;
  totalItems$: Observable<number>;
  totalPrice$: Observable<number>;

  constructor(public cartService: CartService) {
    this.cartItems$ = this.cartService.getCart();
    this.totalItems$ = this.cartService.getTotalItems();
    this.totalPrice$ = this.cartService.getTotalPrice();
  }

  async updateQuantity(item: CartItem, newQuantity: number): Promise<void> {
    await this.cartService.updateQuantity(item.id, newQuantity);
  }

  async removeItem(item: CartItem): Promise<void> {
    await this.cartService.removeFromCart(item.id);
  }
}
