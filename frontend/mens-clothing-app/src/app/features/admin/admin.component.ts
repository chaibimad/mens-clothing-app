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
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../products/services/product.service';
import { CategoryService } from '../products/services/category.service';
import { OrderService } from '../orders/services/order.service';
import { Product, ProductVariant, Category, Order, OrderItem } from '../../core/models/db.models';
import { Observable, take } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, CurrencyPipe, FormsModule, RouterLink,
    MatButtonModule, MatIconModule, MatCardModule, MatDividerModule,
    MatFormFieldModule, MatInputModule, MatCheckboxModule, MatTabsModule,
    MatSelectModule, MatSnackBarModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  orders: Order[] = [];
  selectedOrderForItems: Order | null = null;
  orderItems: OrderItem[] = [];
  isLoading = true;

  // Product Form
  showProductForm = false;
  editingProductId: string | null = null;
  productForm = {
    name: '',
    slug: '',
    category_id: '',
    base_price: 0,
    imageUrl: '',
    description: '',
    is_published: true
  };

  // Variant Manager
  selectedProductForVariants: Product | null = null;
  variants: ProductVariant[] = [];
  showVariantForm = false;
  editingVariantId: string | null = null;
  variantForm = {
    sku: '',
    title: '',
    price_modifier: 0,
    stock_quantity: 10
  };

  // Category Form
  showCategoryForm = false;
  categoryForm = {
    name: '',
    slug: ''
  };

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAdminData();
  }

  private loadAdminData(): void {
    this.isLoading = true;

    this.productService.getAllProducts().subscribe(prods => {
      this.products = prods;
      this.isLoading = false;
    });

    this.categoryService.getCategories().subscribe(cats => {
      this.categories = cats;
    });

    this.orderService.getAllOrders().subscribe(ords => {
      this.orders = ords;
    });
  }

  // ── Product CRUD ───────────────────────────────────────────
  openNewProductForm(): void {
    this.editingProductId = null;
    this.productForm = {
      name: '',
      slug: '',
      category_id: this.categories[0]?.id || '',
      base_price: 19.99,
      imageUrl: '',
      description: '',
      is_published: true
    };
    this.selectedProductForVariants = null;
    this.variants = [];
    this.showProductForm = true;
  }

  openEditProductForm(prod: Product): void {
    this.editingProductId = prod.id;
    this.productForm = {
      name: prod.name,
      slug: prod.slug,
      category_id: prod.category_id,
      base_price: prod.base_price,
      imageUrl: prod.imageUrl,
      description: prod.description || '',
      is_published: prod.is_published
    };
    this.selectedProductForVariants = prod;
    this.loadVariants(prod.id);
    this.showProductForm = true;
  }

  closeProductForm(): void {
    this.showProductForm = false;
    this.editingProductId = null;
    this.selectedProductForVariants = null;
    this.variants = [];
  }

  generateProductSlug(): void {
    this.productForm.slug = this.productForm.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async saveProduct(): Promise<void> {
    try {
      if (this.editingProductId) {
        await this.productService.updateProduct(this.editingProductId, this.productForm);
        this.snackBar.open('Product updated successfully!', 'Close', { duration: 3000 });
      } else {
        const prodId = await this.productService.createProduct(this.productForm);
        // Automatically add one default variant "Standard" for a new product
        await this.productService.addVariant(prodId, {
          sku: `${this.productForm.slug.toUpperCase().replace(/-/g, '')}-STD`,
          title: 'Standard',
          price_modifier: 0,
          stock_quantity: 20
        });
        this.snackBar.open('Product and default variant created successfully!', 'Close', { duration: 3000 });
      }
      this.closeProductForm();
    } catch (e) {
      this.snackBar.open('Error saving product: ' + e, 'Close', { duration: 5000 });
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await this.productService.deleteProduct(productId);
        this.snackBar.open('Product deleted successfully!', 'Close', { duration: 3000 });
      } catch (e) {
        this.snackBar.open('Error deleting product: ' + e, 'Close', { duration: 5000 });
      }
    }
  }

  // ── Variant CRUD ────────────────────────────────────────────
  loadVariants(productId: string): void {
    this.productService.getVariants(productId).subscribe(vars => {
      this.variants = vars;
    });
  }

  openNewVariantForm(): void {
    if (!this.selectedProductForVariants) return;
    this.editingVariantId = null;
    const skuBase = this.selectedProductForVariants.slug.toUpperCase().replace(/-/g, '');
    this.variantForm = {
      sku: `${skuBase}-NEW`,
      title: 'New Variant',
      price_modifier: 0,
      stock_quantity: 10
    };
    this.showVariantForm = true;
  }

  openEditVariantForm(v: ProductVariant): void {
    this.editingVariantId = v.id;
    this.variantForm = {
      sku: v.sku,
      title: v.title,
      price_modifier: v.price_modifier,
      stock_quantity: v.stock_quantity
    };
    this.showVariantForm = true;
  }

  closeVariantForm(): void {
    this.showVariantForm = false;
    this.editingVariantId = null;
  }

  async saveVariant(): Promise<void> {
    if (!this.selectedProductForVariants) return;
    try {
      if (this.editingVariantId) {
        await this.productService.updateVariant(this.selectedProductForVariants.id, this.editingVariantId, this.variantForm);
        this.snackBar.open('Variant updated successfully!', 'Close', { duration: 3000 });
      } else {
        await this.productService.addVariant(this.selectedProductForVariants.id, this.variantForm);
        this.snackBar.open('Variant added successfully!', 'Close', { duration: 3000 });
      }
      this.closeVariantForm();
    } catch (e) {
      this.snackBar.open('Error saving variant: ' + e, 'Close', { duration: 5000 });
    }
  }

  async deleteVariant(variantId: string): Promise<void> {
    if (!this.selectedProductForVariants) return;
    if (confirm('Are you sure you want to delete this variant?')) {
      try {
        await this.productService.deleteVariant(this.selectedProductForVariants.id, variantId);
        this.snackBar.open('Variant deleted successfully!', 'Close', { duration: 3000 });
      } catch (e) {
        this.snackBar.open('Error deleting variant: ' + e, 'Close', { duration: 5000 });
      }
    }
  }

  // ── Category CRUD ──────────────────────────────────────────
  openNewCategoryForm(): void {
    this.categoryForm = { name: '', slug: '' };
    this.showCategoryForm = true;
  }

  closeCategoryForm(): void {
    this.showCategoryForm = false;
  }

  generateCategorySlug(): void {
    this.categoryForm.slug = this.categoryForm.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async saveCategory(): Promise<void> {
    try {
      await this.categoryService.createCategory({
        name: this.categoryForm.name,
        slug: this.categoryForm.slug,
        parent_id: null
      });
      this.snackBar.open('Category created successfully!', 'Close', { duration: 3000 });
      this.closeCategoryForm();
    } catch (e) {
      this.snackBar.open('Error creating category: ' + e, 'Close', { duration: 5000 });
    }
  }

  // ── Order Management ─────────────────────────────────────────
  async updateStatus(orderId: string, status: any): Promise<void> {
    try {
      await this.orderService.updateOrderStatus(orderId, status);
      this.snackBar.open(`Order status updated to "${status}" successfully!`, 'Close', { duration: 3000 });
    } catch (e) {
      this.snackBar.open('Error updating status: ' + e, 'Close', { duration: 5000 });
    }
  }

  toggleOrderItems(order: Order): void {
    if (this.selectedOrderForItems?.id === order.id) {
      this.selectedOrderForItems = null;
      this.orderItems = [];
    } else {
      this.selectedOrderForItems = order;
      this.orderService.getOrderItems(order.id).subscribe(items => {
        this.orderItems = items;
      });
    }
  }
}
