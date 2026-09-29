# FIT YATRA SUPPLEMENT STORE — MASTER RECREATION SPECIFICATION
**Document Version:** 1.0.0 (Master Release)  
**File Identifier:** `FIT_YATRA_WEBSITE_RECREATION_SPEC.md`  
**Target Specification:** 1:1 Precise Re-engineering & Reconstruction Blueprint  
**Primary Market:** Nepal (NPR / रू Rs.)  
**Created:** September 2026  

---

## 1. PROJECT IDENTITY & GLOBAL METADATA

- **Project Name:** FitYatra Supplement Store
- **Application Name (Metadata):** `Remix: FitYatra Supplement Store`
- **Document Title:** `FitYatra Supplement Store`
- **Purpose:** Recreate the existing FitYatra fitness supplement ecommerce website.
- **Primary Market:** Nepal
- **Official Currency:** NPR / Rs. / रू
- **Meta Description:** `FitYatra: Replicate and elevate the premium fitness supplementation store in Nepal. Features a highly refined catalog, goal-based wellness filters, dynamic shipping rates, coupon discounts, and an interactive personalized supplementation advisor.`
- **Major Capability:** `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`
- **Favicon & Browser Icon:** `https://i.ibb.co/wNJpkjyN/IMG-20260617-WA0012.jpg`
- **Store Logo:** `https://i.ibb.co/wNJpkjyN/IMG-20260617-WA0012.jpg`
- **Logo Navbar Styling:** `w-10 h-10 rounded-full object-cover border border-neutral-200 shadow-sm`
- **Hero Image:** `https://i.ibb.co/DFnZ5Fy/Phone-Version-4-1-1-1.jpg`
- **Hero Styling:** `aspect-[9/16] sm:aspect-auto sm:h-[80vh] md:h-[90vh] object-cover object-top brightness-[0.85] contrast-[1.05]`
- **Trust Banner 1 (Why FitYatra Comparison):** `https://i.ibb.co/rRCNBQMZ/gpt-image-2-Create-a-comparison-chart-image-titled-WHY-FITYATRA-Style-Clean-minimalist-prof-0-1-1.jpg` (Source: `https://ibb.co/Nd8b0FpL`)
- **No Risk Money Back Guarantee Banner:** `https://i.ibb.co/dJBH98db/MV2-1-1-1-1.jpg` (Source: `https://ibb.co/rfkXPDCb`)
- **Promo Banner 2:** `https://i.ibb.co/KcBDpGYD/MV2-1-1-1.jpg`
- **eSewa Dynamic QR:** `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=9744493393`
- **Content Security Policy (CSP):**
  `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; media-src 'self' data:; connect-src 'self' https:; frame-src 'self' https:; object-src 'none';" />`
- **Cache-Control:**
  `Cache-Control: no-cache, no-store, must-revalidate`
  `Pragma: no-cache`
  `Expires: 0`

---

## 2. COMPLETE ASSET DIRECTORY

| Asset Name | Semantic Purpose | Direct URL | Dimensions / Styling | Associated Section / Product |
| :--- | :--- | :--- | :--- | :--- |
| **Store Logo** | Global Brand Icon | `https://i.ibb.co/wNJpkjyN/IMG-20260617-WA0012.jpg` | `w-10 h-10 rounded-full object-cover border border-neutral-200 shadow-sm` | Navbar, Footer, Browser Tab |
| **Hero Image** | Homepage Primary Banner | `https://i.ibb.co/DFnZ5Fy/Phone-Version-4-1-1-1.jpg` | `aspect-[9/16] sm:aspect-auto sm:h-[80vh] md:h-[90vh] object-cover object-top brightness-[0.85] contrast-[1.05]` | Hero Section |
| **Trust Badge** | Seal & Authenticity Proof | `https://i.ibb.co/VY559qC6/Fit-Yatra-2.png` | `w-full max-h-[220px] object-contain` | Section 4 Promotional Strip |
| **Promo Banner** | Stack Discount Campaign | `https://i.ibb.co/KcBDpGYD/MV2-1-1-1.jpg` | `w-full max-h-[340px] object-cover rounded-none` | Section 4 Promotional Strip |
| **eSewa QR Code** | Dynamic Payment QR | `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=9744493393` | `350x350` square QR | CheckoutModal & PaymentSettings |

---

## 3. TYPOGRAPHY SYSTEM

### Google Fonts Import:
```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Outfit:wght@300..900&family=Sora:wght@300..800&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:ital,wght@0,305..900;1,305..900&family=Space+Grotesk:wght@300..700&family=JetBrains+Mono:wght@400;500;700;800&family=Quattrocento+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap');
```

### Typography Hierarchy Table:
- **Inter:** Global body text | Weights: 300, 400, 500, 600 | Sizes: `text-xs`, `text-sm`
- **Montserrat:** Titles, product names, badges, buttons | Weights: 700, 800, 900 | Styles: `uppercase, tracking-widest` | Sizes: `text-[9px]`, `text-xs`, `text-sm`
- **Playfair Display:** Section subtitles, drawer titles, FAQ headings | Weights: 400 italic, 900 | Sizes: `text-base`, `text-xl`
- **JetBrains Mono:** Pricing, badges, order IDs, timestamps, invoices | Weights: 500, 700, 800 | Sizes: `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-xs`
- **Poppins / Outfit / Sora:** Geometric numerals and alternate headings | Weights: 600, 700, 800

---

## 4. COMPLETE COLOR SYSTEM

- **Background:** `#FAF9F6`, `#F9F7F2`
- **Primary Black:** `#000000`, `#1A1A1A`, `#111111`
- **Brand Gold:** `#FFCD00`
- **Gold Hover:** `#E2B600`
- **Gold Border:** `#8B6E02`
- **Success:** `#22C55E`, `#10B981`
- **Sale Red:** `#EF4444`, `#DC2626`, `#FFEBEB`
- **eSewa Brand:** `#60BB46`
- **Khalti Brand:** `#5C2D91`
- **WhatsApp:** `#25D366` | Hover: `#20BA5A`
- **Borders:** `#E5E7EB`, `#D4D4D8`, `#1A1A1A/10`

---

## 5. DESIGN SYSTEM & AESTHETIC PRINCIPLES

- **Overall Style:** Premium editorial fitness ecommerce.
- **Buttons:** Do not use rounded pill buttons. Use strictly `rounded-none`.
- **Editorial Micro-Shadow:** `box-shadow: 0 4px 20px rgba(26, 26, 26, 0.04)`
- **Brutalist Dialog Shadow:** `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`
- **Selection Color:** `selection:bg-black selection:text-white`

---

## 6. HOMEPAGE COMPONENT ARCHITECTURE & SECTIONS

- **SECTION 1: Sticky Navigation**
  - Height: `h-16` (64px)
  - Elements: Circular FitYatra logo, FitYatra brand title, Home, Shop, Track Order, Mobile tracking icon, Wishlist trigger + item counter, Shopping bag trigger + item counter.
- **SECTION 2: Hero**
  - Image: `Phone-Version-4-1-1-1.jpg`
  - Aspect Ratio: Mobile 9:16 | Desktop 80vh–90vh
  - Overlay: `bg-gradient-to-t from-black/70 via-transparent to-black/40`
- **SECTION 3: Catalog**
  - Badge: `AUTHENTIC SUPPLEMENT RANGE`
  - Title: `Our Most Loved Products`
  - Subtitle: `Know what healthy people are consuming daily.`
  - Grid: 2 columns mobile, 3 columns desktop | Gap: `gap-3 sm:gap-6 lg:gap-8`
  - Product Cards: Image, discount, rating, stock status, servings, price, actions.
- **SECTION 4: Promotional Banners**
  - Banner 1: `Fit-Yatra-2.png`
  - Banner 2: `MV2-1-1-1.jpg`
- **SECTION 5: Order Tracking**
  - Search input for Order IDs (e.g. `FY-KTM-5421`)
  - Status pipeline: `Placed` ➔ `Processing` ➔ `Dispatched` ➔ `In Transit` ➔ `Out for Delivery` ➔ `Delivered`
- **SECTION 6: Customer Reviews**
  - Avatar carousel, 5-star ratings, verified badges, customer feedback, "Write Verified Review" modal with photo upload.
- **SECTION 7: FAQ**
  - Searchable accordion with 5 comprehensive FAQ items and verified checkmark badges.
- **SECTION 8: Contact**
  - Input fields: Full Name, Email, Phone, Inquiry Comment.
  - Ticket generator: `FY-TKXXXX` format.
  - Direct WhatsApp link: `https://wa.me/9779705283444`
- **SECTION 9: Footer**
  - Black background (`bg-black text-white`).
  - Columns: Need Help, Policies & Terms, Newsletter ("Stay Ahead. Stay Strong.").
  - Payment icons: Visa, MasterCard, PayPal, ApplePay, GooglePay, ShopPay, eSewa, Khalti, COD.
  - Copyright: Secret administrative access toggle.

---

## 7. PRODUCT DATA MODEL & SEED DATA

Every product supports:
```typescript
interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  isSoldOut: boolean;
  image: string;
  gallery: string[];
  infoImages: string[];
  description: string;
  servings: number;
  servingSize: string;
  goals: string[];
  specs: Record<string, string>;
  nutritionFacts: Record<string, string>;
  variants: Array<{ name: string; multiplier: number; discount: number }>;
}
```

### Products:
1. **Wellcore Micronized Creatine Monohydrate** (Price: Rs. 2,899 | MSRP: Rs. 3,600 | 83 Servings | 3g)
2. **L-Carnitine PRO 3000 Rapid Liquid Burn** (Price: Rs. 3,199 | MSRP: Rs. 4,000 | 30 Servings | 15ml)
3. **FitYatra High Protein Dark Chocolate Peanut Butter** (Price: Rs. 1,450 | MSRP: Rs. 1,800 | 31 Servings | 32g)
4. **Fish Oil Gold Triple Strength Omega-3** (Price: Rs. 2,199 | MSRP: Rs. 2,750 | 60 Softgels)
5. **Collagen Glow Marine Hydrolyzed Peptides** (Price: Rs. 3,699 | MSRP: Rs. 4,500 | 20 Servings | 10g)

---

## 8. CART, DYNAMIC SHIPPING & CHECKOUT

### Nepal Dynamic Shipping Tiers:
- **Kathmandu Valley:** Rs. 100 (FREE on orders over Rs. 3,000)
- **Pokhara / Lekhnath:** Rs. 150
- **Chitwan / Narayangarh:** Rs. 150
- **Major Tarai Cities:** Rs. 200
- **Hilly / Remote Districts:** Rs. 300

### Payment Channels:
- **eSewa:** Account Name: `Aashish Bohara` | Mobile: `9744493393` | Dynamic QR code
- **Khalti:** Account Name: `FitYatra Supplements` | Mobile: `9744493393`
- **Cash on Delivery (COD):** Available with order verification call
- **Screenshot Upload:** Enables customers to attach eSewa/Khalti transaction slips.

---

## 9. FIRESTORE DATABASE COLLECTIONS & REAL-TIME EVENTS

- `/products/{productId}`
- `/orders/{orderId}`
- `/reviews/{reviewId}`
- `/settings/payment`

### Real-time Event Synchronization Bus:
- `fityatra_data_refreshed`
- `fityatra_products_updated`
- `fityatra_payment_settings_updated`
- `fityatra_reviews_updated`
- `fityatra_orders_updated`

---

## 10. RECREATION INSTRUCTIONS FOR DEVELOPER AGENTS

1. Create modular components: `Navbar`, `Hero`, `ProductCard`, `ProductDetailModal`, `CartDrawer`, `WishlistDrawer`, `CheckoutModal`, `OrderTracking`, `ReviewSlider`, `FAQ`, `Contact`, `Footer`, `PolicyModal`, `AdminPanel`.
2. Connect reactive state to Firestore or fallback state synchronized via real-time bus.
3. Apply strictly `rounded-none` styling and design tokens.
4. Verify that all 5 products, images, and shipping calculations function seamlessly.
