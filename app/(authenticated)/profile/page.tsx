'use client';

import { useEffect, useState, useRef } from 'react';
import { setUser as setLocalUser } from '@/lib/auth';
import ConfirmModal from '../../components/ConfirmModal';
import { useConfirmModal } from '@/lib/hooks/useConfirmModal';
import { api } from '@/lib/utils/api';
import { validators } from '@/lib/utils/validation';
import type { UserData } from '@/lib/types/profile';

interface UserProfile extends UserData {
  createdAt?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modal = useConfirmModal();

  const [formData, setFormData] = useState({
    name: '',
    profilePicture: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data, error } = await api.get<{ user: UserProfile }>('/api/user/profile');
    
    if (data) {
      setUser(data.user);
      setFormData({
        name: data.user.name || '',
        profilePicture: data.user.profilePicture || '',
      });
    } else if (error) {
      console.error('Error fetching profile:', error);
    }
    
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'name') {
      const error = validators.name(value);
      setErrors((prev) => ({ ...prev, name: error || '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    if (name === 'newPassword') {
      const error = validators.password(value);
      setErrors((prev) => ({ ...prev, newPassword: error || '' }));
    }

    if (name === 'confirmPassword') {
      if (value !== passwordData.newPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      modal.showError('Please select an image file', 'Invalid File');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      modal.showError('Image size should be less than 5MB', 'File Too Large');
      return;
    }

    setIsUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await import('@/lib/auth').then(m => m.getAccessToken())}`,
        },
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, profilePicture: data.url }));
        modal.showSuccess('Profile picture uploaded successfully');
      } else {
        modal.showError('Failed to upload image', 'Upload Failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      modal.showError('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrors({ ...errors, name: 'Name is required' });
      return;
    }

    if (!/^[A-Za-z\s]+$/.test(formData.name)) {
      setErrors({ ...errors, name: 'Name can only contain letters and spaces' });
      return;
    }

    setIsSaving(true);

    try {
      const token = getAccessToken();
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setLocalUser({
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
        });
        modal.showSuccess('Profile updated successfully!');
        window.dispatchEvent(new Event('userUpdated'));
      } else {
        const error = await response.json();
        modal.showError(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      modal.showError('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      setErrors((prev) => ({ ...prev, currentPassword: 'Current password is required' }));
      return;
    }

    if (!passwordData.newPassword) {
      setErrors((prev) => ({ ...prev, newPassword: 'New password is required' }));
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    if (errors.newPassword) {
      return;
    }

    setIsChangingPassword(true);

    try {
      const token = getAccessToken();
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setErrors({
          name: '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        modal.showSuccess('Password changed successfully!');
      } else {
        const error = await response.json();
        modal.showError(error.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      modal.showError('Error changing password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="profile-page">
        <div className="profile-header-simple">
          <h1 className="dashboard-title">Edit Profile</h1>
          <p className="dashboard-subtitle">Update your account information</p>
        </div>

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large" onClick={handleImageClick}>
                {formData.profilePicture ? (
                  <img src={formData.profilePicture} alt={user.name} />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
                {isUploading && (
                  <div className="upload-overlay">
                    <div className="loading-spinner"></div>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={handleImageClick}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Change Photo'}
              </button>
              <p className="avatar-hint">JPG, PNG or GIF. Max size 5MB</p>
            </div>

            <div className="profile-info-card">
              <h3>Account Info</h3>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">
                  {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-form-section">
            <form onSubmit={handleSubmit} className="profile-form">
              <h2 className="form-section-title">Basic Information</h2>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  placeholder="Enter your full name"
                  required
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={isSaving || !!errors.name}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <h2 className="form-section-title">Change Password</h2>
              <div className="form-group">
                <label htmlFor="currentPassword" className="form-label">
                  Current Password *
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`form-input ${errors.currentPassword ? 'input-error' : ''}`}
                  placeholder="Enter current password"
                />
                {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  New Password *
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`form-input ${errors.newPassword ? 'input-error' : ''}`}
                  placeholder="Enter new password"
                />
                {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Confirm new password"
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isChangingPassword || !!errors.newPassword || !!errors.confirmPassword}
                >
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modal.modalState.isOpen}
        title={modal.modalState.title}
        message={modal.modalState.message}
        type={modal.modalState.type}
        onClose={modal.closeModal}
      />
    </div>
  );
}

