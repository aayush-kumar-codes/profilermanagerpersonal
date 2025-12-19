'use client';

import { useState, useEffect, useRef } from 'react';
import type { 
  ProfileData, 
  Education, 
  Experience, 
  Project, 
  Skill, 
  Certification 
} from '@/lib/types/profile';
import { getAccessToken } from '@/lib/auth';
import ConfirmModal from './ConfirmModal';

const formatDate = (date: any): string => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (profileData: ProfileData) => void;
  profile?: ProfileData | null;
}

export default function ProfileModalNew({ isOpen, onClose, onSubmit, profile }: ProfileModalProps) {
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [libraryProjects, setLibraryProjects] = useState<any[]>([]);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const handleCloseClick = () => {
    setShowConfirmClose(true);
  };

  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowConfirmClose(false);
  };
  
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    bio: '',
    designation: '',
    location: '',
    website: '',
    profileImage: '',
    github: '',
    linkedin: '',
    twitter: '',
    education: [],
    experience: [],
    projects: [],
    projectIds: [],
    skills: [],
    certification: [],
  });

  useEffect(() => {
    if (profile) {
      let projectIds: string[] = [];
      
      if (profile.projectIds && Array.isArray(profile.projectIds)) {
        projectIds = profile.projectIds.map((id: any) => {
          if (typeof id === 'string') return id;
          if (id?._id) return typeof id._id === 'string' ? id._id : id._id.toString();
          return id?.toString() || '';
        }).filter(Boolean);
      } else if (profile.projects && Array.isArray(profile.projects)) {
        projectIds = profile.projects.map((proj: any) => {
          if (proj._id) return typeof proj._id === 'string' ? proj._id : proj._id.toString();
          return '';
        }).filter(Boolean);
      }
      
      setFormData({
        _id: profile._id,
        name: profile.personal?.name || profile.name || '',
        email: profile.personal?.email || profile.email || '',
        phone: profile.personal?.phone || profile.phone || '',
        bio: profile.personal?.bio || profile.bio || '',
        designation: profile.personal?.designation || profile.designation || '',
        location: profile.personal?.location || profile.location || '',
        website: profile.personal?.website || profile.website || '',
        profileImage: profile.personal?.avatar?.url || profile.profileImage || '',
        github: profile.personal?.github || profile.github || '',
        linkedin: profile.personal?.linkedin || profile.linkedin || '',
        twitter: profile.personal?.twitter || profile.twitter || '',
        education: (profile.education || []).map((edu: any) => ({
          ...edu,
          startDate: formatDate(edu.startDate),
          endDate: formatDate(edu.endDate),
        })),
        experience: (profile.experience || []).map((exp: any) => ({
          ...exp,
          startDate: formatDate(exp.startDate),
          endDate: formatDate(exp.endDate),
        })),
        projects: (profile.projects || []).map((proj: any) => ({
          ...proj,
          startDate: formatDate(proj.startDate),
          endDate: formatDate(proj.endDate),
        })),
        projectIds: projectIds,
        skills: profile.skills || [],
        certification: (profile.certification || []).map((cert: any) => ({
          ...cert,
          issueDate: formatDate(cert.issueDate),
        })),
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        bio: '',
        designation: '',
        location: '',
        website: '',
        profileImage: '',
        github: '',
        linkedin: '',
        twitter: '',
        education: [],
        experience: [],
        projects: [],
        projectIds: [],
        skills: [],
        certification: [],
      });
    }
  }, [profile, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchLibraryProjects();
    }
  }, [isOpen]);

  const fetchLibraryProjects = async () => {
    try {
      const token = getAccessToken();
      const response = await fetch('/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setLibraryProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching library projects:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const token = getAccessToken();
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, profileImage: data.url }));
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: any = {
      _id: formData._id,
      personal: {
        name: formData.name || '',
        avatar: formData.profileImage ? { url: formData.profileImage } : {},
        bio: formData.bio || '',
        designation: formData.designation || '',
        location: formData.location || '',
        website: formData.website || '',
        email: formData.email || '',
        phone: formData.phone || '',
        github: formData.github || '',
        linkedin: formData.linkedin || '',
        twitter: formData.twitter || '',
      },
      education: formData.education || [],
      experience: formData.experience || [],
      projects: formData.projects || [],
      projectIds: formData.projectIds || [],
      skills: formData.skills || [],
      certification: formData.certification || [],
    };
    
    onSubmit(submitData);
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        grade: '',
        description: '',
        order: prev.education.length,
      }],
    }));
  };

  const removeEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [...prev.experience, {
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
        technologies: '',
        order: prev.experience.length,
      }],
    }));
  };

  const removeExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const addProject = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [...prev.projects, {
        name: '',
        description: '',
        link: '',
        github: '',
        technologies: '',
        startDate: '',
        endDate: '',
        order: prev.projects.length,
      }],
    }));
  };

  const loadProjectFromLibrary = (projectId: string) => {
    const selectedProject = libraryProjects.find(p => p._id === projectId);
    if (selectedProject && !formData.projectIds.includes(projectId)) {
      setFormData((prev) => ({
        ...prev,
        projectIds: [...prev.projectIds, projectId],
        projects: [...prev.projects, {
          ...selectedProject,
          startDate: formatDate(selectedProject.startDate),
          endDate: formatDate(selectedProject.endDate),
          order: prev.projects.length,
        }],
      }));
    }
  };

  const removeProject = (index: number) => {
    setFormData((prev) => {
      const removedProject = prev.projects[index];
      const newProjectIds = removedProject._id 
        ? prev.projectIds.filter(id => id !== removedProject._id)
        : prev.projectIds;
      
      return {
        ...prev,
        projects: prev.projects.filter((_, i) => i !== index),
        projectIds: newProjectIds,
      };
    });
  };

  const updateProject = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.map((proj, i) => 
        i === index ? { ...proj, [field]: value } : proj
      ),
    }));
  };

  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, {
        header: '',
        skills: '',
        order: prev.skills.length,
      }],
    }));
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const updateSkill = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      ),
    }));
  };

  const addCertification = () => {
    setFormData((prev) => ({
      ...prev,
      certification: [...prev.certification, {
        name: '',
        issuer: '',
        issueDate: '',
        order: prev.certification.length,
      }],
    }));
  };

  const removeCertification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      certification: prev.certification.filter((_, i) => i !== index),
    }));
  };

  const updateCertification = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      certification: prev.certification.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      ),
    }));
  };

  if (!isOpen) return null;

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: '👤' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'experience', name: 'Experience', icon: '💼' },
    { id: 'projects', name: 'Projects', icon: '🚀' },
    { id: 'skills', name: 'Skills', icon: '⚡' },
    { id: 'certification', name: 'Certifications', icon: '📜' },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={handleCloseClick}>
        <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{profile ? 'Edit Profile' : 'Add New Profile'}</h2>
            <button className="modal-close" onClick={handleCloseClick} type="button">
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body-tabs">
            <div className="modal-tabs">
              {sections.map((section) => (
                <button
                  key={section.id}
                  className={`tab-btn ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                  type="button"
                >
                  <span className="tab-icon">{section.icon}</span>
                  <span className="tab-name">{section.name}</span>
                </button>
              ))}
            </div>

            <div className="modal-form-tabs">
            {activeSection === 'personal' && (
              <div className="tab-content">
                <h3 className="section-title">Personal Information</h3>
                
                {/* Profile Image Upload - Top Section */}
                <div className="profile-image-section">
                  <label className="form-label">Profile Image</label>
                  <div className="profile-image-upload">
                    <div className="profile-image-preview">
                      {formData.profileImage ? (
                        <img src={formData.profileImage} alt="Profile" />
                      ) : (
                        <div className="profile-image-placeholder">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                      {isUploading && (
                        <div className="upload-overlay-modal">
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
                      className="btn-upload"
                      onClick={handleImageClick}
                      disabled={isUploading}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {isUploading ? 'Uploading...' : formData.profileImage ? 'Change Image' : 'Upload Image'}
                    </button>
                  </div>
                </div>

                {/* Personal Information Fields */}
                <div className="modal-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="email@example.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Software Engineer"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="City, Country"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">GitHub</label>
                    <input
                      type="url"
                      name="github"
                      value={formData.github}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">LinkedIn</label>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Twitter</label>
                    <input
                      type="url"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="https://twitter.com/username"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Write a short bio..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'education' && (
              <div className="tab-content">
                <div className="section-header">
                  <h3 className="section-title">Education</h3>
                  <button type="button" className="btn-add" onClick={addEducation}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Add Education
                  </button>
                </div>

                {formData.education.map((edu, index) => (
                  <div key={index} className="array-item">
                    <div className="array-item-header">
                      <h4>Education #{index + 1}</h4>
                      <button type="button" className="btn-remove" onClick={() => removeEducation(index)}>
                        Remove
                      </button>
                    </div>
                    <div className="modal-grid">
                      <div className="form-group">
                        <label className="form-label">Institution *</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          className="form-input"
                          placeholder="University name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Degree *</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          className="form-input"
                          placeholder="Bachelor of Science"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Field of Study *</label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
                          className="form-input"
                          placeholder="Computer Science"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Grade</label>
                        <input
                          type="text"
                          value={edu.grade || ''}
                          onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                          className="form-input"
                          placeholder="9/10 or 3.8 GPA"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Start Date *</label>
                        <input
                          type="date"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                          className="form-input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">End Date</label>
                        <input
                          type="date"
                          value={edu.endDate || ''}
                          onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group full-width">
                        <label className="form-label">Description</label>
                        <textarea
                          value={edu.description || ''}
                          onChange={(e) => updateEducation(index, 'description', e.target.value)}
                          className="form-input"
                          placeholder="Course details, achievements..."
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {formData.education.length === 0 && (
                  <div className="empty-section">
                    <p>No education added yet. Click "Add Education" to get started.</p>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'experience' && (
              <div className="tab-content">
                <div className="section-header">
                  <h3 className="section-title">Experience</h3>
                  <button type="button" className="btn-add" onClick={addExperience}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Add Experience
                  </button>
                </div>

                {formData.experience.map((exp, index) => (
                  <div key={index} className="array-item">
                    <div className="array-item-header">
                      <h4>Experience #{index + 1}</h4>
                      <button type="button" className="btn-remove" onClick={() => removeExperience(index)}>
                        Remove
                      </button>
                    </div>
                    <div className="modal-grid">
                      <div className="form-group">
                        <label className="form-label">Company *</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          className="form-input"
                          placeholder="Company name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Position *</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateExperience(index, 'position', e.target.value)}
                          className="form-input"
                          placeholder="Job title"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Location *</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => updateExperience(index, 'location', e.target.value)}
                          className="form-input"
                          placeholder="City, Country"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Technologies</label>
                        <input
                          type="text"
                          value={exp.technologies}
                          onChange={(e) => updateExperience(index, 'technologies', e.target.value)}
                          className="form-input"
                          placeholder="React, Node.js, MongoDB..."
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Start Date *</label>
                        <input
                          type="date"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                          className="form-input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">End Date (Leave empty if current)</label>
                        <input
                          type="date"
                          value={exp.endDate || ''}
                          onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group full-width">
                        <label className="form-label">Description *</label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                          className="form-input"
                          placeholder="Key responsibilities and achievements..."
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {formData.experience.length === 0 && (
                  <div className="empty-section">
                    <p>No experience added yet. Click "Add Experience" to get started.</p>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'projects' && (
              <div className="tab-content">
                <div className="section-header">
                  <h3 className="section-title">Projects</h3>
                  <div className="section-header-actions">
                    {libraryProjects.length > 0 && (
                      <select 
                        className="library-select"
                        onChange={(e) => {
                          if (e.target.value) {
                            loadProjectFromLibrary(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Load from Library</option>
                        {libraryProjects
                          .filter(libProj => {
                            if (!libProj._id) return true;
                            const libProjId = typeof libProj._id === 'string' ? libProj._id : String(libProj._id);
                            return !formData.projectIds.some(pid => {
                              const formProjId = typeof pid === 'string' ? pid : String(pid);
                              return formProjId === libProjId;
                            });
                          })
                          .map(libProj => (
                            <option key={libProj._id} value={libProj._id}>
                              {libProj.name}
                            </option>
                          ))}
                      </select>
                    )}
                    <button type="button" className="btn-add" onClick={addProject}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Add Project
                    </button>
                  </div>
                </div>

                {formData.projects.map((proj, index) => (
                  <div key={index} className="array-item">
                    <div className="array-item-header">
                      <h4>Project #{index + 1}</h4>
                      <button type="button" className="btn-remove" onClick={() => removeProject(index)}>
                        Remove
                      </button>
                    </div>
                    <div className="modal-grid">
                      <div className="form-group">
                        <label className="form-label">Project Name *</label>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => updateProject(index, 'name', e.target.value)}
                          className="form-input"
                          placeholder="Project name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Technologies *</label>
                        <input
                          type="text"
                          value={proj.technologies}
                          onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                          className="form-input"
                          placeholder="React, Python, AWS..."
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Project Link</label>
                        <input
                          type="url"
                          value={proj.link || ''}
                          onChange={(e) => updateProject(index, 'link', e.target.value)}
                          className="form-input"
                          placeholder="https://project.com"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">GitHub Repository</label>
                        <input
                          type="url"
                          value={proj.github || ''}
                          onChange={(e) => updateProject(index, 'github', e.target.value)}
                          className="form-input"
                          placeholder="https://github.com/user/repo"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Start Date *</label>
                        <input
                          type="date"
                          value={proj.startDate}
                          onChange={(e) => updateProject(index, 'startDate', e.target.value)}
                          className="form-input"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">End Date</label>
                        <input
                          type="date"
                          value={proj.endDate || ''}
                          onChange={(e) => updateProject(index, 'endDate', e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group full-width">
                        <label className="form-label">Description *</label>
                        <textarea
                          value={proj.description}
                          onChange={(e) => updateProject(index, 'description', e.target.value)}
                          className="form-input"
                          placeholder="Project details, impact, achievements..."
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {formData.projects.length === 0 && (
                  <div className="empty-section">
                    <p>No projects added yet. Click "Add Project" to get started.</p>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'skills' && (
              <div className="tab-content">
                <div className="section-header">
                  <h3 className="section-title">Skills</h3>
                  <button type="button" className="btn-add" onClick={addSkill}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Add Skill Category
                  </button>
                </div>

                {formData.skills.map((skill, index) => (
                  <div key={index} className="array-item">
                    <div className="array-item-header">
                      <h4>Skill Category #{index + 1}</h4>
                      <button type="button" className="btn-remove" onClick={() => removeSkill(index)}>
                        Remove
                      </button>
                    </div>
                    <div className="modal-grid">
                      <div className="form-group">
                        <label className="form-label">Category Header *</label>
                        <input
                          type="text"
                          value={skill.header}
                          onChange={(e) => updateSkill(index, 'header', e.target.value)}
                          className="form-input"
                          placeholder="e.g., Programming Languages"
                          required
                        />
                      </div>
                      <div className="form-group full-width">
                        <label className="form-label">Skills (comma separated) *</label>
                        <textarea
                          value={skill.skills}
                          onChange={(e) => updateSkill(index, 'skills', e.target.value)}
                          className="form-input"
                          placeholder="JavaScript, Python, React, Node.js..."
                          rows={2}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {formData.skills.length === 0 && (
                  <div className="empty-section">
                    <p>No skills added yet. Click "Add Skill Category" to get started.</p>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'certification' && (
              <div className="tab-content">
                <div className="section-header">
                  <h3 className="section-title">Certifications</h3>
                  <button type="button" className="btn-add" onClick={addCertification}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Add Certification
                  </button>
                </div>

                {formData.certification.map((cert, index) => (
                  <div key={index} className="array-item">
                    <div className="array-item-header">
                      <h4>Certification #{index + 1}</h4>
                      <button type="button" className="btn-remove" onClick={() => removeCertification(index)}>
                        Remove
                      </button>
                    </div>
                    <div className="modal-grid">
                      <div className="form-group">
                        <label className="form-label">Certification Name *</label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => updateCertification(index, 'name', e.target.value)}
                          className="form-input"
                          placeholder="Certification name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Issuer *</label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                          className="form-input"
                          placeholder="Issuing organization"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Issue Date *</label>
                        <input
                          type="date"
                          value={cert.issueDate}
                          onChange={(e) => updateCertification(index, 'issueDate', e.target.value)}
                          className="form-input"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {formData.certification.length === 0 && (
                  <div className="empty-section">
                    <p>No certifications added yet. Click "Add Certification" to get started.</p>
                  </div>
                )}
              </div>
            )}

            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleCloseClick}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {profile ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmModal
      isOpen={showConfirmClose}
      title="Discard Changes?"
      message="Are you sure you want to close this modal? Any unsaved changes will be lost."
      type="warning"
      onClose={handleCancelClose}
      onConfirm={handleConfirmClose}
      confirmText="Discard"
    />
    </>
  );
}

