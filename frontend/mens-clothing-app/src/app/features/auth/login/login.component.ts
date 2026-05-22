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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatSnackBarModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = true;
  errorMessage = '';
  isLoading = false;
  readonly isFirebaseConfigured: boolean;
  readonly configurationMessage: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {
    this.isFirebaseConfigured = this.authService.isConfigured;
    this.configurationMessage = this.authService.getConfigurationMessage();
  }

  async signIn(): Promise<void> {
    this.errorMessage = '';
    this.isLoading = true;

    try {
      await this.authService.login(this.email.trim(), this.password, this.rememberMe);

      const pendingItem = this.cartService.getPendingItem();
      if (pendingItem) {
        // Wait for auth state to propagate to CartService before processing
        setTimeout(async () => {
          const added = await this.cartService.processPendingItem();
          if (added) {
            this.snackBar.open(
              `Logged in! "${pendingItem.product.name}" added to your cart.`,
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
