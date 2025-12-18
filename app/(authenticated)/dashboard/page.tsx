'use client';

import { useEffect, useState } from 'react';
import ProfileTable from '../../components/ProfileTable';
import ProfileModalNew from '../../components/ProfileModalNew';
import ConfirmModal from '../../components/ConfirmModal';
import { useConfirmModal } from '@/lib/hooks/useConfirmModal';
import { api } from '@/lib/utils/api';
import type { ProfileData } from '@/lib/types/profile';

export default function DashboardPage() {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const confirmModal = useConfirmModal();
  const deleteModal = useConfirmModal();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    const { data, error } = await api.get<{ profiles: ProfileData[] }>('/api/profiles');
    
    if (data) {
      setProfiles(data.profiles);
    } else if (error) {
      console.error('Error fetching profiles:', error);
    }
    
    setIsLoading(false);
  };

  const handleAddProfile = () => {
    setEditingProfile(null);
    setIsModalOpen(true);
  };

  const handleEditProfile = (profile: ProfileData) => {
    setEditingProfile(profile);
    setIsModalOpen(true);
  };

  const handleDeleteProfile = (id: string) => {
    deleteModal.showWarning(
      'Are you sure you want to delete this profile? This action cannot be undone.',
      () => confirmDeleteProfile(id),
      'Delete Profile',
      'Delete'
    );
  };

  const confirmDeleteProfile = async (id: string) => {
    deleteModal.closeModal();
    
    const { data, error } = await api.delete(`/api/profiles/${id}`);
    
    if (data) {
      setProfiles((prev) => prev.filter((p) => p._id !== id));
      confirmModal.showSuccess('Profile deleted successfully', 'Deleted');
    } else {
      confirmModal.showError(error || 'Failed to delete profile');
    }
  };

  const handleSubmitProfile = async (profileData: ProfileData) => {
    const isEditing = !!editingProfile;
    const endpoint = isEditing ? `/api/profiles/${editingProfile._id}` : '/api/profiles';
    
    const { data, error } = isEditing
      ? await api.put<{ profile: ProfileData }>(endpoint, profileData)
      : await api.post<{ profile: ProfileData }>(endpoint, profileData);

    if (data) {
      if (isEditing) {
        setProfiles((prev) =>
          prev.map((p) => (p._id === data.profile._id ? data.profile : p))
        );
      } else {
        setProfiles((prev) => [data.profile, ...prev]);
      }
      setIsModalOpen(false);
      setEditingProfile(null);
      confirmModal.showSuccess(
        `Profile ${isEditing ? 'updated' : 'created'} successfully`
      );
    } else {
      confirmModal.showError(error || 'Failed to save profile');
    }
  };

  if (isLoading) {
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
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Profiles</h1>
          <p className="dashboard-subtitle">Manage all your profiles in one place</p>
        </div>
        <button className="btn-primary" onClick={handleAddProfile}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 4V16M4 10H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Add New Profile
        </button>
      </div>

      <ProfileTable
        profiles={profiles}
        onEdit={handleEditProfile}
        onDelete={handleDeleteProfile}
      />

      <ProfileModalNew
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProfile(null);
        }}
        onSubmit={handleSubmitProfile}
        profile={editingProfile}
      />

      <ConfirmModal
        isOpen={confirmModal.modalState.isOpen}
        title={confirmModal.modalState.title}
        message={confirmModal.modalState.message}
        type={confirmModal.modalState.type}
        onClose={confirmModal.closeModal}
        onConfirm={confirmModal.modalState.onConfirm}
        confirmText={confirmModal.modalState.confirmText}
      />

      <ConfirmModal
        isOpen={deleteModal.modalState.isOpen}
        title={deleteModal.modalState.title}
        message={deleteModal.modalState.message}
        type={deleteModal.modalState.type}
        confirmText={deleteModal.modalState.confirmText}
        onClose={deleteModal.closeModal}
        onConfirm={deleteModal.modalState.onConfirm}
      />
    </div>
  );
}

