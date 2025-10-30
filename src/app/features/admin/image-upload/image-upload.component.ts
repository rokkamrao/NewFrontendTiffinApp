import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ImageService } from '../../../core/services/image.service';

interface ImageItem {
  id: string;
  name: string;
  category: string;
  file: File | null;
  preview: string;
  uploaded: boolean;
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.css'
})
export class ImageUploadComponent {
  images: ImageItem[] = [
    { id: 'logo', name: 'TiffinApp Logo', category: 'branding', file: null, preview: '', uploaded: false },
    { id: 'logo-white', name: 'TiffinApp Logo (White)', category: 'branding', file: null, preview: '', uploaded: false },
    { id: 'favicon', name: 'Favicon', category: 'branding', file: null, preview: '', uploaded: false },
    
    { id: 'paneer-butter-masala', name: 'Paneer Butter Masala', category: 'dishes', file: null, preview: '', uploaded: false },
    { id: 'dal-tadka', name: 'Dal Tadka', category: 'dishes', file: null, preview: '', uploaded: false },
    { id: 'biryani', name: 'Biryani', category: 'dishes', file: null, preview: '', uploaded: false },
    { id: 'roti', name: 'Roti', category: 'dishes', file: null, preview: '', uploaded: false },
    { id: 'rice', name: 'Rice', category: 'dishes', file: null, preview: '', uploaded: false },
    { id: 'salad', name: 'Salad', category: 'dishes', file: null, preview: '', uploaded: false },
    { id: 'chole-bhature', name: 'Chole Bhature', category: 'dishes', file: null, preview: '', uploaded: false },
    { id: 'palak-paneer', name: 'Palak Paneer', category: 'dishes', file: null, preview: '', uploaded: false },
    { id: 'rajma-chawal', name: 'Rajma Chawal', category: 'dishes', file: null, preview: '', uploaded: false },
    { id: 'aloo-gobi', name: 'Aloo Gobi', category: 'dishes', file: null, preview: '', uploaded: false },
    
    { id: 'banner-home', name: 'Home Banner', category: 'banners', file: null, preview: '', uploaded: false },
    { id: 'banner-subscription', name: 'Subscription Banner', category: 'banners', file: null, preview: '', uploaded: false },
    
    { id: 'placeholder-dish', name: 'Dish Placeholder', category: 'placeholders', file: null, preview: '', uploaded: false },
    { id: 'placeholder-user', name: 'User Avatar Placeholder', category: 'placeholders', file: null, preview: '', uploaded: false }
  ];

  selectedCategory = 'all';
  searchTerm = '';

  constructor(
    private router: Router,
    private imageService: ImageService
  ) {}

  get filteredImages(): ImageItem[] {
    return this.images.filter(img => {
      const matchesCategory = this.selectedCategory === 'all' || img.category === this.selectedCategory;
      const matchesSearch = img.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  get categories(): string[] {
    return ['all', ...new Set(this.images.map(img => img.category))];
  }

  get uploadedCount(): number {
    return this.images.filter(img => img.uploaded).length;
  }

  get totalCount(): number {
    return this.images.length;
  }

  onFileSelected(event: Event, image: ImageItem) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      image.file = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        image.preview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadImage(image: ImageItem) {
    if (!image.file) {
      alert('Please select a file first');
      return;
    }

    console.log(`[ImageUpload] Uploading ${image.name} to API...`);

    // Upload to backend API
    this.imageService.uploadImage(image.file, image.category, image.id)
      .subscribe({
        next: (response) => {
          console.log('[ImageUpload] Upload successful:', response);
          image.uploaded = true;
          
          alert(`✅ Image "${image.name}" uploaded successfully!\n\nThe image is now stored in the database and will appear in your app immediately.`);
        },
        error: (error) => {
          console.error('[ImageUpload] Upload failed:', error);
          const errorMessage = error.error?.error || error.message || 'Unknown error';
          alert(`❌ Upload failed: ${errorMessage}\n\nPlease try again.`);
        }
      });
  }

  uploadAll() {
    const unuploadedImages = this.images.filter(img => img.file && !img.uploaded);
    if (unuploadedImages.length === 0) {
      alert('No images to upload');
      return;
    }

    unuploadedImages.forEach(img => this.uploadImage(img));
  }

  removeImage(image: ImageItem) {
    image.file = null;
    image.preview = '';
    image.uploaded = false;
  }

  goBack() {
    this.router.navigate(['/admin']);
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'branding': 'bi-award',
      'dishes': 'bi-bowl',
      'banners': 'bi-card-image',
      'placeholders': 'bi-image-alt'
    };
    return icons[category] || 'bi-image';
  }
}
