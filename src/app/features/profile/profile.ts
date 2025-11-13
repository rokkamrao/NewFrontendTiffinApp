import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { UserProfile } from '../../core/models';

interface EditableUserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profileImageUrl?: string;
  preferredLanguage?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  userProfile: EditableUserProfile | null = null;
  originalProfile: EditableUserProfile | null = null;
  isEditing = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  profileImageFile: File | null = null;
  profileImagePreview: string | null = null;

  ngOnInit() {
    console.log('[Profile] 🚀 Component initialized');
    this.loadUserProfile();
  }

  async loadUserProfile() {
    console.log('[Profile] 📥 Loading user profile from database');
    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Get current user from auth service
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        console.log('[Profile] ❌ No authenticated user found, redirecting to login');
        this.router.navigate(['/auth/login']);
        return;
      }

      console.log('[Profile] 🔍 Fetching detailed profile for user ID:', currentUser.id);
      
      // Fetch complete profile from backend API
      const response = await this.apiService.get<any>(`/users/profile/${currentUser.id}`).toPromise();
      
      if (response.success && response.data) {
        this.userProfile = {
          id: response.data.id,
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || currentUser.email || '',
          phoneNumber: response.data.phoneNumber || currentUser.phone || '',
          profileImageUrl: response.data.profileImageUrl || '',
          preferredLanguage: response.data.preferredLanguage || 'en'
        };
        
        // Keep original copy for reset functionality
        this.originalProfile = { ...this.userProfile };
        
        console.log('[Profile] ✅ Profile loaded successfully:', this.userProfile);
        
        // Update profile image preview
        if (this.userProfile.profileImageUrl) {
          this.profileImagePreview = this.userProfile.profileImageUrl;
        }
      } else {
        console.error('[Profile] ❌ Failed to load profile:', response.message);
        this.errorMessage = 'Failed to load profile data';
      }
    } catch (error: any) {
      console.error('[Profile] ⚠️ Error loading profile:', error);
      
      if (error.status === 0) {
        this.errorMessage = '🔌 Cannot connect to server. Please check your internet connection.';
      } else if (error.status === 404) {
        this.errorMessage = 'Profile not found. Please contact support.';
      } else if (error.status === 401) {
        this.errorMessage = 'Session expired. Please log in again.';
        this.router.navigate(['/auth/login']);
        return;
      } else {
        this.errorMessage = error.error?.message || 'Error loading profile. Please try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  startEditing() {
    console.log('[Profile] ✏️ Starting edit mode');
    this.isEditing = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEditing() {
    console.log('[Profile] ❌ Canceling edit mode');
    if (this.originalProfile) {
      this.userProfile = { ...this.originalProfile };
    }
    this.isEditing = false;
    this.profileImageFile = null;
    this.profileImagePreview = this.userProfile?.profileImageUrl || null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  async saveProfile() {
    if (!this.userProfile) {
      this.errorMessage = 'No profile data to save';
      return;
    }

    console.log('[Profile] 💾 Saving profile changes');
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Validate required fields
      if (!this.userProfile.firstName?.trim()) {
        this.errorMessage = 'First name is required';
        this.isSaving = false;
        return;
      }

      if (!this.userProfile.email?.trim()) {
        this.errorMessage = 'Email is required';
        this.isSaving = false;
        return;
      }

      // Prepare update data
      const updateData = {
        firstName: this.userProfile.firstName.trim(),
        lastName: this.userProfile.lastName.trim(),
        email: this.userProfile.email.trim(),
        phoneNumber: this.userProfile.phoneNumber.trim(),
        preferredLanguage: this.userProfile.preferredLanguage
      };

      console.log('[Profile] 🔄 Updating profile with data:', updateData);

      // Update profile via API
      const response = await this.apiService.put<any>(`/users/profile/${this.userProfile.id}`, updateData).toPromise();

      if (response.success) {
        console.log('[Profile] ✅ Profile updated successfully');
        
        // Handle profile image upload if needed
        if (this.profileImageFile) {
          await this.uploadProfileImage();
        }

        // Update the original profile copy
        this.originalProfile = { ...this.userProfile };
        
        // Update auth service with new data
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            name: `${this.userProfile.firstName} ${this.userProfile.lastName}`.trim(),
            fullName: `${this.userProfile.firstName} ${this.userProfile.lastName}`.trim(),
            email: this.userProfile.email,
            phone: this.userProfile.phoneNumber
          };
          this.authService.setAuthData(localStorage.getItem('authToken') || '', updatedUser);
        }

        this.successMessage = 'Profile updated successfully!';
        this.isEditing = false;
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
        
      } else {
        console.error('[Profile] ❌ Profile update failed:', response.message);
        this.errorMessage = response.message || 'Failed to update profile';
      }
    } catch (error: any) {
      console.error('[Profile] ⚠️ Error updating profile:', error);
      
      if (error.status === 0) {
        this.errorMessage = '🔌 Cannot connect to server. Please check your internet connection.';
      } else if (error.status === 400) {
        this.errorMessage = error.error?.message || 'Invalid profile data. Please check your inputs.';
      } else if (error.status === 401) {
        this.errorMessage = 'Session expired. Please log in again.';
        this.router.navigate(['/auth/login']);
        return;
      } else if (error.status === 409) {
        this.errorMessage = 'Email is already taken by another user.';
      } else {
        this.errorMessage = error.error?.message || 'Error updating profile. Please try again.';
      }
    } finally {
      this.isSaving = false;
    }
  }

  onProfileImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    console.log('[Profile] 🖼️ Profile image selected:', file.name);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select a valid image file';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'Image must be smaller than 5MB';
      return;
    }

    this.profileImageFile = file;

    // Create preview
    if (isPlatformBrowser(this.platformId)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadProfileImage() {
    if (!this.profileImageFile || !this.userProfile) return;

    console.log('[Profile] 📤 Uploading profile image');

    try {
      const formData = new FormData();
      formData.append('image', this.profileImageFile);
      formData.append('category', 'profile');

      const uploadResponse = await this.apiService.post<any>('/storage/upload', formData).toPromise();

      if (uploadResponse.success && uploadResponse.data) {
        console.log('[Profile] ✅ Profile image uploaded successfully');
        this.userProfile.profileImageUrl = uploadResponse.data.imageUrl;
        this.profileImagePreview = uploadResponse.data.imageUrl;
        this.profileImageFile = null;
      }
    } catch (error) {
      console.error('[Profile] ❌ Error uploading profile image:', error);
      // Don't fail the whole save operation for image upload errors
    }
  }

  getDisplayName(): string {
    if (!this.userProfile) return 'User';
    return `${this.userProfile.firstName} ${this.userProfile.lastName}`.trim() || 'User';
  }

  getInitials(): string {
    if (!this.userProfile) return 'U';
    const first = this.userProfile.firstName?.charAt(0)?.toUpperCase() || '';
    const last = this.userProfile.lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || this.userProfile.email?.charAt(0)?.toUpperCase() || 'U';
  }
}
