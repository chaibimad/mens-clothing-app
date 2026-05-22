import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { UserService } from '../../../../core/services/user.service';
import { CartService } from '../../../../features/cart/services/cart.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Product, ProductVariant, ProductReview } from '../../../../core/models/db.models';
import { take, Subscription, switchMap, Observable, of } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule, NgIf, NgFor, CurrencyPipe, RouterLink, FormsModule,
    MatButtonModule, MatIconModule, MatDividerModule,
    MatSnackBarModule, MatProgressSpinnerModule,
    MatCardModule, MatFormFieldModule, MatInputModule
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product?: Product;
  variants: ProductVariant[] = [];
  selectedVariant?: ProductVariant;
  selectedImageIndex = 0;
  isLoading = true;
  isAddingToCart = false;

  // Product Reviews Variables
  reviews: ProductReview[] = [];
  reviewRating = 5;
  reviewComment = '';
  isSubmittingReview = false;

  private sub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.pipe(
      switchMap(params => {
        const slug = params.get('slug')!;
        this.isLoading = true;
        this.product = undefined;
        this.variants = [];
        this.selectedVariant = undefined;
        this.reviews = [];
        return this.productService.getProductBySlug(slug);
      })
    ).subscribe(product => {
      this.product = product;
      this.isLoading = false;
      if (product) {
        this.productService.getVariants(product.id).subscribe(variants => {
          this.variants = variants;
        });
        this.productService.getReviews(product.id).subscribe(reviews => {
          this.reviews = reviews;
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  selectVariant(variant: ProductVariant): void {
    this.selectedVariant = variant;
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  get effectivePrice(): number {
    if (!this.product) return 0;
    return this.product.base_price + (this.selectedVariant?.price_modifier ?? 0);
  }

  get inStock(): boolean {
    if (!this.selectedVariant) return true;
    return this.selectedVariant.stock_quantity > 0;
  }

  async addToCart(): Promise<void> {
    if (!this.selectedVariant) {
      this.snackBar.open('Please select a size/variant first.', 'Close', { duration: 3000 });
      return;
    }

    this.authService.user$.pipe(take(1)).subscribe(async user => {
      if (!user) {
        if (this.product && this.selectedVariant) {
          this.cartService.setPendingItem(this.product, this.selectedVariant, 1);
        }
        this.snackBar.open('Please log in to add items to your cart.', 'Login', { duration: 4000 })
          .onAction().subscribe(() => this.router.navigate(['/login']));
        return;
      }

      if (this.product && this.selectedVariant) {
        this.isAddingToCart = true;
        try {
          await this.cartService.addToCart(this.product, this.selectedVariant, 1);
          this.snackBar.open(
            `${this.product.name} — ${this.selectedVariant.title} added to cart!`,
            'View Cart', { duration: 4000, horizontalPosition: 'center', verticalPosition: 'bottom' }
          ).onAction().subscribe(() => this.router.navigate(['/cart']));
        } finally {
          this.isAddingToCart = false;
        }
      }
    });
  }

  setRating(rating: number): void {
    this.reviewRating = rating;
  }

  async submitReview(): Promise<void> {
    if (!this.product) return;
    if (this.reviewRating < 1 || this.reviewRating > 5) {
      this.snackBar.open('Please select a star rating between 1 and 5.', 'Close', { duration: 3000 });
      return;
    }
    if (!this.reviewComment.trim()) {
      this.snackBar.open('Please write a comment for your review.', 'Close', { duration: 3000 });
      return;
    }

    this.authService.user$.pipe(take(1)).subscribe(async user => {
      if (!user) {
        this.snackBar.open('You must be logged in to submit a review.', 'Login', { duration: 4000 })
          .onAction().subscribe(() => this.router.navigate(['/login']));
        return;
      }

      this.isSubmittingReview = true;
      try {
        // Resolve profile to get actual user first and last name
        this.userService.getUserProfile(user.uid).pipe(take(1)).subscribe(async profile => {
          let authorName = user.displayName || user.email || 'Anonymous';
          if (profile && (profile.first_name || profile.last_name)) {
            authorName = `${profile.first_name} ${profile.last_name}`.trim();
          }

          if (this.product) {
            await this.productService.addReview(this.product.id, {
              product_id: this.product.id,
              user_id: user.uid,
              user_name: authorName,
              rating: this.reviewRating,
              comment: this.reviewComment.trim()
            });

            this.snackBar.open('Thank you! Your review has been added.', 'Close', { duration: 3000 });
            this.reviewComment = '';
            this.reviewRating = 5;
          }
          this.isSubmittingReview = false;
        });
      } catch (e) {
        this.snackBar.open('Error adding review: ' + e, 'Close', { duration: 5000 });
        this.isSubmittingReview = false;
      }
    });
  }
}
