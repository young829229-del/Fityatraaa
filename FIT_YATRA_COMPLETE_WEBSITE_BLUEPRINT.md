# FIT YATRA SUPPLEMENT STORE — MASTER RECONSTRUCTION BLUEPRINT
**Document Version:** 1.0.0 (Master Release)  
**Target Specification:** 1:1 Precise Re-engineering & Reconstruction Blueprint  
**Primary Market:** Nepal (NPR / रू Rs.)  
**Created:** September 2026  

---

## 1. WEBSITE IDENTITY & METADATA

| Property | Value | Verification Status |
| :--- | :--- | :--- |
| **Website Title** | `FitYatra Supplement Store` | Verified |
| **Application Name** | `Remix: FitYatra Supplement Store` | Verified |
| **SEO Title** | `FitYatra Supplement Store \| Nepal's Premier Fitness Nutrition & Supplementation` | Verified |
| **Meta Description** | `FitYatra: Replicate and elevate the premium fitness supplementation store in Nepal. Features a highly refined catalog, goal-based wellness filters, dynamic shipping rates, coupon discounts, and an interactive personalized supplementation advisor.` | Verified |
| **SEO Keywords** | `FitYatra, fitness supplements Nepal, buy creatine Kathmandu, whey protein Nepal, L-carnitine, peanut butter Nepal, fish oil omega 3, marine collagen, authentic supplements Nepal, Cash on delivery Kathmandu` | Verified |
| **Primary Market** | Nepal | Verified |
| **Official Currency** | NPR (Nepalese Rupee) / Prefix `Rs.` or `रू` | Verified |
| **Favicon URL** | `https://i.ibb.co/wNJpkjyN/IMG-20260617-WA0012.jpg` | Verified |
| **Store Logo URL** | `https://i.ibb.co/wNJpkjyN/IMG-20260617-WA0012.jpg` | Verified |
| **Social / OG Image** | `https://i.ibb.co/DFnZ5Fy/Phone-Version-4-1-1-1.jpg` | Verified |
| **Canonical URL** | `https://fityatra.com.np` (Production Target) / Current App URL | Verified |
| **Robots Directives** | `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` | Verified |
| **Major Capabilities** | `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` | Verified |
| **Content Security Policy (CSP)** | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; media-src 'self' data:; connect-src 'self' https:; frame-src 'self' https:; object-src 'none';` | Verified |
| **HTTP Cache Directives** | `Cache-Control: no-cache, no-store, must-revalidate`<br>`Pragma: no-cache`<br>`Expires: 0` | Verified |

---

## 2. COMPLETE WEBSITE STRUCTURE & SITEMAP

The application is structured as a high-density, single-page editorial ecommerce application with dedicated reactive drawers, comprehensive modals, and a hidden administrative panel:

```
FIT YATRA APPLICATION TREE
│
├── [Global Shell]
│   ├── Sticky Notification / Announcement Bar (Free Valley Shipping Over Rs. 3,000)
│   ├── Sticky Navbar (Height: 64px / h-16)
│   │   ├── Brand Identity (Circular Logo 40x40 + 'FITYATRA' Monospace/Montserrat)
│   │   ├── Desktop Links (Catalog, Goal Guides, Track Order, Authenticity Guarantee)
│   │   ├── Search Trigger & Filter Action
│   │   ├── Wishlist Drawer Trigger (with reactive item counter)
│   │   └── Cart Drawer Trigger (with reactive item counter & subtotal chip)
│   │
├── [Main Page Sections]
│   ├── 1. Hero Section (Editorial Full-bleed / High-impact mobile portrait banner)
│   │   ├── Background: Phone-Version-4-1-1-1.jpg
│   │   ├── Headline: "NEPAL'S AUTHENTIC NUTRITION DESTINATION"
│   │   ├── Subtitle: "Lab-tested, barcode-verified sports nutrition delivered directly across all 7 provinces."
│   │   └── Direct Action Buttons: [EXPLORE CATALOG] and [VERIFY BATCH / TRACK]
│   │
│   ├── 2. Value Proposition Strip
│   │   ├── 100% Genuine Sealed Imports
│   │   ├── Same-Day Valley Express Dispatch
│   │   ├── Direct eSewa / Khalti / COD Settlement
│   │   └── 7-Day Money-Back Seal Guarantee
│   │
│   ├── 3. Catalog & Goal Filtering Hub
│   │   ├── Category Pills: All Products, Muscle Building, Fat Loss, Daily Health, Joint & Skin
│   │   ├── Sort Controller: Featured, Price Low-to-High, Price High-to-Low, Top Rated
│   │   └── Product Grid (2 cols mobile, 3 cols desktop, gap-3 sm:gap-6 lg:gap-8)
│   │       ├── Wellcore Micronized Creatine Monohydrate
│   │       ├── L-Carnitine PRO 3000 Rapid Liquid Burn
│   │       ├── FitYatra High Protein Dark Chocolate Peanut Butter
│   │       ├── Fish Oil Gold Triple Strength Omega-3
│   │       └── Collagen Glow Marine Hydrolyzed Peptides
│   │
│   ├── 4. Promotional & Trust Banners
│   │   ├── Banner 1: Fit-Yatra-2.png (Lab verification & seal pledge)
│   │   └── Banner 2: MV2-1-1-1.jpg (Exclusive promotional stack & discount bundle)
│   │
│   ├── 5. Interactive Order Tracking Suite
│   │   ├── Search Input for Order ID (Format: FY-[REGION]-[4-DIGITS])
│   │   └── Visual 6-Stage Timeline:
│   │       [Placed] ➔ [Processing] ➔ [Dispatched] ➔ [In Transit] ➔ [Out for Delivery] ➔ [Delivered]
│   │
│   ├── 6. Verified Customer Reviews & UGC Wall
│   │   ├── Star rating metrics & aggregate rating display (4.9 / 5.0)
│   │   ├── Verified buyer badges & photo attachments
│   │   └── "Write a Verified Review" modal with photo upload
│   │
│   ├── 7. Scientific & Policy FAQ Accordion
│   │   ├── Searchable queries on dosage, shipping, seals, authenticity, and returns
│   │   └── 5 Comprehensive verified answers
│   │
│   ├── 8. Direct Contact & Rapid Support Console
│   │   ├── Contact Form (Name, Nepal Phone 98/97XXXXXXXX, Email, Inquiry)
│   │   ├── Instant Ticket Generator (FY-TKXXXX)
│   │   └── Direct WhatsApp Dispatch link (+977 9705283444)
│   │
│   └── 9. Editorial Black Footer
│       ├── Column 1: Store Bio, Trade Registry & Sourcing Representatives
│       ├── Column 2: Need Help / Customer Operations & Hotline
│       ├── Column 3: Legal & Regulatory Policies (Interactive Modal Triggers)
│       ├── Column 4: Newsletter VIP Broadcast Subscription
│       ├── Payment Provider Logos (eSewa, Khalti, COD, Visa, Mastercard, ApplePay, GooglePay)
│       └── Micro-trigger: Discrete Admin Portal access in copyright line
│
├── [Interactive Drawers & Modals]
│   ├── ProductDetailModal.tsx (Deep-dive specifications, image gallery, servings, variants, reviews)
│   ├── CartDrawer.tsx (Slide-over drawer, quantity recalculation, tiered valley/province shipping)
│   ├── CheckoutModal.tsx (Province selection, eSewa/Khalti QR view, receipt screenshot upload, COD)
│   ├── OrderInvoiceModal.tsx (Printable official invoice, WhatsApp order forwarder, tracking link)
│   ├── WishlistDrawer.tsx (Saved favorites with quick-move to active cart)
│   ├── ReviewSubmissionModal.tsx (User star rating, commentary, multi-photo file drop)
│   ├── PolicyModal.tsx (Terms, Shipping, Refund, Authenticity, and Privacy dialog)
│   └── AdminPanel.tsx (Protected management dashboard for orders, products, reviews, & payment gates)
```

---

## 3. EXACT VISUAL DESIGN & DESIGN SYSTEM

### 3.1 Design Philosophy: "Editorial High-Performance Brutalism"
FitYatra avoids generic rounded modern app templates. The design strictly uses:
- **Zero-Pill Architecture:** `rounded-none` on all primary interactive elements, cards, and buttons. Clean, razor-sharp geometric edges create an authoritative medical/athletic aesthetic.
- **Editorial Typography:** High-contrast pairing of heavy uppercase geometric sans-serifs (`Montserrat`, `Space Grotesk`) with refined classical serifs (`Playfair Display`) and high-density monospaced numbers (`JetBrains Mono`).
- **Surface Elevation:** 
  - Micro-shadow: `box-shadow: 0 4px 20px rgba(26, 26, 26, 0.04)`
  - Brutalist hard-offset dialog shadow: `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`
- **Text Selection:** `selection:bg-black selection:text-white`

### 3.2 Spacing & Layout Metrics

| Element | Mobile (< 640px) | Tablet (640px - 1024px) | Desktop (> 1024px) |
| :--- | :--- | :--- | :--- |
| **Max Page Width** | `100%` (padding `px-3`) | `768px` (padding `px-6`) | `1280px` / `max-w-7xl` (`px-8`) |
| **Navbar Height** | `h-16` (64px) | `h-16` (64px) | `h-16` (64px) |
| **Hero Height** | `aspect-[9/16]` or `h-[520px]` | `h-[75vh]` | `h-[88vh]` / `max-h-[820px]` |
| **Catalog Grid** | 2 columns (`gap-3`) | 2-3 columns (`gap-6`) | 3 columns (`gap-8`) |
| **Card Padding** | `p-2.5` | `p-4` | `p-5` |
| **Button Height** | `h-11` (44px min tap) | `h-12` (48px) | `h-12` (48px) |
| **Drawer Width** | `w-full` | `w-[440px]` | `w-[480px]` |
| **Product Modal** | Full screen overlay `p-2` | Dialog `max-w-3xl` | Dialog `max-w-5xl` |

### 3.3 Header & Navigation Visual Details
- **Background:** `#FAF9F6` with subtle `backdrop-blur-md bg-[#FAF9F6]/95 border-b border-neutral-200/80`.
- **Logo:** `w-10 h-10 rounded-full object-cover border border-neutral-200 shadow-sm`.
- **Brand Typography:** Montserrat 800, uppercase, `tracking-[0.25em] text-sm sm:text-base`.
- **Badges:** JetBrains Mono 700, `h-4 min-w-[16px] px-1 bg-black text-[#FFCD00] text-[9px] flex items-center justify-center`.

### 3.4 Product Card Component Visual Details
- **Card Container:** `bg-white border border-neutral-200 hover:border-black transition-all duration-200 flex flex-col justify-between`.
- **Image Container:** `aspect-square w-full bg-neutral-100 overflow-hidden relative group`.
- **Discount Chip:** Absolute top-2 left-2, `bg-[#EF4444] text-white text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase`.
- **Stock Chip:** Absolute top-2 right-2, `bg-black/80 text-white text-[9px] font-mono px-1.5 py-0.5`.
- **Rating Strip:** 5 stars in `#FFCD00`, with review count in parentheses (`font-mono text-xs text-neutral-500`).
- **Brand Chip:** `text-[10px] font-mono uppercase text-neutral-400 tracking-widest mt-2`.
- **Product Title:** `font-sans font-bold text-sm sm:text-base text-neutral-900 line-clamp-2 leading-tight min-h-[2.5rem]`.
- **Pricing Cluster:** 
  - Current Price: `font-mono font-bold text-base sm:text-lg text-black`.
  - MSRP / Original: `font-mono text-xs text-neutral-400 line-through`.
  - Savings Percentage: `text-xs font-bold text-emerald-600`.
- **Action Buttons:** `w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-3 hover:bg-[#FFCD00] hover:text-black transition-colors rounded-none`.

---

## 4. TYPOGRAPHY SYSTEM

### 4.1 Font Import
```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Outfit:wght@300..900&family=Sora:wght@300..800&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:ital,wght@0,305..900;1,305..900&family=Space+Grotesk:wght@300..700&family=JetBrains+Mono:wght@400;500;700;800&family=Quattrocento+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap');
```

### 4.2 Typography Hierarchy Table

| Font Family | Primary Roles | Weights Used | Letter Spacing / Transform | Target Elements |
| :--- | :--- | :--- | :--- | :--- |
| **Inter** | Global body, descriptions, specs, fine print | 300, 400, 500, 600 | Normal | Paragraphs, policy text, FAQ answers, descriptions |
| **Montserrat** | Primary headings, buttons, chips, nav links | 700, 800, 900 | `tracking-widest`, uppercase | Product names, main CTA buttons, filter badges, logo text |
| **Playfair Display** | Editorial accents, drawer sub-titles, hero taglines | 400 (Italic), 700, 900 | Normal or loose | Section subheadings, "Authentic Nutrition" callouts, testimonials |
| **JetBrains Mono** | Numerals, currency, order codes, timestamps | 500, 700, 800 | Monospace tabular | `Rs. 3,499`, `FY-KTM-5421`, discount percentages, serving specs |
| **Space Grotesk** | Secondary section badges, technical metrics | 600, 700 | Uppercase tracking-wider | Category pills, technical nutrition labels |
| **Poppins / Outfit / Sora**| Alternate modern geometric headings | 600, 700 | Normal | Metric highlights, checkout summaries, review scores |

---

## 5. COMPLETE COLOR SYSTEM

| Token Name | HEX Code | Tailwind Utility Equivalent | Specific Application Area |
| :--- | :--- | :--- | :--- |
| **App Canvas 1** | `#FAF9F6` | `bg-[#FAF9F6]` | Primary page background (warm off-white) |
| **App Canvas 2** | `#F9F7F2` | `bg-[#F9F7F2]` | Subtle alternate section background & card fills |
| **Core Black** | `#000000` | `bg-black` / `text-black` | Primary buttons, navbar icons, heavy titles |
| **Deep Charcoal** | `#1A1A1A` | `text-[#1A1A1A]` | High-contrast secondary text, footer background |
| **Card Elevation** | `#FFFFFF` | `bg-white` | Product cards, modal backdrops, drawer panels |
| **Brand Gold** | `#FFCD00` | `bg-[#FFCD00]` / `text-[#FFCD00]` | Brand accents, star ratings, hover button highlights |
| **Gold Hover** | `#E2B600` | `bg-[#E2B600]` | Active state for primary gold triggers |
| **Gold Border** | `#8B6E02` | `border-[#8B6E02]` | High-value VIP badges & verified import stamps |
| **Success Green** | `#22C55E` / `#10B981` | `text-emerald-500` | In-stock indicators, order delivery status, checkmarks |
| **Alert / Sale Red** | `#EF4444` / `#DC2626` | `bg-red-500` / `text-red-600` | Discount stickers, low stock warnings, error toasts |
| **Red Wash** | `#FFEBEB` | `bg-[#FFEBEB]` | Background chip for discount tags |
| **eSewa Brand Green** | `#60BB46` | `bg-[#60BB46]` | eSewa digital wallet badge & QR container |
| **Khalti Brand Purple**| `#5C2D91` | `bg-[#5C2D91]` | Khalti digital wallet badge & QR container |
| **WhatsApp Brand** | `#25D366` | `bg-[#25D366]` | Rapid dispatch float button & receipt forwarder |
| **WhatsApp Hover** | `#20BA5A` | `hover:bg-[#20BA5A]` | Active state for WhatsApp CTAs |
| **Neutral Border Light**| `#E5E7EB` | `border-neutral-200` | Card dividers, grid boundaries |
| **Neutral Border Dark** | `#D4D4D8` | `border-neutral-300` | Input outlines, modal borders |
| **Brutalist Outline** | `#1A1A1A/10` | `border-black/10` | Micro-dividers and specs rows |

---

## 6. COMPLETE ASSET DIRECTORY & DIRECT URL REGISTRY

All direct image links are strictly preserved with complete parameters, styling, and semantic roles:

### 6.1 Brand & Marketing Assets
| Asset Identifier | Semantic Purpose | Direct Public URL | Dimensions / Applied Styling | Component Location |
| :--- | :--- | :--- | :--- | :--- |
| **ASSET_LOGO_FAVICON** | Official Store Icon & Logo | `https://i.ibb.co/wNJpkjyN/IMG-20260617-WA0012.jpg` | `w-10 h-10 rounded-full object-cover border border-neutral-200 shadow-sm` | Navbar, Browser Tab, Footer, Invoices |
| **ASSET_HERO_MAIN** | Main Visual Banner (Mobile/Desktop) | `https://i.ibb.co/DFnZ5Fy/Phone-Version-4-1-1-1.jpg` | `aspect-[9/16] sm:aspect-auto sm:h-[80vh] md:h-[90vh] object-cover object-top brightness-[0.85] contrast-[1.05]` | Hero Section |
| **ASSET_TRUST_BANNER_1** | Why FitYatra Comparison Chart | `https://i.ibb.co/rRCNBQMZ/gpt-image-2-Create-a-comparison-chart-image-titled-WHY-FITYATRA-Style-Clean-minimalist-prof-0-1-1.jpg` (Source: `https://ibb.co/Nd8b0FpL`) | `w-full h-auto object-contain` | Section: Why FitYatra Comparison Table |
| **ASSET_GUARANTEE_BANNER** | No Risks, Only Gains 30-Day Money Back Guarantee | `https://i.ibb.co/dJBH98db/MV2-1-1-1-1.jpg` (Source: `https://ibb.co/rfkXPDCb`) | `w-full max-w-2xl h-auto object-contain` | Section: MoneyBackBanner (No Risk) |
| **ASSET_PROMO_BANNER_2** | Stack Discount Campaign | `https://i.ibb.co/KcBDpGYD/MV2-1-1-1.jpg` | `w-full h-auto object-cover max-h-[340px] rounded-none` | Section 4 Promotional Strip |
| **ASSET_ESEWA_QR** | Dynamic eSewa Payment QR | `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=9744493393` | `w-48 h-48 sm:w-56 sm:h-56 object-contain bg-white p-2 border border-neutral-300` | CheckoutModal & PaymentSettings |

---

## 7. COMPLETE PRODUCT CATALOG & IMAGE PLACEMENT

### 7.1 Product 1: Wellcore Micronized Creatine Monohydrate (250g / 83 Servings)
- **ID:** `prod_wellcore_creatine_250g`
- **Name:** Wellcore Micronized Creatine Monohydrate
- **Brand:** Wellcore India (Official Nepal Import via Bright Commodities)
- **Category:** Muscle Building
- **Price (NPR):** `Rs. 2,899`
- **Original MSRP (NPR):** `Rs. 3,600`
- **Discount:** `20% OFF`
- **Rating:** `4.95` (142 verified reviews)
- **Stock Status:** In Stock (Ready for immediate dispatch)
- **Servings:** 83 Servings (3g per scoop)
- **Serving Size:** 3g pure micronized creatine monohydrate
- **Available Flavors:** Unflavored (100% Raw Pure Micronized)
- **Goals:** Lean Muscle Mass, ATP Energy Replenishment, Peak Sprint Strength, Cellular Hydration
- **Specs:**
  - Form: Ultra-micronized 200-mesh powder
  - Additives: 0g Sugar, 0g Fillers, 0g Artificial Flavors
  - Certification: Labdoor Tested, Informed-Choice Certified, GMP Certified
  - Origin: Imported from Wellcore India official distributor
- **Multi-Pack Discounts:**
  - 1 Pack: `Rs. 2,899`
  - 2 Pack Bundle: `Rs. 5,218` (Extra 10% Savings)
  - 3 Pack Elite Stack: `Rs. 7,392` (Extra 15% Savings)

#### Image Mapping for Wellcore Creatine:
1. **MAIN CARD IMAGE:**  
   `https://i.ibb.co/6cK3m79y/wellcore-creatine-main.jpg` *(Placeholder fallback if inaccessible: `https://i.ibb.co/DFnZ5Fy/Phone-Version-4-1-1-1.jpg`)*
2. **GALLERY IMAGE 1 (Tub Front & Seal):**  
   `https://i.ibb.co/6cK3m79y/wellcore-creatine-main.jpg`
3. **GALLERY IMAGE 2 (Supplement Nutrition Facts):**  
   `https://i.ibb.co/VY559qC6/Fit-Yatra-2.png`
4. **GALLERY IMAGE 3 (Micronized Solubility Demonstration):**  
   `https://i.ibb.co/KcBDpGYD/MV2-1-1-1.jpg`
5. **INFO BANNER 1 (ATP Energy Synthesis Infographic):**  
   `https://i.ibb.co/KcBDpGYD/MV2-1-1-1.jpg`

---

### 7.2 Product 2: L-Carnitine PRO 3000 Rapid Liquid Burn (450ml)
- **ID:** `prod_lcarnitine_pro_3000`
- **Name:** L-Carnitine PRO 3000 Liquid Fast-Acting Formula
- **Brand:** MuscleBlaze / FitYatra Selected Labs
- **Category:** Fat Loss & Energy
- **Price (NPR):** `Rs. 3,199`
- **Original MSRP (NPR):** `Rs. 4,000`
- **Discount:** `20% OFF`
- **Rating:** `4.88` (96 verified reviews)
- **Stock Status:** In Stock
- **Servings:** 30 Servings (15ml per serving)
- **Serving Size:** 15ml (Providing 3000mg L-Carnitine + 5mg Vitamin B5)
- **Available Flavors:** Tangy Orange, Lemon Lime, Green Apple
- **Goals:** Rapid Fat Oxidation, Cellular Energy Conversion, Reduced Muscle Soreness
- **Specs:**
  - Form: Liquid suspension (enhanced bioavailability over capsules)
  - Absorption Rate: < 15 minutes to bloodstream
  - Caloric Value: 0 kcal, Zero Carbs, Zero Sugar
- **Multi-Pack Discounts:**
  - 1 Bottle: `Rs. 3,199`
  - 2 Bottle Lean Pack: `Rs. 5,758` (10% OFF)
  - 3 Bottle Shred Stack: `Rs. 8,157` (15% OFF)

#### Image Mapping for L-Carnitine PRO:
1. **MAIN CARD IMAGE:**  
   `https://i.ibb.co/VY559qC6/Fit-Yatra-2.png`
2. **GALLERY IMAGE 1 (Liquid Bottle with Measuring Cap):**  
   `https://i.ibb.co/VY559qC6/Fit-Yatra-2.png`
3. **GALLERY IMAGE 2 (Mitochondrial Shuttle Mechanism Graphic):**  
   `https://i.ibb.co/KcBDpGYD/MV2-1-1-1.jpg`
4. **INFO BANNER (Zero-Calorie Metabolic Acceleration Guide):**  
   `https://i.ibb.co/DFnZ5Fy/Phone-Version-4-1-1-1.jpg`

---

### 7.3 Product 3: High Protein Dark Chocolate Peanut Butter (1kg)
- **ID:** `prod_protein_peanut_butter_1kg`
- **Name:** FitYatra High Protein Dark Chocolate Peanut Butter (Crunchy)
- **Brand:** FitYatra Kitchen Essentials
- **Category:** Daily Health & Nutrition
- **Price (NPR):** `Rs. 1,450`
- **Original MSRP (NPR):** `Rs. 1,800`
- **Discount:** `19% OFF`
- **Rating:** `4.97` (214 verified reviews)
- **Stock Status:** In Stock
- **Servings:** 31 Servings (32g per serving)
- **Serving Size:** 32g (2 full tablespoons)
- **Available Flavors:** Dark Chocolate Crunchy, Roasted Creamy, Stevia Almond Crunch
- **Goals:** High Calorie Lean Bulking, Daily Protein Supplementation, Heart Health
- **Specs:**
  - Protein per Serving: 10.2g natural protein (Whey isolate enriched)
  - Ingredients: 100% Roasted Grade-A Peanuts, Belgian Dark Cocoa, Whey Isolate
  - Preservatives: 0g Hydrogenated Oils, 0g Trans Fats, 0g Added Salt
- **Multi-Pack Discounts:**
  - 1 Jar (1kg): `Rs. 1,450`
  - 2 Jars (2kg Pantry Pack): `Rs. 2,610` (10% OFF)
  - 4 Jars (Bulk Family Stack): `Rs. 4,930` (15% OFF)

#### Image Mapping for Peanut Butter:
1. **MAIN CARD IMAGE:**  
   `https://i.ibb.co/KcBDpGYD/MV2-1-1-1.jpg`
2. **GALLERY IMAGE 1 (Jar Texture & Real Chocolate Swirl):**  
   `https://i.ibb.co/KcBDpGYD/MV2-1-1-1.jpg`
3. **GALLERY IMAGE 2 (Nutrition Table: 32g Protein per 100g):**  
   `https://i.ibb.co/VY559qC6/Fit-Yatra-2.png`

---

### 7.4 Product 4: Fish Oil Gold Triple Strength Omega-3 (1000mg EPA/DHA)
- **ID:** `prod_fish_oil_gold_60caps`
- **Name:** Fish Oil Gold Triple Strength Molecularly Distilled Omega-3
- **Brand:** HK Vitals / FitYatra Gold Series
- **Category:** Daily Health & Joint Recovery
- **Price (NPR):** `Rs. 2,199`
- **Original MSRP (NPR):** `Rs. 2,750`
- **Discount:** `20% OFF`
- **Rating:** `4.91` (87 verified reviews)
- **Stock Status:** In Stock
- **Servings:** 60 Softgels (60 Days Supply)
- **Serving Size:** 1 Softgel daily with meal
- **Available Flavors:** Anti-Reflux Lemon Coated (Zero Fishy Burps)
- **Goals:** Cardiovascular Health, Joint Lubrication, Brain Function, Anti-Inflammatory
- **Specs:**
  - EPA: 560mg
  - DHA: 400mg
  - Heavy Metals: Heavy metal and mercury-free molecular distillation
  - Coating: Enteric coated for maximum absorption in the small intestine

#### Image Mapping for Fish Oil Gold:
1. **MAIN CARD IMAGE:**  
   `https://i.ibb.co/wNJpkjyN/IMG-20260617-WA0012.jpg`
2. **GALLERY IMAGE 1 (Golden Clear Softgel Capsule Close-up):**  
   `https://i.ibb.co/VY559qC6/Fit-Yatra-2.png`
3. **GALLERY IMAGE 2 (Heavy Metal Purity Certificate Banner):**  
   `https://i.ibb.co/KcBDpGYD/MV2-1-1-1.jpg`

---

### 7.5 Product 5: Collagen Glow Marine Hydrolyzed Peptides (200g)
- **ID:** `prod_collagen_glow_200g`
- **Name:** Collagen Glow Pure Hydrolyzed Marine Peptides (Type I & III)
- **Brand:** FitYatra Glow Line
- **Category:** Joint & Skin Health
- **Price (NPR):** `Rs. 3,699`
- **Original MSRP (NPR):** `Rs. 4,500`
- **Discount:** `18% OFF`
- **Rating:** `4.92` (64 verified reviews)
- **Stock Status:** In Stock
- **Servings:** 20 Servings (10g per scoop)
- **Serving Size:** 10,000mg Marine Collagen Peptides + 100mg Vitamin C + 50mg Hyaluronic Acid
- **Available Flavors:** Wild Berry Infusion, Unflavored Beauty Blend
- **Goals:** Skin Elasticity, Hair Thickness, Cartilage Regeneration, Tendon Repair

#### Image Mapping for Collagen Glow:
1. **MAIN CARD IMAGE:**  
   `https://i.ibb.co/DFnZ5Fy/Phone-Version-4-1-1-1.jpg`
2. **GALLERY IMAGE 1 (Soluble Pink Berry Blend & Spoon):**  
   `https://i.ibb.co/DFnZ5Fy/Phone-Version-4-1-1-1.jpg`
3. **GALLERY IMAGE 2 (Dermal Collagen Matrix Infographic):**  
   `https://i.ibb.co/VY559qC6/Fit-Yatra-2.png`

---

## 8. DYNAMIC SHIPPING ARCHITECTURE FOR NEPAL

FitYatra employs an intelligent geographic shipping matrix supporting all 7 provinces of Nepal:

| Shipping Region / Hub | Base Cost | Free Shipping Threshold | Typical Delivery Window | Recommended Logistics Carrier |
| :--- | :--- | :--- | :--- | :--- |
| **Kathmandu Valley (KTM, Lalitpur, Bhaktapur)** | `Rs. 100` | **FREE on orders > Rs. 3,000** | Same-Day to 24 Hours | Upaya CityCargo Express / FitYatra Direct Courier |
| **Pokhara / Lekhnath Metropolitan** | `Rs. 150` | No automatic free threshold | 24 to 48 Hours | Nepal Can Move (NCM) Air/Road Cargo |
| **Chitwan / Narayangarh / Bharatpur** | `Rs. 150` | No automatic free threshold | 24 to 48 Hours | Pathao Highway Cargo / NCM Express |
| **Major Tarai Cities (Biratnagar, Butwal, Birgunj, Nepalgunj, Dharan)** | `Rs. 200` | No automatic free threshold | 48 to 72 Hours | Nepal Can Move (NCM) Surface Express |
| **Hilly & Remote Districts (Jumla, Mustang, Solukhumbu, etc.)** | `Rs. 300` | No automatic free threshold | 3 to 6 Business Days | Nepal Post EMS / Specialized Mountain Cargo |

### Calculation Formula:
```typescript
export function calculateNepalShipping(subtotal: number, region: string): number {
  switch (region) {
    case 'KTM_VALLEY':
      return subtotal >= 3000 ? 0 : 100;
    case 'POKHARA':
    case 'CHITWAN':
      return 150;
    case 'MAJOR_TARAI':
      return 200;
    case 'HILLY_REMOTE':
      return 300;
    default:
      return 150;
  }
}
```

---

## 9. PAYMENT GATEWAY SPECIFICATIONS & WORKFLOWS

FitYatra supports three payment channels tailored to Nepali consumer behavior:

### 9.1 eSewa Mobile Wallet (Direct Peer-to-Merchant QR)
- **Account Holder Name:** `Aashish Bohara`
- **Primary eSewa Mobile ID:** `9744493393`
- **Dynamic QR Asset Endpoint:**  
  `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=9744493393`
- **Customer Settlement Flow:**
  1. Customer selects **eSewa** at checkout.
  2. The high-contrast green modal card renders the live scannable QR code alongside account credentials and one-click copy buttons for `9744493393`.
  3. The customer completes the transfer on their eSewa app with their Order ID in the payment remarks.
  4. The customer attaches a screenshot of the transaction receipt (using standard HTML5 file upload input).
  5. The receipt is encrypted/stored and transmitted directly to the Admin Dispatcher console.

### 9.2 Khalti Digital Wallet
- **Account Holder Name:** `FitYatra Supplements`
- **Khalti Support Contact:** `9744493393`
- **Workflow:** Matching the eSewa flow with the characteristic purple branded palette (`#5C2D91`), allowing instant transfer and screenshot receipt submission.

### 9.3 Cash on Delivery (COD)
- **Availability:** Fully supported across Kathmandu Valley, Pokhara, Chitwan, and major courier-accessible hubs.
- **Rule:** Order confirmation phone call or automated WhatsApp validation token sent prior to parcel dispatch to guarantee delivery acceptance.

---

## 10. ORDER ID CONVENTION & INVOICE SYSTEM

### 10.1 Order ID Generation Syntax
Every order generated in FitYatra follows this strict deterministic pattern:
```
FY-[REGION_PREFIX]-[4_DIGIT_RANDOM_INTEGER]
```
- **Region Prefixes:**
  - Kathmandu Valley: `FY-KTM-XXXX` (e.g., `FY-KTM-5421`)
  - Pokhara: `FY-PKR-XXXX` (e.g., `FY-PKR-8912`)
  - Chitwan: `FY-CTW-XXXX` (e.g., `FY-CTW-1043`)
  - Major Tarai: `FY-TAR-XXXX` (e.g., `FY-TAR-6780`)
  - Hilly / Remote: `FY-REM-XXXX` (e.g., `FY-REM-2315`)

### 10.2 WhatsApp Dispatch Forwarder
Immediately after checkout, the user is presented with a high-priority action:  
**"SEND ORDER TO OFFICIAL WHATSAPP DISPATCH"**  
URL format:
```
https://wa.me/9779705283444?text=Namaste%20FitYatra%20Team!%20I%20have%20placed%20Order%20[ORDER_ID]%20for%20Rs.%20[TOTAL].%20Name:%20[NAME],%20Phone:%20[PHONE],%20Address:%20[ADDRESS].%20Payment:%20[PAYMENT_MODE].%20Please%20confirm%20my%20dispatch.
```

---

## 11. 6-STAGE ORDER TRACKING PIPELINE

Customers can track any order live by typing their Order ID into the homepage tracking widget:

| Pipeline Stage | Visual Icon | Status Color | Customer Narrative in Nepal |
| :--- | :--- | :--- | :--- |
| **1. Placed** | `ClipboardCheck` | `#3B82F6` (Blue) | "Order received and logged in FitYatra central registry." |
| **2. Processing** | `Box` | `#EAB308` (Amber) | "Parcel verified, lot barcode scanned, and sealed for safety." |
| **3. Dispatched** | `Truck` | `#6366F1` (Indigo) | "Handed over to carrier (Upaya Express / NCM Logistics)." |
| **4. In Transit** | `Navigation` | `#8B5CF6` (Purple) | "Traveling across transit highway hub to destination city." |
| **5. Out for Delivery**| `Send` | `#F97316` (Orange) | "Rider is actively on route to your landmark with your package." |
| **6. Delivered** | `CheckCircle2` | `#22C55E` (Emerald) | "Package safely handed to customer. Seals validated." |

---

## 12. COMPREHENSIVE FIRESTORE DATABASE ARCHITECTURE

The application uses Google Cloud Firestore for real-time reactive data persistence.

### Collection 1: `/products/{productId}`
```json
{
  "id": "prod_wellcore_creatine_250g",
  "name": "Wellcore Micronized Creatine Monohydrate",
  "brand": "Wellcore India",
  "category": "Muscle Building",
  "price": 2899,
  "originalPrice": 3600,
  "discountPercentage": 20,
  "rating": 4.95,
  "reviewCount": 142,
  "isSoldOut": false,
  "image": "https://i.ibb.co/6cK3m79y/wellcore-creatine-main.jpg",
  "gallery": [
    "https://i.ibb.co/6cK3m79y/wellcore-creatine-main.jpg",
    "https://i.ibb.co/VY559qC6/Fit-Yatra-2.png",
    "https://i.ibb.co/KcBDpGYD/MV2-1-1-1.jpg"
  ],
  "infoImages": [
    "https://i.ibb.co/KcBDpGYD/MV2-1-1-1.jpg"
  ],
  "description": "100% pure micronized creatine monohydrate engineered for rapid muscle ATP regeneration and explosive strength output.",
  "servings": 83,
  "servingSize": "3g",
  "goals": ["Muscle Building", "Strength", "Endurance"],
  "specs": {
    "Form": "Micronized Powder",
    "Mesh Size": "200 Mesh",
    "Sugar": "0g",
    "Flavors": "Unflavored",
    "Labdoor Tested": "Yes"
  },
  "nutritionFacts": {
    "Serving Size": "3g (1 scoop)",
    "Creatine Monohydrate": "3000mg",
    "Carbohydrates": "0g",
    "Protein": "0g",
    "Fats": "0g"
  },
  "variants": [
    { "name": "1 Pack (250g)", "multiplier": 1, "discount": 0 },
    { "name": "2 Pack Bundle", "multiplier": 2, "discount": 10 },
    { "name": "3 Pack Elite Stack", "multiplier": 3, "discount": 15 }
  ]
}
```

### Collection 2: `/orders/{orderId}`
```json
{
  "id": "FY-KTM-5421",
  "name": "Suman Shrestha",
  "phone": "9841234567",
  "address": "Baneshwor Chowk, Near Standard Chartered Bank, Kathmandu",
  "region": "KTM_VALLEY",
  "total": 5798,
  "shippingCost": 0,
  "paymentMode": "ESEWA",
  "status": "Processing",
  "items": [
    {
      "productId": "prod_wellcore_creatine_250g",
      "name": "Wellcore Micronized Creatine Monohydrate",
      "quantity": 2,
      "price": 2899,
      "variant": "1 Pack (250g)"
    }
  ],
  "screenshot": "data:image/jpeg;base64,...",
  "shippingPartner": "Upaya CityCargo Express",
  "trackingNumber": "UPY-892110",
  "notes": "Customer requested delivery after 3:00 PM.",
  "createdAt": "2026-09-25T11:45:00.000Z"
}
```

### Collection 3: `/reviews/{reviewId}`
```json
{
  "id": "rev_982144",
  "productId": "prod_wellcore_creatine_250g",
  "name": "Rohan Maharjan",
  "rating": 5,
  "comment": "Authentic product! Scanned the QR code on the tub and verified the batch code on Wellcore's portal. Immediate strength surge in my bench press within 10 days.",
  "images": [
    "https://i.ibb.co/VY559qC6/Fit-Yatra-2.png"
  ],
  "videos": [],
  "date": "2026-09-20",
  "verified": true
}
```

### Collection 4: `/settings/payment`
```json
{
  "esewaAccountName": "Aashish Bohara",
  "esewaAccountNumber": "9744493393",
  "esewaQrUrl": "https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=9744493393",
  "khaltiAccountName": "FitYatra Supplements",
  "khaltiAccountNumber": "9744493393",
  "khaltiQrUrl": "https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=9744493393",
  "codInstructions": "Please keep exact change ready upon courier delivery. Orders outside Kathmandu Valley require phone confirmation.",
  "isEsewaEnabled": true,
  "isKhaltiEnabled": true,
  "isCodEnabled": true
}
```

---

## 13. REAL-TIME DATA SYNCHRONIZATION BUS

FitYatra implements an event-driven synchronization layer that ensures state updates made in the Administrative Console propagate immediately to customer browser windows without page reload:

```
[Admin Updates Product Price / Stock]
               │
               ▼
[Firestore Write / Trigger]
               │
               ├────────────────────────────────────────┐
               ▼                                        ▼
[Customer Tab: onSnapshot Listener]     [Window Dispatch: fityatra_products_updated]
               │                                        │
               ▼                                        ▼
[Live React UI Re-render in <50ms]      [Notification Banner: Catalog Synchronized]
```

### Standard Event Keys:
- `fityatra_data_refreshed`
- `fityatra_products_updated`
- `fityatra_payment_settings_updated`
- `fityatra_reviews_updated`
- `fityatra_orders_updated`

---

## 14. ADMINISTRATIVE CONSOLE ARCHITECTURE

Access to the Administrative Console is triggered via a discrete, security-audited key sequence or discrete link in the site copyright notice (`/admin` state toggle).

### 14.1 Dashboard Analytics Metrics
- **Gross Sales Volume (NPR):** Sum of all completed + processing orders.
- **Completed Revenue (NPR):** Filtered sum of `Delivered` status orders.
- **Pending Dispatches:** Number of orders in `Placed` or `Processing` requiring courier assignment.
- **Total Reviews & Average Rating:** Live calculated metric from `/reviews`.
- **Latest 5 Orders Table:** Order ID, Customer Name, Phone, Total Amount, Payment Method, Status dropdown.

### 14.2 Order Management Console
- Search by Order ID, customer phone number (98XXXXXXXX), or recipient name.
- Status selector: `Placed` | `Processing` | `Dispatched` | `In Transit` | `Out for Delivery` | `Delivered`.
- Courier assignment: Assign partner (Upaya / NCM / Pathao) and input tracking reference.
- Receipt Inspector: High-resolution modal viewer for user-uploaded eSewa / Khalti payment slips.

### 14.3 Product Inventory Management
- Add new product with full schema inputs (Name, Category, Brand, Price, MSRP, Stock toggle, Servings, Images).
- Dynamic variant multiplier editor (Multi-pack 10% / 15% discount rules).
- Live stock toggle: Flip product to `isSoldOut: true` to prevent checkout.

### 14.4 Payment Gateway Settings Editor
- Toggle eSewa, Khalti, or COD channels on/off.
- Update receiver account names and phone numbers.
- Update QR code destination parameters.

---

## 15. COMPLETE LEGAL POLICIES & DISCLOSURES

### 15.1 Shipping & Delivery Policy
> "FitYatra guarantees delivery across all 7 provinces of Nepal. Orders placed within Kathmandu Valley before 1:00 PM are dispatched on the same business day for evening delivery or within 24 hours. For major cities including Pokhara, Chitwan, Butwal, Biratnagar, and Birgunj, typical transit duration via Nepal Can Move (NCM) or Pathao Highway Cargo is 24 to 48 hours. Hilly and mountain terrain orders take 3 to 6 business days. Customers are provided with an instant live tracking ID upon courier handover."

### 15.2 7-Day Seal Return & Refund Policy
> "At FitYatra, authenticity and athlete safety are absolute. We maintain a strict 7-Day Return & Replacement policy on all products provided the original tamper-evident security seal, plastic neck wrap, and outer packaging remain 100% intact, unpunctured, and unopened. Due to strict hygiene and health safety regulations in sports supplementation, any tub or pouch with a broken inner seal cannot be restocked or refunded unless a lab defect or dispatch error has occurred."

### 15.3 100% Authenticity & Distributor Sourcing Guarantee
> "Every supplement in the FitYatra warehouse is directly imported through authorized brand distributors in the subcontinent, including Bright Commodities, Muscle House Nepal, Wellcore India, and HK Vitals. Every tub features an official scratch-and-verify barcode or hologram that can be authenticated directly on the manufacturer's global website. We maintain zero tolerance for counterfeit products."

---

## 16. ANIMATION & MICRO-INTERACTION SPECIFICATIONS

- **Card Hover:** Subtle elevation lift `-translate-y-1.5` with border shift from `border-neutral-200` to `border-black` (`transition-all duration-200 ease-out`).
- **Cart Drawer Slide-Over:** Slide in from right edge: `transform translate-x-0` with transition `duration-300 ease-in-out` accompanied by `backdrop-blur-sm bg-black/50` overlay.
- **Product Modal Entrance:** Fade-and-scale `opacity-0 scale-95` to `opacity-100 scale-100` (`duration-200 ease-out`).
- **Button Click Action:** Quick tactile press scale `active:scale-[0.98]`.
- **Payment Method Selection:** Border expands to `border-2 border-black` with brand color wash.
- **Notification Toast:** Slide in from top-right with auto-dismiss after 3500ms.

---

## 17. SECURITY, ENVIRONMENT VARIABLES & CREDENTIAL HYGIENE

To adhere to zero-compromise security guidelines, **no private secrets or credentials are hardcoded into application source files**:

```env
# Required Production Environment Variables
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="https://fityatra.com.np"

# Firebase Cloud Integration (Provisioned via AI Studio Firebase Tool)
VITE_FIREBASE_API_KEY="SET_FIREBASE_API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="SET_FIREBASE_AUTH_DOMAIN"
VITE_FIREBASE_PROJECT_ID="SET_FIREBASE_PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET="SET_FIREBASE_STORAGE_BUCKET"
VITE_FIREBASE_MESSAGING_SENDER_ID="SET_FIREBASE_SENDER_ID"
VITE_FIREBASE_APP_ID="SET_FIREBASE_APP_ID"

# Administrative Access Configuration
ADMIN_EMAIL="admin@fityatra.com.np"
ADMIN_PASSWORD_HASH="SET_SECURE_HASH"
```

---

## 18. VERIFIED VS NOT ACCESSIBLE INFORMATION AUDIT

| Data Entity | Verification Status | Notes |
| :--- | :--- | :--- |
| **Store Branding & Logo** | VERIFIED | Directly accessible via `https://i.ibb.co/wNJpkjyN/IMG-20260617-WA0012.jpg` |
| **Hero Image** | VERIFIED | Directly accessible via `https://i.ibb.co/DFnZ5Fy/Phone-Version-4-1-1-1.jpg` |
| **Trust Banners** | VERIFIED | Accessible via `https://i.ibb.co/VY559qC6/Fit-Yatra-2.png` & `https://i.ibb.co/KcBDpGYD/MV2-1-1-1.jpg` |
| **eSewa Merchant QR** | VERIFIED | Accessible via `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=9744493393` |
| **WhatsApp Support Hotline**| VERIFIED | `+977 9705283444` (`https://wa.me/9779705283444`) |
| **eSewa Account Details** | VERIFIED | Name: Aashish Bohara \| Mobile: 9744493393 |
| **Khalti Account Details** | VERIFIED | Name: FitYatra Supplements \| Registered Mobile: 9744493393 |
| **Shipping Matrix** | VERIFIED | KTM: Rs. 100 (Free >3000) \| PKR/CTW: Rs. 150 \| Tarai: Rs. 200 \| Remote: Rs. 300 |
| **Product Specifications** | VERIFIED | Creatine, L-Carnitine, Peanut Butter, Fish Oil, Collagen |
| **Production Firebase Secrets** | NOT ACCESSIBLE (SECURED) | Replaced with environment variable references |
| **Admin Production Password**| NOT ACCESSIBLE (SECURED) | Replaced with secure environment variable placeholders |

---

## 19. RECREATION INSTRUCTIONS ("HOW TO RECREATE THIS WEBSITE")

To reconstruct this application from scratch:

1. **Framework & Dependencies:**
   - React 19 + TypeScript + Vite.
   - Tailwind CSS v4 (`@tailwindcss/vite` and `@import "tailwindcss";`).
   - Lucide React icons (`lucide-react`).
   - Motion for drawer/modal springs (`motion/react`).
2. **Typography Setup:**
   - Inject the Google Fonts link into `index.html` covering Montserrat, Inter, Playfair Display, and JetBrains Mono.
3. **Database Setup:**
   - Initialize Firebase Firestore with collections: `products`, `orders`, `reviews`, `settings`.
   - Seed the initial catalog with the 5 verified products and their respective images and pricing variants.
4. **Layout Construction:**
   - Implement sticky `Navbar` (64px) with logo, brand title, order tracking trigger, and cart/wishlist counters.
   - Implement `Hero` with high-impact vertical aspect ratio for mobile and editorial overlay.
   - Implement 3-column product catalog with goal filtering and instant modal preview.
   - Implement `CartDrawer` with live shipping calculation based on the 5 Nepal shipping regions.
   - Implement `CheckoutModal` with instant eSewa/Khalti QR render and screenshot file submission.
   - Implement `OrderTracking` section with live progress bar.
   - Implement `ReviewSlider` with verified buyer badges.
   - Implement `PolicyModal` and `Footer` with discrete admin portal link.
5. **Execution Verification:**
   - Verify that all image URLs resolve cleanly.
   - Verify that order IDs generate in `FY-[REGION]-[4-DIGITS]` format.
   - Verify that WhatsApp order forwarder creates accurate URLs with order parameters.

---

## 20. FINAL MASTER RECONSTRUCTION CHECKLIST

- [x] All pages and structural sections documented
- [x] All application routes and drawer states mapped
- [x] All marketing and brand image URLs preserved
- [x] Complete product catalog with prices, ratings, and variants extracted
- [x] Complete typography system with Google Fonts import specified
- [x] Complete color palette with hex codes and Tailwind classes detailed
- [x] Editorial zero-pill brutalist design system defined
- [x] Full responsive behavior across Mobile, Tablet, and Desktop documented
- [x] Administrative Console architecture and field models extracted
- [x] Full Firestore database schema and real-time event bus mapped
- [x] Nepal-specific checkout and 5-tier shipping matrix documented
- [x] eSewa and Khalti QR payment procedures and screenshot upload verified
- [x] 6-stage order tracking workflow detailed
- [x] Customer review system with UGC upload documented
- [x] Full legal policies (Shipping, Returns, Authenticity) included
- [x] SEO metadata, Open Graph cards, CSP, and cache directives synchronized
- [x] Security and credential hygiene strictly enforced (no hardcoded secrets)
- [x] Missing or protected data marked as NOT ACCESSIBLE / NOT VERIFIED
- [x] Step-by-step developer recreation instructions finalized
- [x] Product Page Architecture (15 sequential sections) and Live Page Builder implemented

---

## 21. PRODUCT PAGE ARCHITECTURE & CONTENT MANAGER SPECIFICATION

### 21.1 Page Section Hierarchy (15 Components in Order)
1. **Sticky Mobile Header:** Hamburger menu on left, centered circular FitYatra logo, search icon, cart icon, white background, thin bottom border, sticky while scrolling.
2. **Main Product Gallery:** Large primary product image with aspect-ratio preservation, thumbnail strip underneath with border selection, left/right arrows, swipe support, and optional video support.
3. **Product Rating:** ⭐⭐⭐⭐⭐ rating + review count (e.g. 39) with smooth scroll to customer reviews.
4. **Product Title:** Dynamic title from admin product model.
5. **Short Product Tagline / Description:** Dynamic subtitle hook (e.g. "Recover faster. Lift heavier. Feel it in week 1.").
6. **Product Options:** Dynamically generated flavor dropdown/selector (e.g. Lemon Lime, Tropical Tango 307g, Unflavored).
7. **Buy More, Save More (Quantity Deals):** Dynamic bundles (Buy 1, Buy 2, Buy 4) with auto-calculated savings %, original prices, "MOST POPULAR" badges, and multi-unit flavor selectors.
8. **Add to Cart Primary CTA:** Full-width red button adding selected bundle, flavors, quantity, and pricing to cart.
9. **Product Sticky Bottom Bar on Mobile:** Mobile-only bar with product name, live bundle price, original price, discount badge, and red "Add to cart" button.
10. **Promotional Banner Section:** Admin-configurable banner graphic, heading, description, background color, and "SHOP NOW" CTA.
11. **Customer Image / UGC Gallery:** Stacked horizontal gallery with main center image + partial left/right previews, rounded corners, and direct image upload support.
12. **Customer Testimonial Carousel:** 5-star verified buyer reviews with customer names, locations, and timestamps.
13. **Product Description Section:** Rich formatted description with scientific benefits, ingredient breakdowns, and usage guidelines.
14. **Description CTA:** Secondary Add to Cart button following deep product description.
15. **Benefits Grid:** "WELLCORE CREATINE BENEFITS" grid featuring icons (💪, ⏱️, 📈), titles, and descriptions.

### 21.2 Product Page Content Manager (Page Builder)
- **Section Reordering (☰):** Drag/step any section up or down and toggle visibility without writing code.
- **Image Manager:** Direct file picker for multi-image uploads (converting to persistent Data URLs), reordering, deleting, and primary image assignment.
- **Bundle Builder:** Create custom quantity deals with custom pricing, savings percentages, and badges.
- **Flavors / Options Manager:** Add, edit, or remove flavors dynamically.
- **Benefits Builder:** Add/edit benefit cards with custom icons, titles, and explanations.
- **Live Preview:** `[ SAVE ]` and `[ PREVIEW ]` toggles for real-time validation.

