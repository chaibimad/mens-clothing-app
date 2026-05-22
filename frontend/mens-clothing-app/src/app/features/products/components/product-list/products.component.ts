import { CommonModule, NgFor, NgIf, AsyncPipe, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Observable, combineLatest, map, shareReplay, BehaviorSubject } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Product, Category } from '../../../../core/models/db.models';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, AsyncPipe, CurrencyPipe, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  categoryOptions$!: Observable<{ label: string; value: string }[]>;
  readonly sortOptions = [
    { value: 'featured',   label: 'Featured First' },
    { value: 'rating',     label: 'Top Rated' },
    { value: 'reviews',    label: 'Best Selling' },
    { value: 'price-low',  label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ];

  searchTerm = '';
  selectedCategoryId = 'All';
  sortBy = 'featured';
  selectedMaxPrice = 200;
  maxPriceLimit = 200;
  filteredProducts$!: Observable<Product[]>;

  private filtersSubject = new BehaviorSubject<void>(undefined);

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const categories$ = this.categoryService.getCategories().pipe(shareReplay(1));

    // Build category option list for the dropdown
    this.categoryOptions$ = categories$.pipe(
      map(cats => [
        { label: 'All', value: 'All' },
        ...cats.map(c => ({ label: c.name, value: c.id }))
      ])
    );

    // Pre-select category from URL slug
    combineLatest([this.route.paramMap, this.route.queryParamMap, categories$])
      .subscribe(([params, queryParams, categories]) => {
        const slug = params.get('slug');
        if (slug) {
          const matched = categories.find(c => c.slug === slug);
          this.selectedCategoryId = matched ? matched.id : 'All';
        } else {
          this.selectedCategoryId = 'All';
        }
        this.searchTerm = queryParams.get('search') ?? '';
        this.sortBy = queryParams.get('sort') ?? 'featured';
        this.filtersSubject.next();
      });

    // Main filtered product stream
    this.filteredProducts$ = combineLatest([
      this.productService.getProducts(),
      this.filtersSubject
    ]).pipe(
      map(([products]) => this.applyFilters(products))
    );
  }

  get activeCategoryHeading(): string {
    return this.selectedCategoryId === 'All' ? 'All Products' : '';
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryId = 'All';
    this.sortBy = 'featured';
    this.selectedMaxPrice = 200;
    this.router.navigate(['/products']);
    this.filtersSubject.next();
  }

  updateCategory(categoryId: string): void {
    this.selectedCategoryId = categoryId;
    this.filtersSubject.next();
  }

  applySearch(): void { this.filtersSubject.next(); }
  onSortChange(): void { this.filtersSubject.next(); }
  onPriceChange(): void { this.filtersSubject.next(); }

  private applyFilters(allProducts: Product[]): Product[] {
    const needle = this.searchTerm.trim().toLowerCase();

    let products = allProducts.filter(p => {
      const matchesCat = this.selectedCategoryId === 'All' || p.category_id === this.selectedCategoryId;
      const matchesSearch = !needle ||
        p.name.toLowerCase().includes(needle) ||
        p.description.toLowerCase().includes(needle);
      const matchesPrice = p.base_price <= this.selectedMaxPrice;
      return matchesCat && matchesSearch && matchesPrice;
    });

    return products.sort((a, b) => this.compareProducts(a, b));
  }

  private compareProducts(a: Product, b: Product): number {
    switch (this.sortBy) {
      case 'rating':      return b.rating - a.rating;
      case 'reviews':     return b.reviews - a.reviews;
      case 'price-low':   return a.base_price - b.base_price;
      case 'price-high':  return b.base_price - a.base_price;
      case 'featured':
      default:
        return Number(b.badges.includes('FEATURED')) - Number(a.badges.includes('FEATURED'));
    }
  }
}
