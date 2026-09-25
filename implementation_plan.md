# FoodieConnect – Location-Based Food Delivery Application Plan

FoodieConnect is a full-stack MERN application connecting hungry customers with restaurants based on real geographical delivery zones. Customers only see restaurants that deliver to their location (customer distance $\le$ restaurant delivery radius). Orders route strictly to the matching restaurant's admin, who prepares the food and assigns a local delivery agent.

Per the user's explicit directive: **Tailwind CSS will NOT be used**. Instead, we will craft pure, modern vanilla CSS with CSS variables, smooth animations, glassmorphism, responsive grid/flex layouts, vibrant food-themed color palettes, interactive hover states, and clean typography.

---

## User Review Required

> [!IMPORTANT]
> - **Styling Strategy**: No Tailwind CSS. We will build a modular, high-polish CSS design system (`index.css`, `App.css`, component-specific styles, layout grids, keyframe animations, mobile responsiveness breakpoints).
> - **Map & Geocoding**: We will use OpenStreetMap tiles with Leaflet and Nominatim reverse/forward geocoding for the interactive address picker and delivery radius visualization. This requires **no paid API keys** and provides instant point-and-click coordinates as well as address lookup.
> - **Seed Data**: A complete database seeder (`server/seed.js`) will populate demo accounts (Super Admin, Restaurant Admins in Gadag and Hubli, Delivery Agents, Customers) along with realistic restaurants, menus, and coordinates so the application is immediately testable and showcase-ready.

---

## Architecture & System Design

### Tech Stack
- **Backend**: Node.js, Express.js, MongoDB (Mongoose with `2dsphere` indexes), JWT (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv`.
- **Frontend**: React.js (Vite), React Router v6, Axios, Leaflet & React-Leaflet (or lightweight custom Leaflet wrapper), Lucide-React icons, Pure Vanilla CSS (Variables, Flexbox/Grid, Animations, Glassmorphism).
- **Database**: Local MongoDB service running on `localhost:27017/foodieconnect`.

### Geographical Location Flow
```
Customer registers / enters location (e.g., Station Road, Gadag)
               │
               ▼
Nominatim Geocoding / Interactive Leaflet Pin
               │
               ▼
[Longitude, Latitude] stored as GeoJSON Point
               │
               ▼
Backend /api/restaurants/nearby receives (lat, lng)
               │
               ▼
Calculates distance d = Haversine(customer, restaurant)
               │
               ▼
Filter: Is d <= restaurant.deliveryRadius?
     ├── Yes ➔ Display Restaurant Card with calculated distance & delivery time
     └── No  ➔ Exclude from listing
```

---

## Proposed Changes

### 1. Project Initialization & Structure
We will structure the workspace into `server/` and `client/`:

```
FoodieConnect/
├── server/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── restaurantController.js
│   │   ├── foodController.js
│   │   ├── orderController.js
│   │   ├── deliveryController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Restaurant.js
│   │   ├── Food.js
│   │   ├── Order.js
│   │   └── DeliveryAgent.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── restaurantRoutes.js
│   │   ├── foodRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── deliveryRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   ├── distanceCalculator.js
│   │   └── geocoder.js
│   ├── seed.js
│   ├── server.js
│   └── package.json
└── client/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── RestaurantCard.jsx
    │   │   ├── FoodCard.jsx
    │   │   ├── CartDrawer.jsx
    │   │   ├── LocationModal.jsx
    │   │   ├── MapPicker.jsx
    │   │   ├── OrderStatusTracker.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   ├── LocationContext.jsx
    │   │   └── CartContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── RestaurantDetails.jsx
    │   │   ├── Cart.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── MyOrders.jsx
    │   │   ├── OrderDetails.jsx
    │   │   ├── Profile.jsx
    │   │   ├── restaurant/
    │   │   │   ├── RestaurantDashboard.jsx
    │   │   │   ├── MenuManagement.jsx
    │   │   │   ├── RestaurantOrders.jsx
    │   │   │   └── RestaurantProfile.jsx
    │   │   ├── delivery/
    │   │   │   └── DeliveryDashboard.jsx
    │   │   └── admin/
    │   │       ├── SuperAdminDashboard.jsx
    │   │       ├── ManageRestaurants.jsx
    │   │       └── ManageUsers.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── styles/
    │   │   ├── index.css
    │   │   ├── App.css
    │   │   ├── navbar.css
    │   │   ├── cards.css
    │   │   ├── forms.css
    │   │   ├── modal.css
    │   │   ├── dashboard.css
    │   │   └── tracker.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

### 2. Backend Implementation Details

#### [NEW] Database Models
- `User.js`: `name`, `email`, `phone`, `password`, `role` ('customer' | 'restaurantAdmin' | 'deliveryAgent' | 'superAdmin'), `addresses` (array of labeled locations with `house`, `area`, `city`, `pincode`, GeoJSON Point), `isBlocked`.
- `Restaurant.js`: `name`, `description`, `email`, `phone`, `cuisine`, `image`, `address`, `city`, `area`, `state`, `pincode`, `location` (GeoJSON `Point` with `2dsphere` index), `deliveryRadius` (in km), `deliveryFee`, `minOrderAmount`, `openingTime`, `closingTime`, `isOpen`, `isApproved`, `admin` (ref to User).
- `Food.js`: `restaurant` (ref Restaurant), `name`, `description`, `price`, `category`, `image`, `isVegetarian`, `isAvailable`.
- `Order.js`: `customer` (ref User), `restaurant` (ref Restaurant), `items` (array with snapshot of food title, price, qty), `deliveryAddress`, `deliveryLocation`, `subtotal`, `deliveryFee`, `tax`, `discount`, `totalAmount`, `paymentMethod` ('COD' | 'ONLINE'), `paymentStatus`, `orderStatus` ('Pending' | 'Confirmed' | 'Preparing' | 'Ready for Pickup' | 'Assigned to Delivery Agent' | 'Picked Up' | 'Out for Delivery' | 'Delivered' | 'Cancelled'), `deliveryAgent` (ref User/DeliveryAgent), `statusTimeline`.
- `DeliveryAgent.js`: `user` (ref User), `name`, `email`, `phone`, `restaurant` (optional ref), `serviceArea`, `currentLocation`, `isAvailable`.

#### [NEW] Business Logic & APIs
- **Distance & Geocoding**:
  - `distanceCalculator.js`: Haversine formula yielding distance in km between two lat/lng coordinates.
  - Nearby restaurant endpoint (`GET /api/restaurants/nearby?lat=...&lng=...&search=...&cuisine=...`):
    - Fetches approved and open restaurants.
    - Calculates exact distance from customer.
    - Filters: `distance <= restaurant.deliveryRadius`.
    - Returns restaurants with calculated distance & delivery estimate.
- **Cart Restriction & Verification**:
  - Single-restaurant cart validation in backend checkout (`POST /api/orders`).
  - Re-verifies food existence, live pricing, and that the chosen delivery address is within delivery radius before order creation.
- **Order Routing**:
  - `GET /api/orders/restaurant`: Restaurant Admins only see orders placed for their own restaurant.
  - `GET /api/orders/delivery`: Delivery agents only see orders assigned to them in their service region.
  - Super Admin sees all orders with system metrics.

---

### 3. Frontend Implementation Details

#### Pure CSS Design System (No Tailwind)
- Modern design with CSS variables (`--primary: #ff5722`, `--primary-hover: #f4511e`, `--bg-dark: #0f172a`, `--surface: #ffffff`, `--text-primary: #1e293b`, `--text-muted: #64748b`, `--accent-green: #10b981`, `--border: #e2e8f0`, `--radius-md: 12px`, `--radius-lg: 16px`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`).
- Interactive animations:
  - Bounce & fade-in keyframes for cards.
  - Pulse dot for live delivery tracker status.
  - Hover zoom on food and restaurant cards.
  - Sleek modal backdrops with `backdrop-filter: blur(6px)`.
  - Mobile hamburger drawer with slide-in animation.
  - Responsive media queries (`max-width: 1024px`, `768px`, `480px`).

#### Key Pages & Features
1. **Location Selection Flow**:
   - Prominent header indicator: `📍 Delivering to: [Location] [Change]`.
   - Location Selector Modal:
     - Search input with address auto-lookup.
     - "Use My Current Location" button (browser Geolocation).
     - Interactive Leaflet pin-drop map.
     - Quick select from saved user addresses (Home, Office, College).
2. **Browse & Filter**:
   - Categorized cuisines, veg-only filter, rating filter, search bar.
   - Filtered restaurant cards showing photo, distance in km, delivery time, rating, min order, and delivery fee.
3. **Restaurant Menu & Cart**:
   - Menu items organized by category with veg/non-veg icons.
   - Add to cart with quantity increment/decrement.
   - Conflicting restaurant alert modal: "Your cart contains items from [Restaurant A]. Clear cart and start new order from [Restaurant B]?"
4. **Checkout & Cash on Delivery**:
   - Address verification against restaurant radius.
   - Breakdown of subtotal, 5% tax, delivery fee, grand total.
   - COD order placement with instant success redirect.
5. **Real-Time Order Tracking**:
   - Step-by-step progress timeline visualizer.
   - Delivery agent details and restaurant pickup info.
6. **Role Dashboards**:
   - **Restaurant Admin**: Live incoming order board with status transition buttons (Accept -> Prepare -> Assign Agent), menu management with image upload/URL and availability toggle.
   - **Delivery Agent**: Assigned deliveries, customer address, one-click status transitions (Picked Up -> Out for Delivery -> Delivered).
   - **Super Admin**: Platform revenue, customer/restaurant/agent counts, restaurant approval toggle switch, user block/unblock controls.

---

## Verification Plan

### Automated & Sanity Tests
1. **Database Seeding**: Run `node server/seed.js` to populate multi-town restaurants (Gadag, Hubli), food items, and users.
2. **Backend API Verification**:
   - Test login for all 4 roles via curl / Node scripts.
   - Test `/api/restaurants/nearby` with coordinates in Gadag (should return Gadag restaurants only) and Hubli (should return Hubli restaurants only).
   - Test order creation and restaurant boundary validation.
3. **Frontend Build & Integration**:
   - Build client via `npm run build` to verify zero compile or styling errors.
   - Run both server (port 5000) and client (Vite on port 5173/5174).

### Manual Flow Verification
1. Login as customer (`customer@demo.com` / `password123`).
2. Switch delivery location between Gadag (Station Road) and Hubli (Vidyanagar). Verify restaurant listing dynamically updates.
3. Add food items to cart, test multi-restaurant cart restriction warning modal.
4. Place COD order, verify order reaches the correct Restaurant Admin dashboard.
5. Login as Restaurant Admin (`spicegarden@demo.com` / `password123`), accept and assign delivery agent.
6. Login as Delivery Agent (`agent.gadag@demo.com` / `password123`), mark picked up and delivered.
7. Login as Super Admin (`admin@foodieconnect.com` / `admin123`), verify platform metrics and restaurant approval.
