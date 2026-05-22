import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/components/footer/footer.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { ProductService } from './features/products/services/product.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'mens-clothing-app';

  constructor(private productService: ProductService) {
    // Auto-seed Firestore on first load if database is empty
    this.productService.getProducts().pipe(take(1)).subscribe(async products => {
      if (products.length === 0) {
        console.log('[App] Firestore is empty — auto-seeding products and categories...');
        try {
          await this.productService.seedDatabase();
          console.log('[App] ✅ Database seeded successfully!');
        } catch (e) {
          console.error('[App] ❌ Error seeding database:', e);
        }
      }
    });
  }
}
