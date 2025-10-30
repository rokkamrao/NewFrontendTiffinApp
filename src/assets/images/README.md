# TiffinApp Image Assets

## Directory Structure

```
assets/images/
├── branding/          # Logos, favicons, brand assets
├── dishes/            # Food/dish photographs
├── banners/           # Homepage and promotional banners
├── placeholders/      # Default/fallback images
└── icons/             # App icons and small graphics
```

## Image Upload Instructions

### Option 1: Using Admin Dashboard (Recommended)

1. Navigate to **http://localhost:4200/admin**
2. Click on **Quick Actions** button (or **Image Management** card if available)
3. Click on **Images** button
4. You'll see a list of all required images organized by category
5. For each image:
   - Click **"Choose File"** button
   - Select your image file (JPG, PNG, SVG, or WebP)
   - Click **"Upload"** button
   - The system will show the recommended save path

### Option 2: Manual Upload

Simply place your images directly in the appropriate folder:

#### Branding Images
- **Logo**: `branding/logo.png` or `logo.svg`
- **Logo White**: `branding/logo-white.png`
- **Favicon**: `branding/favicon.ico` or `favicon.png`

#### Dish Images
- **Paneer Butter Masala**: `dishes/paneer-butter-masala.jpg`
- **Dal Tadka**: `dishes/dal-tadka.jpg`
- **Biryani**: `dishes/biryani.jpg`
- **Roti**: `dishes/roti.jpg`
- **Rice**: `dishes/rice.jpg`
- **Salad**: `dishes/salad.jpg`
- **Chole Bhature**: `dishes/chole-bhature.jpg`
- **Palak Paneer**: `dishes/palak-paneer.jpg`
- **Rajma Chawal**: `dishes/rajma-chawal.jpg`
- **Aloo Gobi**: `dishes/aloo-gobi.jpg`

#### Banners
- **Home Banner**: `banners/banner-home.jpg`
- **Subscription Banner**: `banners/banner-subscription.jpg`

#### Placeholders
- **Dish Placeholder**: `placeholders/placeholder-dish.png`
- **User Avatar**: `placeholders/placeholder-user.png`

## Image Specifications

### Logos
- **Format**: SVG (preferred) or PNG with transparent background
- **Size**: 200x200px minimum
- **File Size**: < 100KB

### Dish Images
- **Format**: JPG or WebP
- **Dimensions**: 800x600px (4:3 aspect ratio)
- **File Size**: < 500KB
- **Style**: Well-lit, appetizing food photography

### Banners
- **Format**: JPG or WebP
- **Dimensions**: 1200x400px (3:1 aspect ratio)
- **File Size**: < 800KB

### Placeholders
- **Format**: PNG with transparency
- **Dimensions**: 400x400px
- **File Size**: < 200KB

## Usage in Code

Reference images in your components using:

```typescript
// Branding
<img src="assets/images/branding/logo.png" alt="TiffinApp Logo">

// Dishes
<img src="assets/images/dishes/paneer-butter-masala.jpg" alt="Paneer Butter Masala">

// Banners
<img src="assets/images/banners/banner-home.jpg" alt="Home Banner">

// Placeholders (fallback)
<img [src]="dish.imageUrl || 'assets/images/placeholders/placeholder-dish.png'" [alt]="dish.name">
```

## Free Image Resources

If you need stock images:

- **Unsplash**: https://unsplash.com/s/photos/indian-food
- **Pexels**: https://pexels.com/search/food/
- **Pixabay**: https://pixabay.com/images/search/food/

## Notes

- All images are automatically served from the `assets` folder
- Images will be copied to the `dist` folder during build
- Use WebP format for best performance
- Always provide alt text for accessibility
- Consider using responsive images for different screen sizes
