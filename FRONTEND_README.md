# 🤖 Gundam CCS Frontend

A React-based frontend for the Gundam Custom Collection Store, designed to work with the Django REST API backend.

## 🚀 Features

### 🛍️ E-commerce Features
- **Product Catalog**: Browse Gundam model kits with detailed specifications
- **Advanced Filtering**: Filter by grade, scale, series, price, and availability
- **Search Functionality**: Search products by name, model number, pilot, etc.
- **Shopping Cart**: Full cart management with real-time updates
- **Wishlist System**: Save and manage favorite products
- **Order Management**: Complete order lifecycle tracking

### 👤 User Features
- **JWT Authentication**: Secure login/logout with token refresh
- **User Profiles**: Manage personal information and addresses
- **Email Verification**: Account verification system
- **Password Reset**: Secure password recovery

### 🎯 Gundam-Specific Features
- **Grade Filtering**: Filter by High Grade (HG), Master Grade (MG), Perfect Grade (PG), etc.
- **Scale Filtering**: Filter by 1/144, 1/100, 1/60 scales
- **Series Filtering**: Filter by Universal Century, After Colony, Cosmic Era, etc.
- **Product Specifications**: Detailed mobile suit specifications
- **Reviews & Ratings**: User-generated content and ratings

## 🛠️ Tech Stack

- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.8.0
- **HTTP Client**: Axios 1.6.0
- **Testing**: React Testing Library
- **Build Tool**: Create React App

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Django backend running on localhost:8000

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment configuration**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:8000/api/v1
   REACT_APP_ENVIRONMENT=development
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## 🔧 API Integration

### Authentication Service
The frontend uses a comprehensive authentication service that handles:

- JWT token management (access and refresh tokens)
- Automatic token refresh
- User session persistence
- Profile management

```javascript
import authService from './services/authService';

// Login
await authService.login({ email, password });

// Check authentication
if (authService.isUserAuthenticated()) {
  // User is logged in
}

// Get current user
const user = authService.getCurrentUser();
```

### Cart Service
Full shopping cart functionality with:

- Add/remove items
- Update quantities
- Apply/remove coupons
- Calculate totals (subtotal, tax, shipping)
- Real-time updates

```javascript
import cartService from './services/cartService';

// Add item to cart
await cartService.addToCart(productId, quantity);

// Get cart state
const cartState = cartService.getCartState();
```

### Product Service
Comprehensive product management with:

- Load products with filtering and pagination
- Search functionality
- Category and series filtering
- Product specifications and reviews

```javascript
import productService from './services/productService';

// Load products with filters
await productService.loadProducts({
  grade: 'MG',
  scale: '1/100',
  series: 'UC'
});

// Search products
await productService.searchProducts('RX-78-2');
```

## 📁 Project Structure

```
src/
├── services/           # API services
│   ├── api.js         # Axios configuration and API endpoints
│   ├── authService.js # Authentication service
│   ├── cartService.js # Shopping cart service
│   └── productService.js # Product management service
├── utils/             # Utility functions and data
│   ├── gundamProducts.js # Gundam product data structure
│   ├── games.js       # Legacy game data
│   └── gundams.js     # Legacy Gundam data
├── Components/        # Reusable UI components
├── Containers/        # Page containers
└── Resources/         # Static resources (images, fonts)
```

## 🔌 API Endpoints

The frontend integrates with the following Django REST API endpoints:

### Authentication
- `POST /api/v1/accounts/register/` - User registration
- `POST /api/v1/accounts/login/` - User login
- `POST /api/v1/accounts/logout/` - User logout
- `GET /api/v1/accounts/profile/` - Get user profile
- `PUT /api/v1/accounts/profile/` - Update user profile

### Products
- `GET /api/v1/products/products/` - List products with filtering
- `GET /api/v1/products/products/{id}/` - Product details
- `GET /api/v1/products/products/search/` - Search products
- `GET /api/v1/products/categories/` - List categories

### Cart
- `GET /api/v1/cart/cart/` - Get user's cart
- `POST /api/v1/cart/cart/items/add/` - Add item to cart
- `PUT /api/v1/cart/cart/items/{id}/update/` - Update cart item
- `DELETE /api/v1/cart/cart/items/{id}/remove/` - Remove from cart

### Orders
- `GET /api/v1/orders/orders/` - List user's orders
- `POST /api/v1/orders/orders/create/` - Create new order
- `GET /api/v1/orders/orders/{id}/` - Order details

### Wishlist
- `GET /api/v1/wishlist/wishlists/` - List user's wishlists
- `POST /api/v1/wishlist/wishlists/create/` - Create wishlist
- `POST /api/v1/wishlist/wishlists/{id}/items/add/` - Add to wishlist

## 🎨 Gundam Product Structure

The frontend uses a comprehensive product structure that matches the Django backend:

```javascript
{
  id: 1,
  name: "RX-78-2 Gundam",
  slug: "rx-78-2-gundam",
  description: "The iconic RX-78-2 Gundam...",
  price: "24.99",
  sale_price: null,
  sku: "BAN-001",
  stock_quantity: 50,
  
  // Gundam-specific fields
  grade: "HG",
  scale: "1/144",
  series: "UC",
  release_date: "1979-04-07",
  manufacturer: "Bandai",
  model_number: "RX-78-2",
  pilot: "Amuro Ray",
  height: "18.5m",
  weight_mecha: "43.4t",
  
  // Specifications
  specifications: {
    head_height: "18.5m",
    weight: "43.4t",
    power_output: "1380kW",
    // ... more specs
  },
  
  // Images
  main_image: "https://...",
  images: ["https://...", "https://..."],
  
  // Categories and metadata
  categories: ["Universal Century", "High Grade"],
  average_rating: 4.8,
  review_count: 125
}
```

## 🔍 Filtering and Search

### Available Filters
- **Grade**: HG, RG, MG, PG, FM, RE, SD, EG, VK
- **Scale**: 1/144, 1/100, 1/60, 1/48, 1/72, 1/35, SD
- **Series**: UC, AC, CE, AD, AG, PD, AS, CC, FC, AW, RC
- **Price Range**: Min/max price filtering
- **Availability**: In stock, featured products
- **Search**: Text search across name, description, model number, pilot

### Usage Examples

```javascript
// Filter by Master Grade 1/100 scale
productService.setFilters({
  grade: 'MG',
  scale: '1/100'
});

// Filter by Universal Century series
productService.setFilters({
  series: 'UC'
});

// Price range filter
productService.setFilters({
  price_min: 20,
  price_max: 50
});

// Search for specific mobile suit
productService.setFilters({
  search: 'RX-78-2'
});
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📦 Building for Production

```bash
# Build for production
npm run build

# The build folder will contain optimized files ready for deployment
```

## 🔒 Security Features

- **JWT Token Management**: Secure token handling with automatic refresh
- **CORS Protection**: Configured to work with Django backend
- **Input Validation**: Client-side validation for forms
- **Error Handling**: Comprehensive error handling and user feedback

## 🚀 Deployment

### Environment Variables for Production
```env
REACT_APP_API_URL=https://your-django-backend.com/api/v1
REACT_APP_ENVIRONMENT=production
```

### Build and Deploy
1. Set production environment variables
2. Run `npm run build`
3. Deploy the `build` folder to your web server
4. Configure your web server to serve the React app

## 🔧 Development

### Adding New Features
1. Create new service methods in the appropriate service file
2. Update the API endpoints in `src/services/api.js`
3. Create or update React components as needed
4. Add tests for new functionality

### Code Style
- Use functional components with hooks
- Follow React best practices
- Use the service layer for all API calls
- Implement proper error handling

## 📞 Support

For issues or questions:
1. Check the Django backend documentation
2. Review the API endpoints in the Django backend
3. Check the browser console for error messages
4. Verify environment variables are set correctly

## 🔄 Migration from Legacy

The frontend has been updated to work with the new Django backend. Key changes:

- Updated API endpoints to match Django REST API structure
- Implemented JWT authentication instead of Firebase
- Added comprehensive product filtering and search
- Enhanced cart functionality with coupons and tax calculation
- Added wishlist and order management features

The legacy data files (`games.js`, `gundams.js`) are still available for reference but the new system uses the Django backend as the data source. 