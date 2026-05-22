import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { OrderService } from '../orders/services/order.service';
import { UserProfile, UserAddress, Order, OrderItem } from '../../core/models/db.models';
import { Observable, take, forkJoin, map, switchMap, of } from 'rxjs';

interface OrderWithItems extends Order {
  items: OrderItem[];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, DatePipe, FormsModule, RouterLink,
    MatButtonModule, MatIconModule, MatCardModule, MatDividerModule,
    MatFormFieldModule, MatInputModule, MatCheckboxModule, MatTabsModule,
    MatExpansionModule, MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  userId = '';
  profile: Partial<UserProfile> = {
    first_name: '',
    last_name: '',
    phone_number: '',
    email: ''
  };

  addresses: UserAddress[] = [];
  orders: OrderWithItems[] = [];
  isLoading = true;

  // Address Form
  showAddressForm = false;
  editingAddressId: string | null = null;
  addressForm = {
    recipient_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA',
    is_default_shipping: false,
    is_default_billing: false
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private orderService: OrderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.loadProfileData();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  private loadProfileData(): void {
    this.isLoading = true;

    // Load User Profile Data
    this.userService.getUserProfile(this.userId).subscribe(prof => {
      if (prof) {
        this.profile = prof;
      } else {
        // Fallback: create empty profile if missing
        this.userService.createUserProfile(this.userId, {
          email: this.profile.email || ''
        });
      }
    });

    // Load Addresses
    this.userService.getAddresses(this.userId).subscribe(addr => {
      this.addresses = addr;
    });

    // Load Orders with their respective subcollection items
    this.orderService.getOrders(this.userId).pipe(
      switchMap(ordersList => {
        if (ordersList.length === 0) return of([]);
        
        // Sort orders by created_at descending (latest first)
        ordersList.sort((a, b) => {
          const t1 = a.created_at?.seconds || 0;
          const t2 = b.created_at?.seconds || 0;
          return t2 - t1;
        });

        const orderRequests = ordersList.map(order => 
          this.orderService.getOrderItems(order.id).pipe(
            map(items => ({ ...order, items } as OrderWithItems))
          )
        );
        return forkJoin(orderRequests);
      })
    ).subscribe(ordersWithItems => {
      this.orders = ordersWithItems;
      this.isLoading = false;
    });
  }

  async saveProfile(): Promise<void> {
    try {
      await this.userService.updateUserProfile(this.userId, {
        first_name: this.profile.first_name,
        last_name: this.profile.last_name,
        phone_number: this.profile.phone_number
      });
      this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
    } catch (e) {
      this.snackBar.open('Error updating profile: ' + e, 'Close', { duration: 5000 });
    }
  }

  openNewAddressForm(): void {
    this.editingAddressId = null;
    this.addressForm = {
      recipient_name: (this.profile.first_name + ' ' + this.profile.last_name).trim(),
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'USA',
      is_default_shipping: this.addresses.length === 0,
      is_default_billing: this.addresses.length === 0
    };
    this.showAddressForm = true;
  }

  openEditAddressForm(addr: UserAddress): void {
    this.editingAddressId = addr.id;
    this.addressForm = {
      recipient_name: addr.recipient_name,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country,
      is_default_shipping: addr.is_default_shipping,
      is_default_billing: addr.is_default_billing
    };
    this.showAddressForm = true;
  }

  closeAddressForm(): void {
    this.showAddressForm = false;
    this.editingAddressId = null;
  }

  async saveAddress(): Promise<void> {
    try {
      // If default shipping/billing checkmark is selected, toggle others off
      if (this.addressForm.is_default_shipping) {
        for (const addr of this.addresses) {
          if (addr.is_default_shipping && addr.id !== this.editingAddressId) {
            await this.userService.updateAddress(this.userId, addr.id, { is_default_shipping: false });
          }
        }
      }
      if (this.addressForm.is_default_billing) {
        for (const addr of this.addresses) {
          if (addr.is_default_billing && addr.id !== this.editingAddressId) {
            await this.userService.updateAddress(this.userId, addr.id, { is_default_billing: false });
          }
        }
      }

      if (this.editingAddressId) {
        await this.userService.updateAddress(this.userId, this.editingAddressId, this.addressForm);
        this.snackBar.open('Address updated successfully!', 'Close', { duration: 3000 });
      } else {
        await this.userService.addAddress(this.userId, this.addressForm);
        this.snackBar.open('Address added successfully!', 'Close', { duration: 3000 });
      }
      
      this.closeAddressForm();
    } catch (e) {
      this.snackBar.open('Error saving address: ' + e, 'Close', { duration: 5000 });
    }
  }

  async deleteAddress(addressId: string): Promise<void> {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        await this.userService.deleteAddress(this.userId, addressId);
        this.snackBar.open('Address deleted successfully!', 'Close', { duration: 3000 });
      } catch (e) {
        this.snackBar.open('Error deleting address: ' + e, 'Close', { duration: 5000 });
      }
    }
  }

  async setAddressDefault(addr: UserAddress, type: 'shipping' | 'billing'): Promise<void> {
    try {
      const updates: Partial<UserAddress> = {};
      if (type === 'shipping') {
        updates.is_default_shipping = true;
        for (const a of this.addresses) {
          if (a.is_default_shipping && a.id !== addr.id) {
            await this.userService.updateAddress(this.userId, a.id, { is_default_shipping: false });
          }
        }
      } else {
        updates.is_default_billing = true;
        for (const a of this.addresses) {
          if (a.is_default_billing && a.id !== addr.id) {
            await this.userService.updateAddress(this.userId, a.id, { is_default_billing: false });
          }
        }
      }
      await this.userService.updateAddress(this.userId, addr.id, updates);
      this.snackBar.open(`Set as default ${type} address!`, 'Close', { duration: 3000 });
    } catch (e) {
      this.snackBar.open('Error updating defaults: ' + e, 'Close', { duration: 5000 });
    }
  }

  formatDate(timestamp: any): Date | null {
    if (!timestamp) return null;
    return new Date(timestamp.seconds * 1000);
  }
}
