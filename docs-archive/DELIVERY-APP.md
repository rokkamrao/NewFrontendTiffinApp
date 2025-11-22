# Delivery Partner App - Documentation

## Overview

The Delivery Partner App is a dedicated interface for delivery personnel to manage their deliveries, track orders, and capture location data during the delivery process.

## Features

### 🔐 Authentication
- Secure login with phone number and password
- Session management with localStorage
- Auto-redirect if already logged in

### 📊 Dashboard
- Real-time delivery statistics
- Today's earnings tracker
- Pending pickups, in-transit, and completed orders count
- Delivery partner rating and performance metrics
- Recent activity timeline

### 📦 Order Management
- View all assigned orders
- Filter by status: Pending, Active, Completed
- Detailed order information:
  - Customer name and phone
  - Delivery address with landmarks
  - Order items and total amount
  - Distance and estimated delivery time
  - Priority indicators (High/Medium/Low)

### 📍 Location Tracking
- **Automatic location capture** on status updates:
  - When picking up order from restaurant
  - When starting delivery
  - When marking order as delivered
- **Manual location capture** option
- **Location history** for each order
- High-accuracy GPS coordinates
- Timestamp for each location point
- View location on Google Maps

### 🗺️ Navigation
- One-click navigation to delivery address via Google Maps
- View delivery location on map
- Distance calculation

### 📱 Mobile-First Design
- Optimized for delivery personnel using mobile devices
- Touch-friendly interface
- Quick action buttons
- Easy-to-read status indicators

## Access URLs

### Customer App
- **Login**: `http://localhost:4200/delivery/login`
- **Dashboard**: `http://localhost:4200/delivery/dashboard`
- **Orders List**: `http://localhost:4200/delivery/orders`
- **Order Details**: `http://localhost:4200/delivery/order/:id`

## Demo Credentials

```
Phone: 9876543210
Password: delivery123
```

## App Flow

### 1. Login
```
/delivery/login
  ↓
Enter phone & password
  ↓
Authenticate
  ↓
Save session to localStorage
  ↓
Redirect to Dashboard
```

### 2. View Orders
```
Dashboard → "View Orders" button
  ↓
See all assigned orders
  ↓
Filter by: Pending | Active | Completed
  ↓
Select order for details
```

### 3. Pickup Flow
```
Order (Pending Pickup)
  ↓
Click "Mark Picked Up"
  ↓
📍 Location captured automatically
  ↓
Status → Picked Up
```

### 4. Delivery Flow
```
Order (Picked Up)
  ↓
Click "Start Delivery"
  ↓
📍 Location captured automatically
  ↓
Status → In Transit
  ↓
Click "Navigate" to get directions
  ↓
Reach customer location
  ↓
Click "Mark Delivered"
  ↓
📍 Location captured automatically
  ↓
Status → Delivered
```

## Location Capture System

### How It Works

1. **Automatic Capture**
   - Triggered on status updates (pickup, start delivery, delivered)
   - Uses HTML5 Geolocation API
   - High accuracy mode enabled
   - Captures: latitude, longitude, accuracy, timestamp

2. **Manual Capture**
   - Available in order detail page
   - Useful for checkpoints or verification
   - Same accuracy as automatic capture

3. **Data Stored**
   ```json
   {
     "orderId": "1",
     "action": "pickup",
     "latitude": 12.9716,
     "longitude": 77.5946,
     "accuracy": 10.5,
     "timestamp": "2025-10-29T12:30:00.000Z",
     "deliveryPersonId": "DEL001"
   }
   ```

4. **Storage**
   - Currently: localStorage (for demo)
   - Production: Backend API endpoint `/api/delivery/location`

### Location Actions

| Action | Description | When Triggered |
|--------|-------------|----------------|
| `pickup` | Order picked from restaurant | Mark Picked Up button |
| `start_delivery` | Started delivering | Start Delivery button |
| `delivered` | Order delivered to customer | Mark Delivered button |
| `manual` | Manual location update | Manual capture button |
| `checkpoint` | Delivery checkpoint | Optional waypoints |

## Order Status Flow

```
pending_pickup → picked_up → in_transit → delivered
```

### Status Badges
- **Pending Pickup**: Yellow/Warning
- **Picked Up**: Blue/Info
- **In Transit**: Primary
- **Delivered**: Green/Success

## Integration with Customer App

### Customer Tracking Page
- Customers can view real-time delivery location
- Location history is displayed
- Updates automatically every 10 seconds
- Shows latest location on map (when implemented)

### Access Customer Tracking
```
Customer App → Orders → Track Order
URL: /tracking/:orderId
```

## API Endpoints (Backend Integration)

### Location Tracking
```typescript
// Save location
POST /api/delivery/location
Body: {
  orderId: string,
  action: string,
  latitude: number,
  longitude: number,
  accuracy: number,
  timestamp: string,
  deliveryPersonId: string
}

// Get locations for order
GET /api/delivery/location/:orderId

// Get locations by delivery person
GET /api/delivery/location/person/:deliveryPersonId
```

### Order Management
```typescript
// Get assigned orders
GET /api/delivery/orders/:deliveryPersonId

// Update order status
PUT /api/delivery/orders/:orderId/status
Body: {
  status: string,
  location: { lat: number, lng: number }
}
```

## Location Service Features

### Available Methods

```typescript
// Get current position
locationService.getCurrentPosition()
  .subscribe(position => {
    console.log(position.latitude, position.longitude);
  });

// Watch position (real-time)
locationService.watchPosition()
  .subscribe(position => {
    // Updates continuously
  });

// Capture location for order
locationService.captureLocationForOrder(orderId, 'pickup', deliveryPersonId)
  .subscribe(locationData => {
    console.log('Location saved:', locationData);
  });

// Get location history
const history = locationService.getLocationsByOrder(orderId);

// Calculate distance
const distance = locationService.calculateDistance(
  lat1, lng1, lat2, lng2
); // Returns km

// Open Google Maps
locationService.openGoogleMaps(lat, lng);
locationService.viewLocationOnMap(lat, lng);
```

## Browser Permissions

### Location Permission Required

The app requires location access to function properly:

1. **First Use**: Browser will prompt for permission
2. **Allow**: App can capture locations
3. **Deny**: App will show error message

### Error Handling

- **Permission Denied**: Shows alert asking user to enable permissions
- **Position Unavailable**: Network/GPS issues
- **Timeout**: Request takes too long (10s timeout)

## Mobile Considerations

### GPS Accuracy
- **High Accuracy Mode**: Enabled by default
- **Timeout**: 10 seconds
- **Maximum Age**: No cached positions (always fresh)

### Battery Optimization
- Location captured only on status updates
- Not continuous tracking (to save battery)
- Can enable real-time tracking when needed

### Network
- Works offline for UI navigation
- Requires internet for:
  - Google Maps navigation
  - Backend API sync (when implemented)

## Future Enhancements

### Planned Features
- [ ] Real-time map integration (Google Maps/Leaflet)
- [ ] Route optimization
- [ ] Multiple delivery batch support
- [ ] Offline mode with sync
- [ ] Push notifications
- [ ] Photo proof of delivery
- [ ] Digital signature capture
- [ ] Earnings calculator
- [ ] Performance analytics
- [ ] Route history replay

### Backend Integration
- [ ] Real API endpoints
- [ ] Database schema for locations
- [ ] WebSocket for real-time updates
- [ ] Location history retention policy
- [ ] Analytics and reporting

## Testing

### Test Scenarios

1. **Login Flow**
   - Invalid credentials → Error message
   - Valid credentials → Dashboard
   - Already logged in → Auto-redirect

2. **Location Capture**
   - Allow permission → Success
   - Deny permission → Error alert
   - No GPS → Timeout error

3. **Order Management**
   - Filter orders by status
   - Update order status
   - Location auto-capture on update
   - Navigate to address

4. **Customer View**
   - View location history
   - Real-time updates
   - View on map

## Troubleshooting

### Location Not Capturing
1. Check browser permissions
2. Ensure HTTPS (required for geolocation)
3. Check GPS/location services enabled
4. Try manual capture

### Map Not Opening
1. Check popup blocker
2. Verify internet connection
3. Try different browser

### Session Issues
1. Clear localStorage
2. Re-login
3. Check browser cookies enabled

## Security Considerations

### Current Implementation (Demo)
- localStorage for session
- No encryption
- No token expiration

### Production Requirements
- [ ] JWT tokens
- [ ] Secure HTTPS
- [ ] Token refresh mechanism
- [ ] Location data encryption
- [ ] Rate limiting
- [ ] IP whitelisting for API

## Performance

### Optimization
- Lazy loading of routes
- Minimal dependencies
- Efficient location capture
- Auto-refresh with intervals (not polling)

### Metrics
- Location capture: < 5 seconds
- Page load: < 2 seconds
- Order list render: < 1 second

---

## Quick Start Guide

1. **Start Frontend**
   ```bash
   npm start
   ```

2. **Access Delivery App**
   ```
   http://localhost:4200/delivery/login
   ```

3. **Login**
   ```
   Phone: 9876543210
   Password: delivery123
   ```

4. **View Orders**
   - Click "View Orders" on dashboard
   - See pending deliveries

5. **Update Status**
   - Click "Mark Picked Up"
   - Allow location access
   - Location captured automatically

6. **Navigate**
   - Click "Navigate" button
   - Opens Google Maps

7. **View Location History**
   - Click eye icon on order
   - See all captured locations

---

**Built with Angular 20 • Bootstrap 5 • Geolocation API**
