import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, doc, docData,
  query, where, setDoc, updateDoc, deleteDoc, serverTimestamp, limit,
  addDoc, orderBy, getDocs
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Product, ProductVariant, ProductReview } from '../../../core/models/db.models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private firestore = inject(Firestore);
  private productsCol = collection(this.firestore, 'products');

  getProducts(): Observable<Product[]> {
    const q = query(this.productsCol, where('is_published', '==', true));
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }

  getProductBySlug(slug: string): Observable<Product | undefined> {
    const q = query(this.productsCol, where('slug', '==', slug), limit(1));
    return (collectionData(q, { idField: 'id' }) as Observable<Product[]>).pipe(
      map(results => results[0])
    );
  }

  getProductById(id: string): Observable<Product | undefined> {
    return docData(doc(this.firestore, 'products', id), { idField: 'id' }) as Observable<Product | undefined>;
  }

  getFeaturedProducts(): Observable<Product[]> {
    const q = query(this.productsCol, where('is_published', '==', true), where('badges', 'array-contains', 'FEATURED'));
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }

  getNewArrivals(): Observable<Product[]> {
    const q = query(this.productsCol, where('is_published', '==', true), limit(3));
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }

  getBestSellers(): Observable<Product[]> {
    const q = query(this.productsCol, where('is_published', '==', true));
    return (collectionData(q, { idField: 'id' }) as Observable<Product[]>).pipe(
      map(products => products.filter(p => p.reviews >= 100))
    );
  }

  getTopRated(): Observable<Product[]> {
    const q = query(this.productsCol, where('is_published', '==', true));
    return (collectionData(q, { idField: 'id' }) as Observable<Product[]>).pipe(
      map(products => products.filter(p => p.rating === 5))
    );
  }

  getProductsByCategory(categoryId: string): Observable<Product[]> {
    const q = query(this.productsCol, where('is_published', '==', true), where('category_id', '==', categoryId));
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }

  getVariants(productId: string): Observable<ProductVariant[]> {
    const variantsCol = collection(this.firestore, `products/${productId}/variants`);
    return collectionData(variantsCol, { idField: 'id' }) as Observable<ProductVariant[]>;
  }

  getCategories(): Observable<string[]> {
    return this.getProducts().pipe(
      map(products => [...new Set(products.map(p => p.category_id))])
    );
  }

  async seedDatabase(): Promise<void> {
    // First, seed categories
    const categories = [
      { id: 'cat-1', name: 'T-Shirts',    slug: 't-shirts',    parent_id: null },
      { id: 'cat-2', name: 'Jackets',     slug: 'jackets',     parent_id: null },
      { id: 'cat-3', name: 'Shoes',       slug: 'shoes',       parent_id: null },
      { id: 'cat-4', name: 'Accessories', slug: 'accessories', parent_id: null },
    ];

    for (const cat of categories) {
      await setDoc(doc(this.firestore, 'categories', cat.id), cat);
    }

    // Seed products with new schema
    const products = [
      {
        id: 'prod-1',
        category_id: 'cat-1',
        name: 'Classic White T-Shirt',
        slug: 'classic-white-t-shirt',
        description: 'A premium quality white t-shirt made from 100% organic cotton. Perfect for everyday wear, offering a comfortable fit and a minimalist aesthetic.',
        base_price: 25.00,
        is_published: true,
        created_at: serverTimestamp(),
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400',
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&q=80&w=800',
        ],
        badges: ['15% OFF'],
        rating: 4,
        reviews: 120
      },
      {
        id: 'prod-2',
        category_id: 'cat-2',
        name: 'Denim Jacket',
        slug: 'denim-jacket',
        description: 'Rugged and stylish denim jacket with a vintage wash. Featuring durable construction and a timeless design that only gets better with age.',
        base_price: 85.00,
        is_published: true,
        created_at: serverTimestamp(),
        imageUrl: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&q=80&w=400',
        images: [
          'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=800',
        ],
        badges: ['FEATURED'],
        rating: 5,
        reviews: 85
      },
      {
        id: 'prod-3',
        category_id: 'cat-3',
        name: 'Urban Sneakers',
        slug: 'urban-sneakers',
        description: 'Modern urban sneakers designed for both comfort and style. Featuring breathable mesh, cushioned soles, and a sleek profile.',
        base_price: 120.00,
        is_published: true,
        created_at: serverTimestamp(),
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400',
        images: [
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800',
        ],
        badges: ['18% OFF'],
        rating: 4,
        reviews: 210
      },
      {
        id: 'prod-4',
        category_id: 'cat-4',
        name: 'Leather Belt',
        slug: 'leather-belt',
        description: 'Handcrafted genuine leather belt with a brushed metal buckle. A versatile accessory that complements both formal and casual attire.',
        base_price: 45.00,
        is_published: true,
        created_at: serverTimestamp(),
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1624222247344-550fb80583dc?auto=format&fit=crop&q=80&w=800',
        ],
        badges: [],
        rating: 4,
        reviews: 45
      },
      {
        id: 'prod-5',
        category_id: 'cat-2',
        name: 'Bomber Jacket',
        slug: 'bomber-jacket',
        description: 'Lightweight bomber jacket with a water-resistant shell. Perfect for transitional weather, combining utility with a sharp urban look.',
        base_price: 75.00,
        is_published: true,
        created_at: serverTimestamp(),
        imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=400',
        images: [
          'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800',
        ],
        badges: ['FEATURED'],
        rating: 5,
        reviews: 62
      }
    ];

    // Variant templates per product: S/M/L/XL for clothes, sizes 8-12 for shoes
    const clothingSizes = ['S', 'M', 'L', 'XL'];
    const shoeSizes = ['8', '9', '10', '11', '12'];
    const beltSizes = ['32', '34', '36', '38'];

    const variantsMap: Record<string, string[]> = {
      'prod-1': clothingSizes,
      'prod-2': ['M', 'L', 'XL'],
      'prod-3': shoeSizes,
      'prod-4': beltSizes,
      'prod-5': clothingSizes,
    };

    for (const product of products) {
      await setDoc(doc(this.firestore, 'products', product.id), product);

      const sizes = variantsMap[product.id];
      for (let i = 0; i < sizes.length; i++) {
        const variantId = `${product.id}-var-${i + 1}`;
        const skuBase = product.slug.toUpperCase().replace(/-/g, '');
        const variant: ProductVariant = {
          id: variantId,
          product_id: product.id,
          sku: `${skuBase}-${sizes[i]}`,
          title: `Size ${sizes[i]}`,
          price_modifier: 0,
          stock_quantity: Math.floor(Math.random() * 50) + 5,
          created_at: serverTimestamp() as any,
        };
        await setDoc(
          doc(this.firestore, `products/${product.id}/variants`, variantId),
          variant
        );
      }
    }
  }

  getAllProducts(): Observable<Product[]> {
    return collectionData(this.productsCol, { idField: 'id' }) as Observable<Product[]>;
  }

  async createProduct(prod: Omit<Product, 'id' | 'created_at' | 'images' | 'badges' | 'rating' | 'reviews'> & Partial<Product>): Promise<string> {
    const newRef = doc(this.productsCol);
    await setDoc(newRef, {
      id: newRef.id,
      images: prod.images || [prod.imageUrl],
      badges: prod.badges || [],
      rating: prod.rating || 5,
      reviews: prod.reviews || 0,
      ...prod,
      created_at: serverTimestamp()
    });
    return newRef.id;
  }

  async updateProduct(productId: string, data: Partial<Product>): Promise<void> {
    const productRef = doc(this.firestore, 'products', productId);
    await updateDoc(productRef, { ...data });
  }

  async deleteProduct(productId: string): Promise<void> {
    const productRef = doc(this.firestore, 'products', productId);
    await deleteDoc(productRef);
  }

  async addVariant(productId: string, variant: Omit<ProductVariant, 'id' | 'product_id' | 'created_at'>): Promise<void> {
    const variantsCol = collection(this.firestore, `products/${productId}/variants`);
    const newRef = doc(variantsCol);
    await setDoc(newRef, {
      id: newRef.id,
      product_id: productId,
      ...variant,
      created_at: serverTimestamp()
    });
  }

  async updateVariant(productId: string, variantId: string, data: Partial<ProductVariant>): Promise<void> {
    const variantRef = doc(this.firestore, `products/${productId}/variants`, variantId);
    await updateDoc(variantRef, { ...data });
  }

  async deleteVariant(productId: string, variantId: string): Promise<void> {
    const variantRef = doc(this.firestore, `products/${productId}/variants`, variantId);
    await deleteDoc(variantRef);
  }

  getReviews(productId: string): Observable<ProductReview[]> {
    const reviewsCol = collection(this.firestore, `products/${productId}/reviews`);
    const q = query(reviewsCol, orderBy('created_at', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<ProductReview[]>;
  }

  async addReview(productId: string, review: Omit<ProductReview, 'id' | 'created_at'>): Promise<void> {
    const reviewsCol = collection(this.firestore, `products/${productId}/reviews`);
    
    // 1. Add review doc
    await addDoc(reviewsCol, {
      ...review,
      created_at: serverTimestamp()
    });

    // 2. Fetch all reviews in subcollection to calculate average
    const querySnapshot = await getDocs(reviewsCol);
    const reviews: any[] = [];
    querySnapshot.forEach(doc => {
      reviews.push(doc.data());
    });

    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const averageRating = totalReviews > 0 ? Math.round((totalRating / totalReviews) * 10) / 10 : 5;

    // 3. Update parent product document
    const productRef = doc(this.firestore, 'products', productId);
    await updateDoc(productRef, {
      rating: Math.round(averageRating),
      reviews: totalReviews
    });
  }
}
