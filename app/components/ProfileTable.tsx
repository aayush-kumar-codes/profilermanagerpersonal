'use client';

import { useState } from 'react';
import type { ProfileData } from '@/lib/types/profile';
import { generateProfilePDF } from '@/lib/utils/pdfGenerator';

interface ProfileTableProps {
  profiles: ProfileData[];
  onEdit: (profile: ProfileData) => void;
  onDelete: (id: string) => void;
}

export default function ProfileTable({ profiles, onEdit, onDelete }: ProfileTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(profiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProfiles = profiles.slice(startIndex, endIndex);

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  const handleView = (id: string) => {
    window.open(`/portfolio/${id}`, '_blank');
  };

  const handleDownload = async (id: string) => {
    const profile = profiles.find(p => p._id === id);
    if (profile) {
      setIsDownloading(id);
      try {
        await generateProfilePDF(profile);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
      } finally {
        setTimeout(() => setIsDownloading(null), 500);
      }
    }
  };

  const handleShare = async (id: string) => {
    setIsSharing(id);
    try {
      const fullUrl = `${window.location.origin}/portfolio/${id}`;
      const apiToken = process.env.NEXT_PUBLIC_TINYURL_API_TOKEN;
      
      if (!apiToken) {
        console.error('TinyURL API token is not configured');
        alert('Share feature is not configured. Please contact support.');
        setIsSharing(null);
        return;
      }
      
      const response = await fetch('https://api.tinyurl.com/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: fullUrl,
          domain: 'tinyurl.com',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.tiny_url) {
          setShareUrl(data.data.tiny_url);
          setShowShareModal(true);
        } else {
          throw new Error('Invalid response from TinyURL API');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate TinyURL');
      }
    } catch (error: any) {
      console.error('Error generating share link:', error);
      alert(`Error generating share link: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSharing(null);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) {
      alert('No URL to copy. Please try sharing again.');
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
      setShowShareModal(false);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          alert('Link copied to clipboard!');
          setShowShareModal(false);
        } else {
          alert('Failed to copy link. Please try again.');
        }
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        alert('Failed to copy link. Please copy manually.');
      }
    }
  };

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="profile-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Profile</th>
              <th>Email</th>
              <th>Experience</th>
              <th>Education</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProfiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">
                  <div>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p>No profiles found</p>
                    <span>Add your first profile to get started</span>
                  </div>
                </td>
              </tr>
            ) : (
              currentProfiles.map((profile, index) => (
                <tr key={profile._id}>
                  <td>{startIndex + index + 1}</td>
                  <td>
                    <div className="profile-cell">
                      <div className="profile-avatar">
                        {(profile.profileImage || profile.personal?.avatar?.url) ? (
                          <img 
                            src={profile.profileImage || profile.personal?.avatar?.url || ''} 
                            alt={profile.name || profile.personal?.name || 'Profile'} 
                          />
                        ) : (
                          <span>{(profile.name || profile.personal?.name || 'U').charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="profile-info">
                        <div className="profile-name">{profile.name || profile.personal?.name || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{profile.email || profile.personal?.email || 'N/A'}</td>
                  <td>
                    {profile.experience && profile.experience.length > 0 
                      ? `${profile.experience.length} ${profile.experience.length === 1 ? 'entry' : 'entries'}`
                      : 'Not specified'}
                  </td>
                  <td>
                    {profile.education && profile.education.length > 0
                      ? `${profile.education.length} ${profile.education.length === 1 ? 'entry' : 'entries'}`
                      : 'Not specified'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view"
                        onClick={() => handleView(profile._id!)}
                        title="View Portfolio"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M1 8C1 8 3.66667 2.66667 8 2.66667C12.3333 2.66667 15 8 15 8C15 8 12.3333 13.3333 8 13.3333C3.66667 13.3333 1 8 1 8Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        className="action-btn share"
                        onClick={() => handleShare(profile._id!)}
                        title="Share Portfolio"
                        disabled={isSharing === profile._id}
                      >
                        {isSharing === profile._id ? (
                          <div className="btn-spinner"></div>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M12 5.33333C13.1046 5.33333 14 4.43792 14 3.33333C14 2.22876 13.1046 1.33333 12 1.33333C10.8954 1.33333 10 2.22876 10 3.33333C10 4.43792 10.8954 5.33333 12 5.33333Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M4 10C5.10457 10 6 9.10457 6 8C6 6.89543 5.10457 6 4 6C2.89543 6 2 6.89543 2 8C2 9.10457 2.89543 10 4 10Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 14.6667C13.1046 14.6667 14 13.7712 14 12.6667C14 11.5621 13.1046 10.6667 12 10.6667C10.8954 10.6667 10 11.5621 10 12.6667C10 13.7712 10.8954 14.6667 12 14.6667Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5.72668 8.94L10.28 11.7267"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10.2733 4.27333L5.72668 7.06"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        className="action-btn download"
                        onClick={() => handleDownload(profile._id!)}
                        title="Download PDF"
                        disabled={isDownloading === profile._id}
                      >
                        {isDownloading === profile._id ? (
                          <div className="btn-spinner"></div>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M4.66667 6.66667L8 10M8 10L11.3333 6.66667M8 10V2"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        className="action-btn edit"
                        onClick={() => onEdit(profile)}
                        title="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M11.3333 2.00004C11.5084 1.82494 11.7163 1.68605 11.9451 1.59129C12.1739 1.49653 12.4191 1.44775 12.6667 1.44775C12.9142 1.44775 13.1594 1.49653 13.3882 1.59129C13.617 1.68605 13.8249 1.82494 14 2.00004C14.1751 2.17513 14.314 2.383 14.4088 2.61178C14.5035 2.84055 14.5523 3.08575 14.5523 3.33337C14.5523 3.58099 14.5035 3.82619 14.4088 4.05496C14.314 4.28374 14.1751 4.49161 14 4.66671L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00004Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(profile._id!)}
                        title="Delete"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M2 4H3.33333H14M5.33333 4V2.66667C5.33333 2.31304 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31304 1.33333 6.66667 1.33333H9.33333C9.68696 1.33333 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31304 10.6667 2.66667V4M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2761 14.2761C12.0261 14.5262 11.687 14.6667 11.3333 14.6667H4.66667C4.31304 14.6667 3.97391 14.5262 3.72386 14.2761C3.47381 14.0261 3.33333 13.687 3.33333 13.3333V4H12.6667Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {profiles.length > 0 && (
        <div className="table-footer">
          <div className="table-info">
            Showing {startIndex + 1}-{Math.min(endIndex, profiles.length)} of {profiles.length} profiles
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="page-number">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="page-btn"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>Share Profile</h3>
              <button className="modal-close" onClick={() => setShowShareModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="share-modal-body">
              <p>Share this portfolio with others using the link below:</p>
              <div className="share-url-box">
                <input 
                  type="text" 
                  value={shareUrl} 
                  readOnly 
                  className="share-url-input"
                />
                <button className="btn-primary" onClick={copyToClipboard}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M13.3333 6H7.33333C6.59695 6 6 6.59695 6 7.33333V13.3333C6 14.0697 6.59695 14.6667 7.33333 14.6667H13.3333C14.0697 14.6667 14.6667 14.0697 14.6667 13.3333V7.33333C14.6667 6.59695 14.0697 6 13.3333 6Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3.33333 10H2.66667C2.31304 10 1.97391 9.85952 1.72386 9.60947C1.47381 9.35942 1.33333 9.02028 1.33333 8.66667V2.66667C1.33333 2.31304 1.47381 1.97391 1.72386 1.72386C1.97391 1.47381 2.31304 1.33333 2.66667 1.33333H8.66667C9.02029 1.33333 9.35943 1.47381 9.60948 1.72386C9.85952 1.97391 10 2.31304 10 2.66667V3.33333"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

