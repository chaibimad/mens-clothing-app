import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor, AsyncPipe, CurrencyPipe } from '@angular/common';
import { ProductService } from '../products/services/product.service';
import { Product } from '../../core/models/db.models';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Observable, BehaviorSubject, switchMap, catchError, of } from 'rxjs';

type HomeFeature = {
  icon: string;
  title: string;
  subtitle: string;
};

type HomeCategory = {
  title: string;
  subtitle: string;
  slug: string;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, AsyncPipe, CurrencyPipe, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  activeTab$ = new BehaviorSubject<string>('New Arrival');
  filteredProducts$!: Observable<Product[]>;

  features: HomeFeature[] = [
    { icon: 'local_shipping', title: 'Fixed Shipping',   subtitle: 'Same price for all orders' },
    { icon: 'payments',       title: 'Cash on Delivery', subtitle: 'Pay when you receive it' },
    { icon: 'verified',       title: 'Quality Products', subtitle: 'Original and durable items' },
    { icon: 'support_agent',  title: 'Support',          subtitle: 'We help you 7/7' }
  ];

  categories: HomeCategory[] = [
    { title: 'T-Shirts',     subtitle: 'New season',       slug: 't-shirts' },
    { title: 'Jackets',      subtitle: 'Street style',     slug: 'jackets' },
    { title: 'Shoes',        subtitle: 'Casual & sneakers', slug: 'shoes' },
    { title: 'Accessories',  subtitle: 'Bags & belts',     slug: 'accessories' }
  ];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.filteredProducts$ = this.activeTab$.pipe(
      switchMap(tab => {
        let obs$: Observable<Product[]>;
        switch (tab) {
          case 'New Arrival':  obs$ = this.productService.getNewArrivals(); break;
          case 'Best Selling': obs$ = this.productService.getBestSellers(); break;
          case 'Top Rated':    obs$ = this.productService.getTopRated(); break;
          default:             obs$ = this.productService.getProducts(); break;
        }
        
        return obs$.pipe(
          catchError(err => {
            console.error(`[HomeComponent] Firestore error loading ${tab} products. You probably need to create a composite index in the Firebase Console:`, err);
            return of([]); // Return empty array to keep the stream alive
          })
        );
      })
    );
  }

  setTab(tab: string) {
    this.activeTab$.next(tab);
  }
}
