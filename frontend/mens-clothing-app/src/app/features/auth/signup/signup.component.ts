import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../features/cart/services/cart.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatSnackBarModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  fullName = '';
  email = '';
  password = '';
  agreeToUpdates = true;
  errorMessage = '';
  isLoading = false;
  readonly isFirebaseConfigured: boolean;
  readonly configurationMessage: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {
    this.isFirebaseConfigured = this.authService.isConfigured;
    this.configurationMessage = this.authService.getConfigurationMessage();
  }

  async createAccount(): Promise<void> {
    this.errorMessage = '';
    this.isLoading = true;

    try {
      const user = await this.authService.signUp(this.fullName, this.email.trim(), this.password);

      // Create user profile document in Firestore /users/{uid}
      if (user) {
        const nameParts = this.fullName.trim().split(' ');
        await this.userService.createUserProfile(user.uid, {
          email: this.email.trim(),
          first_name: nameParts[0] ?? '',
          last_name: nameParts.slice(1).join(' ') ?? '',
        });
      }

      const pendingItem = this.cartService.getPendingItem();
      if (pendingItem) {
        setTimeout(async () => {
          const added = await this.cartService.processPendingItem();
          if (added) {
            this.snackBar.open(
              `Account created! "${pendingItem.product.name}" added to your cart.`,
              'View Cart', { duration: 5000 }
            ).onAction().subscribe(() => this.router.navigate(['/cart']));
          }
          this.router.navigate(['/cart']);
        }, 300);
      } else {
        await this.router.navigate(['/']);
      }
    } catch (error) {
      this.errorMessage = this.authService.getErrorMessage(error);
    } finally {
      this.isLoading = false;
    }
  }
}
