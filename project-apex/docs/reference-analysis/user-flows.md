# Reference Analysis: User Flows

## 1. Product Discovery Flow
1. **Entry**: User lands on Homepage.
2. **Action**: User types query into search bar and submits.
3. **State**: Search Results Page loads.
4. **Action**: User clicks on a product card.
5. **End State**: Product Details Page (PDP) loads.

## 2. Purchase Flow
1. **Entry**: User is on Product Details Page.
2. **Action**: User selects options (size/color) and clicks "Add to Cart".
3. **State**: Cart confirmation modal/drawer appears or page redirects to Cart.
4. **Action**: User clicks "Proceed to checkout".
5. **State**: Checkout Page loads (Authentication may be required here).
6. **Action**: User confirms address and payment details, then clicks "Place your order".
7. **End State**: Order Confirmation Page loads.

## 3. Account Flow
1. **Entry**: User clicks "Account & Lists" in header.
2. **Action**: User enters credentials.
3. **State**: Account Dashboard loads.
4. **Action**: User clicks "Your Orders".
5. **End State**: Order History Page loads, showing past purchases.
