# 🍽️ TiffinApp - Frontend

**Modern Angular food delivery platform with comprehensive session management**

## 🚀 Quick Start

```bash
npm install
ng serve  # http://localhost:4200
```

**Prerequisites**: Node.js 18+, Angular CLI

**Backend**: Start [tiffin-api](../tiffin-api) on port 8081

## 🔑 Demo Credentials

**For testing and development, use these pre-configured accounts:**

| Role | Email/Login | Password | Phone | Description |
|------|-------------|----------|-------|--------------|
| **Test User** | `test@tiffin.app` or `9999999999` | `test123` | `9999999999` | Primary test account for user features |
| **Admin** | `admin@tiffin.app` | `admin123` | `9876543212` | Full admin dashboard access |
| **Super Admin** | `superadmin@tiffin.app` | `superadmin123` | `9876543213` | Complete system administration |
| **Regular User** | `john.customer@example.com` | `password123` | `9876543210` | Standard customer account |
| **Premium User** | `priya.premium@example.com` | `password123` | `9876543211` | Premium subscription features |
| **Delivery Person** | `delivery@tiffin.app` | `delivery123` | `9876543214` | Delivery partner dashboard |
| **Restaurant Partner** | `partner@tiffin.app` | `partner123` | `9876543215` | Restaurant management access |

**🔐 Authentication Notes:**
- All passwords are encrypted in database using BCrypt
- Use phone numbers for mobile app testing
- Use email addresses for web app testing
- Universal OTP `123456` works for any phone number in development
- Accounts are automatically created on first server startup

**🚀 Quick Test URLs:**
- **User Login**: [http://localhost:4200/auth/login](http://localhost:4200/auth/login)
- **Admin Login**: [http://localhost:4200/auth/admin-login](http://localhost:4200/auth/admin-login)
- **Admin Dashboard**: [http://localhost:4200/admin/dashboard](http://localhost:4200/admin/dashboard)
- **Integration Test**: [http://localhost:4200/integration-test](http://localhost:4200/integration-test)

## ✅ Features

### 🔐 **Authentication & Session Management**
- JWT-based authentication with session persistence
- Role-based access (User/Admin/Delivery)
- Auto-session restoration across browser refreshes
- Complete route protection

### 🛒 **Core Features**
- **Menu Browsing** - Search, filter, and browse dishes
- **Shopping Cart** - Add/remove items with persistence
- **Order Management** - Real-time tracking and history
- **Payment Integration** - Razorpay payment gateway
- **Subscription Plans** - Monthly/quarterly meal plans

### 🎛️ **Admin Panel**
- Real-time dashboard with analytics
- Order management and status updates
- Menu and dish management
- User management with role controls
- Delivery tracking and partner management

### 🚚 **Delivery System**
- Delivery partner dashboard
- Order assignment and tracking
- Status updates and communication

## 🛠️ Tech Stack

- **Angular 20+** with TypeScript
- **Tailwind CSS** + Angular Material
- **RxJS** for reactive programming
- **JWT** authentication with session management
- **PWA** capabilities with service worker

## 🏗️ Project Structure

```
src/app/
├── auth/           # Authentication system  
├── features/       # Feature modules
│   ├── admin/      # Admin dashboard
│   ├── cart/       # Shopping cart
│   ├── checkout/   # Payment flow
│   └── orders/     # Order management
├── core/           # Guards, services, models
└── shared/         # Shared components
```

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

## 📚 **Complete Documentation**

**📖 See [TIFFIN_PROJECT_DOCUMENTATION.md](../TIFFIN_PROJECT_DOCUMENTATION.md) for comprehensive project documentation including:**

- 🔐 Authentication & Session Management
- 🎛️ Admin Panel Implementation  
- 🛒 Feature Implementation Status
- 🚀 Deployment & Production Setup
- 🔧 Technical Architecture
- 🐛 Troubleshooting & Bug Fixes
- 📋 API Documentation
- 🧪 Testing & Quality Assurance

## 🔗 Quick Links

- **Main Documentation**: [`../TIFFIN_PROJECT_DOCUMENTATION.md`](../TIFFIN_PROJECT_DOCUMENTATION.md)
- **Backend API**: [`../tiffin-api`](../tiffin-api)
- **Archived Docs**: [`docs-archive/`](docs-archive/) - Old documentation files

## 🔧 **Troubleshooting**

### **Authentication Issues**
```bash
# Check auth state in browser console
window.authService.debugAuthState();

# Verify localStorage data
localStorage.getItem('authToken');
localStorage.getItem('userProfile');
```

### **Logo Not Loading**
- Check network tab for `/api/images/branding/logo` requests
- Verify backend API is running on port 8081
- Check browser console for loading errors

### **Development Server Issues**
```bash
# Clear Angular cache
ng cache clean

# Reinstall dependencies  
rm -rf node_modules package-lock.json
npm install

# Reset build
ng build --configuration development
```

### **Authentication State Not Updating**
- Refresh page after login - state should persist
- Check browser console for auth subscription logs
- Verify JWT token hasn't expired
- Use the browser test script: Copy contents of `browser-auth-test.js` into browser console
- Run `testAuth.full()` in console for comprehensive authentication test

### **Quick Debug Commands**
```javascript
// In browser console at http://localhost:4200
// Check auth state
window.authService.debugAuthState();

// Force refresh auth state  
window.authService.forceAuthStateFromStorage();
window.appComponent.debugForceAuthRefresh();
```

## 📞 **Support**

For support and questions:
- **Email**: tiffin-dev@example.com
- **Documentation**: Check the docs folder for detailed guides
- **Issues**: Create an issue in the repository

---

---

**📍 Current Status**: Production Ready with Complete Session Management  
**🔄 Last Updated**: November 21, 2025  
**📚 Documentation**: All project docs consolidated in [`../TIFFIN_PROJECT_DOCUMENTATION.md`](../TIFFIN_PROJECT_DOCUMENTATION.md) 
