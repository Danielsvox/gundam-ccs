<h1 align="center">🤖 Gundam Ccs Frontend</h1>

<p align="center">
  <strong>Frontend for Your Ultimate Destination for Premium Gundam Model Kits</strong>
</p>

## What is Gundam Ccs Frontend?

This is the frontend React application for Gundam Ccs, a modern, interactive e-commerce platform designed specifically for Gundam enthusiasts and model kit collectors. This repository contains the user interface and client-side logic.

## 🏗️ Architecture

This project follows a **separate repository architecture**:

- **Frontend** (this repo) - React application with user interface
- **Backend** ([gundam-ccs-backend](https://github.com/Danielsvox/gundam-ccs-backend)) - Node.js/Express API
- **Database** - Firebase/Supabase for data persistence

## 🎯 What This Frontend Does

### **Browse & Discover**
- **Comprehensive Catalog**: Explore a carefully curated collection of Gundam model kits from various series
- **Smart Filtering**: Find exactly what you're looking for with filters by genre (Action, Strategy, RPG, Shooter, Adventure, Puzzle, Racing, Sports)
- **Advanced Search**: Search by model name, series, or any keyword to discover your next build
- **Visual Grid/List Views**: Switch between grid and list layouts to browse your way

### **User Experience**
- **User Authentication**: Register, login, and manage your account
- **Persistent Cart**: Your cart is saved and synchronized across devices
- **Secure Checkout**: Integrated payment processing with Stripe
- **Order History**: Track your past purchases and order status

### **Personalized Experience**
- **Wishlist Management**: Save your favorite models for later
- **Rating System**: See community ratings and reviews
- **Like & Save**: Build your personal collection
- **Random Discovery**: Use the "Play Dice" feature to discover random models

### **Shopping Experience**
- **Smart Cart System**: Add models to your cart with one click, manage quantities
- **Real-time Updates**: See cart updates instantly with smooth animations
- **Responsive Design**: Shop seamlessly on desktop, tablet, or mobile devices
- **Quick Navigation**: Access all features through intuitive navigation

### **Visual Design**
- **RX-78-2 Themed**: Features the iconic RX-78-2 Gundam as the centerpiece background
- **Modern UI**: Clean, professional interface with smooth animations powered by Framer Motion
- **Custom Typography**: Beautiful GT Walsheim fonts for a premium feel
- **Dark Theme**: Easy on the eyes with a sophisticated dark color scheme

## 🚀 Key Features

- **Responsive Design**: Works perfectly on all devices and screen sizes
- **Smooth Animations**: Fluid transitions and micro-interactions enhance user experience
- **Search & Filter**: Powerful search functionality with multiple filter options
- **Cart Management**: Full-featured shopping cart with real-time updates
- **Wishlist System**: Save and organize your favorite models
- **Performance Optimized**: Fast loading times and smooth interactions
- **Accessibility**: Built with accessibility best practices in mind
- **Internationalization**: Support for English and Spanish languages

## 🛠 Built With

- **React 18** - Modern React with hooks and functional components
- **React Router** - Client-side routing for smooth navigation
- **Framer Motion** - Beautiful animations and transitions
- **CSS Modules** - Scoped styling for maintainable code
- **Axios** - HTTP client for API communication
- **i18next** - Internationalization support
- **Jest** - Comprehensive testing suite
- **Git** - Version control and collaboration

## 🔧 Technical Highlights

- **Component Architecture**: Modular, reusable components for maintainable code
- **State Management**: Efficient state handling with React hooks
- **API Integration**: Clean separation between frontend and backend
- **Performance**: Optimized for speed with lazy loading and efficient rendering
- **Testing**: Comprehensive test coverage ensuring reliability
- **Responsive**: Mobile-first design that scales beautifully

## 🌐 API Integration

This frontend communicates with the backend API for:
- User authentication and management
- Cart persistence and synchronization
- Order processing and payment
- Product catalog and inventory
- User preferences and wishlists

## 🎯 Perfect For

- **Gundam Enthusiasts**: Find and collect your favorite mobile suits
- **Model Kit Collectors**: Discover new additions to your collection
- **Beginners**: Easy-to-use interface for those new to Gundam models
- **Veterans**: Advanced search and filtering for experienced collectors

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Danielsvox/gundam-ccs-frontend.git

# Navigate to the project directory
cd gundam-ccs-frontend

# Install dependencies
npm install

# Start the development server
npm start
```

### Environment Variables
Create a `.env` file in the root directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## 📦 Deployment

This frontend is deployed on GitHub Pages and can be easily deployed to:
- **Vercel** (recommended for React apps)
- **Netlify**
- **AWS S3 + CloudFront**
- **Firebase Hosting**

## 👨‍💻 Developer

**Carlos Daniel** - Full Stack Developer

- **LinkedIn**: [Carlos Daniel](https://www.linkedin.com/in/carlos-daniel-441685161/)
- **GitHub**: [@Danielsvox](https://github.com/Danielsvox)

## 🔗 Related Repositories

- **Backend API**: [gundam-ccs-backend](https://github.com/Danielsvox/gundam-ccs-backend)
- **Database**: Firebase/Supabase project

---

*Gundam Ccs is a demonstration project showcasing modern React development practices and e-commerce design principles. All Gundam-related content and imagery are property of their respective owners and used for educational purposes only.*
