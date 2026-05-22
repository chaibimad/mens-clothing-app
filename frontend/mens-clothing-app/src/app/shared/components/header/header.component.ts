import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, NgFor, AsyncPipe, CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../features/products/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../features/cart/services/cart.service';
import { CategoryService } from '../../../features/products/services/category.service';
import { UserService } from '../../../core/services/user.service';
import { Product } from '../../../core/models/db.models';
import { Observable, map, switchMap, of } from 'rxjs';
import { User } from 'firebase/auth';

type CategoryLink = {
  name: string;
  slug: string;
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, NgFor, AsyncPipe, CurrencyPipe, RouterLink, MatButtonModule,
    MatIconModule, MatToolbarModule, FormsModule, MatMenuModule, MatDividerModule, MatBadgeModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  searchQuery: string = '';
  products: Product[] = [];
  suggestions: Product[] = [];
  showSuggestions = false;
  categories$!: Observable<CategoryLink[]>;
  readonly user$: Observable<User | null>;
  cartItemCount$: Observable<number>;
  isAdmin$: Observable<boolean>;

  constructor(
    private router: Router,
    private productService: ProductService,
    private authService: AuthService,
    private cartService: CartService,
    private categoryService: CategoryService,
    private userService: UserService
  ) {
    this.categories$ = this.categoryService.getCategories().pipe(
      map(cats => cats.map(c => ({ name: c.name, slug: c.slug })))
    );
    this.user$ = this.authService.user$;
    this.cartItemCount$ = this.cartService.getTotalItems();
    
    this.isAdmin$ = this.user$.pipe(
      switchMap(user => {
        if (!user) return of(false);
        return this.userService.getUserProfile(user.uid).pipe(
          map(profile => !!(profile && profile.role === 'admin'))
        );
      })
    );
  }

  ngOnInit(): void {
    this.productService.getProducts().subscribe(prods => {
      this.products = prods;
    });
  }

  onSearchInput(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query || query.length < 2) {
      this.suggestions = [];
      this.showSuggestions = false;
      return;
    }
    this.suggestions = this.products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      (p.description && p.description.toLowerCase().includes(query))
    ).slice(0, 5); // Display top 5 matches
    this.showSuggestions = this.suggestions.length > 0;
  }

  closeSuggestions(): void {
    // 200ms delay to let direct list clicks register before overlay blurs/closes
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  selectSuggestion(product: Product): void {
    this.searchQuery = '';
    this.showSuggestions = false;
    this.router.navigate(['/product', product.slug]);
  }

  onSearch() {
    this.showSuggestions = false;
    this.router.navigate(['/products'], {
      queryParams: {
        search: this.searchQuery.trim() || null
      }
    });
  }

  onSignUp() {
    this.router.navigate(['/signup']);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigate(['/']);
  }
}
