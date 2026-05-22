# 📊 Men's Clothing App Component Architecture

This document describes how the Angular components in your project are organized, connected, and communicate with each other.

## 📝 Component Roles Explained (in simple English)

### 1. The Root Container (`AppComponent`)
This is the master parent wrapper component at the very top of your application.
*   **Header Bar:** Displays the logo, category links, search input, and the real-time red shopping cart counter badge.
*   **Footer:** Displays copyright details and links to policy pages.
*   **`<router-outlet>`:** This is a dynamic view window. The header and footer stay on screen, but this window decides which page below to display depending on the active web link.

---

### 2. Main Storefront Pages
*   **HomeComponent:** The landing page of the store. It displays promo banners, clickable categories (T-Shirts, Jackets, Shoes, Accessories), and a featured products grid.
*   **ProductsComponent:** The main listing page where customers can browse items, search for keywords, filter by category, adjust the price slider, and sort by rating/popularity.
*   **ProductDetailComponent:** The product page showing details for a single selected clothing item. It features a photo gallery, size selection (S, M, L, XL), related products, and custom user reviews.
*   **CartComponent:** Displays the list of selected items in the user's cart, calculates the total price, and allows modifying item quantities or removing them.

---

### 3. Order Processing & Verification
*   **CheckoutComponent:** Contains inputs for the customer's shipping address, billing address, and payment card details (Card Number, Expiry, CVV). Once clicked, it simulates payment processing, uploads the transaction, and wipes the cart clean.
*   **OrderSuccessComponent:** A success page that congratulates the user and prints their transaction order ID.

---

### 4. Profiles & Customer Support
*   **LoginComponent / SignupComponent:** Simple credential forms enabling customer sign-in/registration through Firebase Auth.
*   **ProfileComponent:** A secure user portal displaying default addresses and a history of all past purchases.
*   **ContactComponent:** A support page displaying store contact details (Phone, Email, Address) and a support email contact form.
*   **ContentPageComponent:** A generic, clean text template used to render static information like *About Us*, *FAQ*, *Shipping Policies*, *Return Rules*, and *Privacy Regulations*.

---

### 5. Management Dashboard
*   **AdminComponent:** A protected management console. Only users flagged as "admin" can access this screen. It allows adding new products, editing sizes and stock, and auditing all customer transactions.
