# 🤖 Gundam Ccs Backend API

Backend API for the Gundam Ccs e-commerce platform, built with Node.js, Express, and Firebase.

## 🏗️ Architecture

This backend provides a RESTful API for:
- **User Authentication** - Registration, login, profile management
- **Cart Management** - Persistent shopping cart with synchronization
- **Product Catalog** - Gundam model kits with search and filtering
- **Order Processing** - Complete order lifecycle management
- **Payment Processing** - Secure payments with Stripe
- **Wishlist Management** - User wishlists and favorites

## 🛠 Built With

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Firebase** - Authentication and database
- **Stripe** - Payment processing
- **JWT** - Token-based authentication
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Danielsvox/gundam-ccs-backend.git
   cd gundam-ccs-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   - Firebase service account credentials
   - JWT secret key
   - Stripe API keys
   - Database configuration

4. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## 📋 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |

### Cart Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cart` | Get user cart | Yes |
| POST | `/api/cart/items` | Add item to cart | Yes |
| PUT | `/api/cart/items/:id` | Update cart item | Yes |
| DELETE | `/api/cart/items/:id` | Remove item from cart | Yes |
| DELETE | `/api/cart` | Clear cart | Yes |

### Products

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products | No |
| GET | `/api/products/:id` | Get product by ID | No |
| GET | `/api/products/search` | Search products | No |
| GET | `/api/products/categories` | Get categories | No |

### Orders

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/orders` | Create new order | Yes |
| GET | `/api/orders` | Get user orders | Yes |
| GET | `/api/orders/:id` | Get order by ID | Yes |
| PUT | `/api/orders/:id/cancel` | Cancel order | Yes |

### Wishlist

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/wishlist` | Get user wishlist | Yes |
| POST | `/api/wishlist` | Add item to wishlist | Yes |
| DELETE | `/api/wishlist/:id` | Remove item from wishlist | Yes |

### Payments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments/create-intent` | Create payment intent | Yes |
| POST | `/api/payments/confirm` | Confirm payment | Yes |

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_service_account_email
# ... other Firebase config

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Create a service account and download the JSON file
5. Add the service account credentials to your `.env` file

### Stripe Setup

1. Create a Stripe account at [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys from the dashboard
3. Add the keys to your `.env` file

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📦 Deployment

### Heroku

1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy:
   ```bash
   git push heroku main
   ```

### Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`

## 🔒 Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin protection
- **Rate Limiting** - API abuse prevention
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Request data validation
- **Error Handling** - Secure error responses

## 📊 Database Schema

### Users Collection
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  phone: string,
  address: object,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Carts Collection
```javascript
{
  userId: string,
  items: array,
  total: number,
  updatedAt: timestamp
}
```

### Orders Collection
```javascript
{
  orderId: string,
  userId: string,
  items: array,
  total: number,
  status: string,
  paymentIntent: string,
  shippingAddress: object,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Products Collection
```javascript
{
  productId: string,
  name: string,
  description: string,
  price: number,
  category: string,
  images: array,
  inStock: boolean,
  rating: number,
  reviews: array
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**Carlos Daniel** - Full Stack Developer

- **LinkedIn**: [Carlos Daniel](https://www.linkedin.com/in/carlos-daniel-441685161/)
- **GitHub**: [@Danielsvox](https://github.com/Danielsvox)

## 🔗 Related Repositories

- **Frontend**: [gundam-ccs-frontend](https://github.com/Danielsvox/gundam-ccs-frontend)
- **Database**: Firebase project

---

*Gundam Ccs Backend API - Powering the ultimate Gundam model kit e-commerce experience.*
