# Favicon Setup Guide

## Overview
The favicon system automatically updates when you upload a new favicon image through the admin interface.

## How It Works

### 1. **Default Favicon**
- Located at: `public/favicon.ico`
- Referenced in: `src/index.html`
- This is the fallback favicon shown if no custom favicon is uploaded

### 2. **Upload Custom Favicon**
Navigate to: **http://localhost:4200/admin/images**

Find the "Favicon" card and:
1. Click "Choose File"
2. Select your favicon image (PNG, JPG, SVG, or ICO format)
3. Recommended size: 32x32 or 16x16 pixels
4. Click "Upload"

### 3. **Automatic Update**
The favicon will update **immediately** without requiring a page refresh!

## Technical Implementation

### Components:
1. **FaviconService** (`core/services/favicon.service.ts`)
   - Manages dynamic favicon updates
   - Subscribes to image update events
   - Updates the `<link rel="icon">` tag in the DOM

2. **ImageService** (`core/services/image.service.ts`)
   - Added `getFavicon()` method
   - Returns uploaded favicon from localStorage or falls back to default

3. **App Components** (`app.ts`, `app.component.ts`)
   - Initialize `FaviconService` on app load
   - Automatically updates favicon when new image uploaded

### Storage:
- Uploaded favicons are stored in browser's localStorage as base64 encoded strings
- Storage key pattern: `uploaded_images` → `branding/favicon.[ext]`

### Supported Formats:
- ICO (recommended for best browser compatibility)
- PNG (modern browsers)
- SVG (modern browsers)
- JPG (works but not recommended for icons)

## Troubleshooting

### Favicon Not Updating?
1. **Hard Refresh:** Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Clear Browser Cache:** Browsers aggressively cache favicons
3. **Check Upload:** Go to `/admin/images` and verify the favicon shows as uploaded
4. **Check Console:** Open browser DevTools and look for `[FaviconService]` logs

### Favicon Reverts After Reload?
- This is expected behavior with localStorage storage
- Uploaded images persist only in the current browser
- For production: implement backend file upload API

## Production Considerations

### Current Setup (Development):
- ✅ Fast and easy for testing
- ✅ No backend required
- ❌ Only works in the browser that uploaded
- ❌ Lost if browser cache is cleared

### Production Setup (Recommended):
1. Create backend endpoint: `POST /api/admin/upload-favicon`
2. Save uploaded file to `public/favicon.ico`
3. Reference the actual file instead of localStorage
4. Optionally use CDN (Cloudinary, AWS S3) for serving

## Example: Updating Favicon Programmatically

```typescript
// Inject services
constructor(
  private imageService: ImageService,
  private faviconService: FaviconService
) {}

// Update favicon
updateFavicon() {
  // After uploading new favicon to storage
  this.imageService.refresh();
  // Favicon will auto-update via subscription
}
```

## Browser Compatibility

| Browser | ICO | PNG | SVG |
|---------|-----|-----|-----|
| Chrome  | ✅  | ✅  | ✅  |
| Firefox | ✅  | ✅  | ✅  |
| Safari  | ✅  | ✅  | ✅  |
| Edge    | ✅  | ✅  | ✅  |

## Files Modified

- `src/index.html` - Added favicon link tag
- `src/app/core/services/image.service.ts` - Added getFavicon() method
- `src/app/core/services/favicon.service.ts` - NEW: Dynamic favicon manager
- `src/app/app.ts` - Initialize FaviconService
- `src/app/app.component.ts` - Initialize FaviconService

---

**Quick Start:** Just go to http://localhost:4200/admin/images and upload your favicon! 🚀
