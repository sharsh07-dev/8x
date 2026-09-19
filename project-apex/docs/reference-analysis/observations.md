# Reference Analysis: Amazon.com Observations

## 1. Homepage
- **Layout**: Dense information architecture. Heavy use of horizontal scrolling carousels for products and categories.
- **Navigation**: Prominent search bar at the top center. Hamburger menu for categories on the left. Account and cart on the top right.
- **Behavior**: The page dynamically updates based on user history.
- **Responsive**: On mobile, the search bar takes full width, and navigation moves to a bottom bar or simplified hamburger menu.
- **Implementation Notes**: For Project Apex, we need a prominent search bar, a hero banner, and at least two horizontal scrollable product carousels (e.g., "Trending", "Recommended").

## 2. Search
- **Search suggestions**: Dropdown appears immediately upon typing, showing suggested queries and categories.
- **Results**: Grid layout on desktop, list layout on mobile. Sidebar contains extensive filtering options (Prime, brand, price, reviews).
- **Sorting**: Dropdown to sort by relevance, price, reviews.
- **Implementation Notes**: Start with a simple grid view for search results. Filters can be simplified to price range and category for the MVP.

## 3. Product Details
- **Images**: Large image gallery on the left (desktop) with zoom functionality.
- **Pricing & Actions**: Right sidebar (desktop) containing price, availability, "Add to Cart", and "Buy Now" buttons.
- **Information**: Middle section contains title, ratings, specifications, and variations (size/color).
- **Implementation Notes**: Ensure clear layout separating images, core details, and the purchase call-to-action (CTA). 

## 4. Cart
- **Behavior**: Clicking "Add to Cart" often opens a side drawer or redirects to a confirmation page with "Proceed to checkout".
- **Cart Page**: Lists items with quantity selectors, "Delete", and "Save for later" options. Subtotal is clearly visible on the right.
- **Implementation Notes**: A side-drawer cart is modern and provides good UX. We should implement a responsive side cart that shows current items and subtotal.

## 5. Checkout
- **Layout**: Simplified header with no search bar to prevent distractions.
- **Steps**: Address selection -> Payment method -> Order review.
- **Implementation Notes**: A single-page accordion-style checkout or a simple multi-step form is necessary. We need mock address and payment states.

## 6. Account & Orders
- **Sign-in**: Standard email/password flow with OTP options.
- **Orders**: List of past orders with status, tracking links, and "Buy it again" buttons.
- **Implementation Notes**: Implement a basic authenticated state showing a mock order history.
