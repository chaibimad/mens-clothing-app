import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { ProductsComponent } from './features/products/components/product-list/products.component';
import { ProductDetailComponent } from './features/products/components/product-detail/product-detail.component';
import { ContactComponent } from './features/support/contact/contact.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { CartComponent } from './features/cart/components/cart-details/cart.component';
import { authGuard } from './core/guards/auth.guard';
import { ContentPageComponent } from './features/support/content-page/content-page.component';
import { CheckoutComponent } from './features/cart/components/checkout/checkout.component';
import { OrderSuccessComponent } from './features/orders/components/order-success/order-success.component';
import { ProfileComponent } from './features/profile/profile.component';
import { AdminComponent } from './features/admin/admin.component';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'category/:slug', component: ProductsComponent },
  { path: 'product/:slug', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'order-success/:orderId', component: OrderSuccessComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'about',
    component: ContentPageComponent,
    data: {
      title: 'About Us',
      subtitle: 'We build a modern menswear shopping experience focused on quality essentials, reliable service, and timeless everyday style.',
      highlights: ['Curated weekly drops', 'Quality-first essentials', 'Simple shopping experience'],
      sections: [
        {
          heading: 'Who We Are',
          body: [
            'Mens Clothing is a digital storefront created for customers who want everyday wardrobe staples without the clutter. We focus on clean product presentation, practical categories, and fast browsing.',
            'From T-Shirts and jackets to shoes and accessories, the goal is to make it easy for shoppers to discover reliable wardrobe pieces in one streamlined experience.'
          ]
        },
        {
          heading: 'What We Value',
          body: [
            'We value durable materials, wearable design, and an easy customer journey. Every section of the site is built to help customers compare products, find sizing help, and move toward checkout with confidence.',
            'The storefront is designed to support real ecommerce growth, with room for search, filtering, authentication, cart features, and customer support workflows.'
          ]
        }
      ],
      cta: {
        label: 'Shop The Collection',
        link: '/products'
      }
    }
  },
  {
    path: 'shipping-policy',
    component: ContentPageComponent,
    data: {
      title: 'Shipping Policy',
      subtitle: 'Clear shipping expectations help customers buy with confidence. Here is how order processing and delivery currently work in the storefront experience.',
      highlights: ['Fixed shipping model', 'Fast order processing', 'Tracking-ready workflow'],
      sections: [
        {
          heading: 'Processing',
          body: [
            'Orders are prepared after payment confirmation or order verification. Processing typically includes stock review, packaging, and label creation before carrier pickup.',
            'Customers should receive order confirmation quickly, followed by a shipment update once tracking is available.'
          ]
        },
        {
          heading: 'Delivery',
          body: [
            'Standard delivery is designed around a fixed shipping concept so customers can understand costs before checkout. Delivery windows may vary depending on destination and carrier conditions.',
            'For future production use, this page can be connected to real warehouse, courier, and regional shipping rules.'
          ]
        }
      ],
      cta: {
        label: 'Contact Support',
        link: '/contact'
      }
    }
  },
  {
    path: 'returns',
    component: ContentPageComponent,
    data: {
      title: 'Returns & Exchanges',
      subtitle: 'Sizing confidence and product satisfaction are key parts of the shopping experience, so returns and exchanges need to stay simple and customer-friendly.',
      highlights: ['Straightforward request flow', 'Exchange-friendly process', 'Support-led resolution'],
      sections: [
        {
          heading: 'Return Conditions',
          body: [
            'Items should be returned in their original condition with tags and packaging intact where possible. Returns normally apply to unworn, unwashed, and undamaged items.',
            'Customers can be guided to support if they receive the wrong item, a damaged item, or need help understanding return eligibility.'
          ]
        },
        {
          heading: 'Exchange Support',
          body: [
            'Exchanges work best for size-related issues, especially for jackets, shoes, and fitted items. A customer support route helps users move quickly toward the right replacement option.',
            'This flow can later connect to order history and inventory checks for a more complete ecommerce system.'
          ]
        }
      ],
      cta: {
        label: 'View Size Guide',
        link: '/size-guide'
      }
    }
  },
  {
    path: 'size-guide',
    component: ContentPageComponent,
    data: {
      title: 'Size Guide',
      subtitle: 'A clear size guide reduces returns and helps customers feel confident when buying online across the four main menswear categories.',
      highlights: ['Category-specific fit help', 'Better purchase confidence', 'Lower size-related returns'],
      sections: [
        {
          heading: 'Tops And Jackets',
          body: [
            'For T-Shirts and jackets, customers usually compare chest width, shoulder fit, and preferred silhouette. Relaxed pieces allow more room, while tailored styles fit closer to the body.',
            'When building on this page later, a measurement table can be added for S through XL with garment dimensions and fit notes.'
          ]
        },
        {
          heading: 'Shoes And Accessories',
          body: [
            'Footwear benefits from clear size conversion guidance and notes about true-to-size versus narrow or roomy fits. Accessories should include belt measurements and any adjustable fit details.',
            'This page is also a strong place to include measuring tips and visual diagrams for customer self-service.'
          ]
        }
      ],
      cta: {
        label: 'Browse Products',
        link: '/products'
      }
    }
  },
  {
    path: 'faq',
    component: ContentPageComponent,
    data: {
      title: 'Frequently Asked Questions',
      subtitle: 'Common answers help customers resolve issues quickly without waiting for support, especially around products, sizing, shipping, and returns.',
      highlights: ['Faster self-service', 'Support deflection', 'Clear buying guidance'],
      sections: [
        {
          heading: 'Orders And Products',
          body: [
            'Customers often ask whether products are in stock, how featured items are selected, and whether new arrivals refresh weekly. This storefront is structured to highlight all of those paths clearly.',
            'Product detail pages can continue to grow with stock status, estimated delivery, and care instructions.'
          ]
        },
        {
          heading: 'Account And Support',
          body: [
            'Login and sign-up pages are available to support the customer journey, even though backend authentication is not yet connected. Contact routes and policy pages help users find guidance without confusion.',
            'As the project grows, this page can be turned into a real accordion FAQ powered by CMS or support content.'
          ]
        }
      ],
      cta: {
        label: 'Ask A Question',
        link: '/contact'
      }
    }
  },
  {
    path: 'privacy-policy',
    component: ContentPageComponent,
    data: {
      title: 'Privacy Policy',
      subtitle: 'Customers should always understand what information is collected, why it is used, and how the shopping experience protects their data.',
      highlights: ['Transparent data use', 'Customer trust', 'Future-ready compliance'],
      sections: [
        {
          heading: 'Information We Handle',
          body: [
            'In a production ecommerce setup, customer information may include account details, order information, delivery addresses, and support messages. This current project is frontend-focused and does not yet persist personal data.',
            'Any live deployment should clearly explain what information is required for checkout, fulfillment, and customer service.'
          ]
        },
        {
          heading: 'Security And Rights',
          body: [
            'Customers should have clear access to privacy choices, support channels, and account controls. The storefront structure already includes routes that can support those workflows.',
            'This page can later be expanded with legal text, cookie settings, and regional privacy requirements.'
          ]
        }
      ],
      cta: {
        label: 'Read Terms Of Service',
        link: '/terms-of-service'
      }
    }
  },
  {
    path: 'terms-of-service',
    component: ContentPageComponent,
    data: {
      title: 'Terms Of Service',
      subtitle: 'Terms provide the operating rules for customers, transactions, and use of the storefront across catalog browsing, account actions, and future checkout flows.',
      highlights: ['Store usage expectations', 'Order-related guidance', 'Customer clarity'],
      sections: [
        {
          heading: 'Using The Store',
          body: [
            'Customers are expected to use the site responsibly, provide accurate information when placing orders, and follow any account or support guidelines shown during the shopping journey.',
            'As the application grows, this route can support fuller legal language tied to payments, shipping, returns, and account eligibility.'
          ]
        },
        {
          heading: 'Product And Order Notes',
          body: [
            'Pricing, product imagery, and availability should always be displayed as accurately as possible, while still allowing updates as inventory changes. Orders may be subject to review for fraud prevention or stock confirmation.',
            'This page is ready to be replaced or expanded with production-ready terms once business requirements are finalized.'
          ]
        }
      ],
      cta: {
        label: 'Return To Shop',
        link: '/products'
      }
    }
  },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '' }
];
