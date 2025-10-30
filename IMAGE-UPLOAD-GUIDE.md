# How to Upload and Use Images in TiffinApp

## Problem

Browser-based apps cannot directly write files to the server's file system due to security restrictions. The admin image upload interface can preview and validate images, but cannot automatically save them to the `assets` folder.

## Solutions

### ✅ SOLUTION 1: Manual File Copy (Recommended for Development)

1. **Go to Admin Image Upload**
   - URL: `http://localhost:4200/admin/images`
   - Select an image file using "Choose File"
   - Click "Upload"

2. **Copy the File Manually**
   - Note the path shown in the alert (e.g., `assets/images/dishes/paneer-butter-masala.jpg`)
   - Manually copy your image file to:
     ```
     d:\Food Delivery app\tiffin-app\src\assets\images\dishes\paneer-butter-masala.jpg
     ```

3. **Refresh the App**
   - The image will now appear in the menu and other pages
   - Images in `src/assets` are automatically included in the build

### ✅ SOLUTION 2: Browser-Based Temporary Upload (Current)

The current implementation saves images to **localStorage** as base64 data:

**How it works:**
1. Upload images via admin panel
2. Images are stored in browser's localStorage
3. `ImageService` automatically uses uploaded images
4. **Limitation**: Only works in current browser session

**To use uploaded images:**
- Images uploaded via admin will automatically show in the app
- Stored in localStorage under key: `uploaded_images`
- Will be lost if you:
  - Clear browser cache
  - Use a different browser
  - Use incognito mode

### ✅ SOLUTION 3: Backend API Upload (Production Ready)

Create a backend endpoint to handle file uploads:

#### Backend (Spring Boot)

```java
@RestController
@RequestMapping("/api/admin")
public class ImageUploadController {
    
    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(
        @RequestParam("file") MultipartFile file,
        @RequestParam("category") String category,
        @RequestParam("imageId") String imageId
    ) {
        try {
            // Validate file
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File is empty");
            }
            
            // Get file extension
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            
            // Create filename
            String filename = imageId + extension;
            
            // Save to public/images folder
            Path uploadPath = Paths.get("public/images/" + category);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Return URL
            String imageUrl = "/images/" + category + "/" + filename;
            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("message", "Image uploaded successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
```

#### Frontend (Already Implemented)

Update `image-upload.component.ts`:

```typescript
uploadImage(image: ImageItem) {
  if (!image.file) return;
  
  const formData = new FormData();
  formData.append('file', image.file);
  formData.append('category', image.category);
  formData.append('imageId', image.id);
  
  this.http.post('/api/admin/upload-image', formData)
    .subscribe({
      next: (response: any) => {
        image.uploaded = true;
        alert(`Image uploaded successfully!\nURL: ${response.url}`);
      },
      error: (err) => {
        alert('Upload failed: ' + err.message);
      }
    });
}
```

## Current Image Usage

### How Images Are Loaded

The `ImageService` checks in this order:

1. **Uploaded images** (localStorage) - base64 data
2. **Assets folder** - `src/assets/images/`
3. **Fallback** - placeholder image

### Image Paths

```
src/assets/images/
├── branding/
│   ├── logo.png
│   ├── logo-white.png
│   └── favicon.ico
├── dishes/
│   ├── paneer-butter-masala.jpg
│   ├── dal-tadka.jpg
│   ├── biryani.jpg
│   └── ... (more dishes)
├── banners/
│   ├── banner-home.jpg
│   └── banner-subscription.jpg
└── placeholders/
    ├── placeholder-dish.png
    └── placeholder-user.png
```

## Quick Test

### Test with Base64 (Current System)

1. Go to: `http://localhost:4200/admin/images`
2. Upload any image for "Paneer Butter Masala"
3. Go to: `http://localhost:4200/menu`
4. You should see your uploaded image!

### Test with Manual Copy

1. Download a food image
2. Rename it to: `paneer-butter-masala.jpg`
3. Copy to: `d:\Food Delivery app\tiffin-app\src\assets\images\dishes\`
4. Refresh menu page
5. Image appears!

## Naming Convention

Images must match the dish ID (lowercase, hyphenated):

| Dish Name | File Name |
|-----------|-----------|
| Paneer Butter Masala | `paneer-butter-masala.jpg` |
| Dal Tadka | `dal-tadka.jpg` |
| Chole Bhature | `chole-bhature.jpg` |
| Palak Paneer | `palak-paneer.jpg` |

## Recommended Image Specs

### Dish Images
- **Format**: JPG or WebP
- **Size**: 800x600px (4:3 ratio)
- **File Size**: < 500KB
- **Quality**: 80-85%

### Logo
- **Format**: PNG or SVG
- **Size**: 200x200px (square)
- **File Size**: < 100KB
- **Background**: Transparent

### Banners
- **Format**: JPG or WebP
- **Size**: 1200x400px (3:1 ratio)
- **File Size**: < 800KB

## Free Image Resources

- **Unsplash**: https://unsplash.com/s/photos/indian-food
- **Pexels**: https://pexels.com/search/indian-food/
- **Pixabay**: https://pixabay.com/images/search/indian-food/

## Current Status

✅ **Working Now:**
- Admin image upload UI
- Image preview
- LocalStorage-based image storage
- Images show in menu if uploaded via admin
- Automatic fallback to assets folder

❌ **Not Working:**
- Direct file system writes (browser limitation)
- Automatic copying to assets folder

🔧 **Workaround:**
- Use localStorage (temporary, browser-only)
- Manually copy files (works permanently)
- Or implement backend API (production solution)

## Next Steps

### For Development
**Just manually copy** image files to `src/assets/images/` folders. This is the simplest and most reliable method.

### For Production
**Implement backend API** upload endpoint to handle file uploads properly and save them to a CDN or public folder.

---

**Current Recommendation**: Manually copy images to the assets folder. This is fast, reliable, and images will be included in the build.
