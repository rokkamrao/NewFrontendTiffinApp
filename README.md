# 🍽️ TiffinApp - Food Delivery & Subscription Platform

A comprehensive food delivery and tiffin service platform built with **Angular 18** and **Spring Boot 3.5.2**.

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- Java 21+
- PostgreSQL 18+
- Git

### **Frontend Development Server**

```bash
# Install dependencies
npm install

# Start development server
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### **Backend API Server**

```bash
# Navigate to backend directory
cd ../tiffin-api

# Start Spring Boot application
mvn spring-boot:run
```

Backend API will be available at `http://localhost:8081/api`

## 🏗️ **Project Architecture**

### **Frontend Stack:**
- **Angular 18** - Standalone components with signals
- **TypeScript 5.5** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Bootstrap 5** - UI components
- **RxJS** - Reactive programming

### **Backend Stack:**
- **Spring Boot 3.5.2** - REST API framework
- **PostgreSQL 18** - Primary database
- **JWT** - Authentication & authorization
- **Razorpay** - Payment integration
- **Maven** - Dependency management

## 📱 **Features**

### **Customer App:**
- 🔐 **User Authentication** - Phone/Email login with OTP
- 🍽️ **Menu Browsing** - Search, filter, and browse dishes
- 🛒 **Cart Management** - Add/remove items, quantity control
- 📱 **Order Tracking** - Real-time order status updates
- 💳 **Payment Integration** - Razorpay payment gateway
- 📍 **Address Management** - Multiple delivery addresses
- ⭐ **Reviews & Ratings** - Rate dishes and service

### **Admin Dashboard:**
- 📊 **Real-time Analytics** - Revenue, orders, user metrics
- 📋 **Order Management** - Status updates, bulk operations
- 🍽️ **Menu Management** - Add/edit dishes, pricing, availability
- 👥 **User Management** - Customer and staff administration
- 🚚 **Delivery Tracking** - Partner management and route tracking
- 📈 **Business Intelligence** - Sales reports and insights
- 🔔 **Notification System** - Push notifications and alerts

### **Delivery Partner App:**
- 📱 **Order Assignment** - View and accept delivery requests
- 🗺️ **GPS Navigation** - Route optimization and tracking
- 📞 **Customer Communication** - In-app messaging and calls
- 💰 **Earnings Tracking** - Daily/weekly earnings reports

## 🛠️ **Development**

### **Code Scaffolding**

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

### **Building**

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

### **Running Tests**

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

## 📂 **Project Structure**

```
src/app/
├── core/                    # Core services, guards, interceptors
│   ├── guards/
│   ├── interceptors/
│   ├── models/
│   └── services/
├── features/                # Feature modules
│   ├── admin/              # Admin dashboard
│   ├── auth/               # Authentication
│   ├── home/               # Landing page
│   ├── menu/               # Menu browsing
│   ├── cart/               # Shopping cart
│   ├── orders/             # Order management
│   └── delivery/           # Delivery partner app
├── shared/                 # Shared components and utilities
│   ├── components/
│   └── ui/
└── design-system/          # Design tokens and components
```

## 🔧 **Configuration**

### **Environment Setup**

1. **Database Configuration** (PostgreSQL):
```sql
CREATE DATABASE tiffindb;
CREATE USER tiffin_user WITH PASSWORD 'tiffin_pass';
GRANT ALL PRIVILEGES ON DATABASE tiffindb TO tiffin_user;
```

2. **Backend Environment Variables**:
```bash
DB_USERNAME=tiffin_user
DB_PASSWORD=tiffin_pass
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

3. **Frontend Proxy Configuration** (`proxy.conf.json`):
```json
{
  "/api/*": {
    "target": "http://localhost:8081",
    "secure": true,
    "changeOrigin": true
  }
}
```

## 🚀 **Deployment**

### **Production Build**
```bash
# Frontend
ng build --configuration production

# Backend
mvn clean package -DskipTests
```

### **Docker Deployment**
```bash
# Build Docker images
docker build -t tiffin-frontend .
docker build -t tiffin-backend ../tiffin-api

# Run with Docker Compose
docker-compose up -d
```

## 📚 **API Documentation**

### **Authentication Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/refresh-token` - Token refresh

### **Order Management:**
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/{id}/status` - Update order status

### **Admin Endpoints:**
- `GET /api/admin/stats` - Dashboard statistics
- `POST /api/admin/sample-data` - Create sample data
- `GET /api/admin/orders` - All orders management

## 🔐 **Security**

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Admin, User, Delivery partner roles
- **CORS Configuration** - Cross-origin request handling
- **Input Validation** - Server-side validation for all inputs

## 📊 **Monitoring & Analytics**

- **Application Logging** - Comprehensive logging with correlation IDs
- **Database Monitoring** - Connection pool and query performance
- **Business Metrics** - Order volume, revenue, user engagement
- **Error Tracking** - Centralized error handling and reporting

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **Documentation**

- [`IMPLEMENTATION_CHANGELOG.md`](./IMPLEMENTATION_CHANGELOG.md) - Complete implementation details
- [`ADMIN_IMPLEMENTATION_COMPLETE.md`](./ADMIN_IMPLEMENTATION_COMPLETE.md) - Admin dashboard documentation
- [`ADMIN_DESIGN_SPECS.md`](./ADMIN_DESIGN_SPECS.md) - Design system specifications

## 📞 **Support**

For support and questions:
- **Email**: tiffin-dev@example.com
- **Documentation**: Check the docs folder for detailed guides
- **Issues**: Create an issue in the repository

---

## 🏆 **Project Status**

**Current Version**: 1.0.0  
**Status**: 95% Complete - Production Ready with Complete Backend  
**Last Updated**: November 4, 2025

### **✅ Completed Features:**
- **User Authentication & Registration** - Phone/Email login with OTP verification
- **Complete Backend Implementation** - All services, repositories, DTOs fully functional
- **Menu Browsing & Cart Management** - Search, filter, and browse dishes with cart operations
- **Order Placement & Tracking** - Real-time order status updates and management
- **Admin Dashboard** - Real-time analytics with comprehensive management interface
- **Payment Integration** - Enhanced Razorpay with validation and monitoring
- **Address Management** - Geographic coordinates with delivery optimization
- **Multi-channel Notifications** - WebSocket, email, SMS capabilities
- **Enterprise Architecture** - Complete validation, error handling, and business logic
- **Responsive Design** - Mobile-first approach with modern UI components

### **🔄 Ready for Integration:**
- **Frontend-Backend Connection** - API endpoints ready for integration
- **Real-time Features** - WebSocket infrastructure implemented
- **Sample Data Population** - Backend endpoint ready for execution
- **Authentication Flow** - JWT token management ready for frontend implementation

### **🔮 Future Enhancements:**
- **Advanced Analytics** - Enhanced reporting and business intelligence
- **Push Notifications** - Mobile and web push notification system
- **Performance Optimization** - Advanced caching and scaling improvements
- **Multi-language Support** - Internationalization features

---

**Built with ❤️ for the food delivery industry**
"# NewFrontendTiffinApp" 
