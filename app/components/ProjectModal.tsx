'use client';

import { useState, useEffect } from 'react';

export interface ProjectLibraryData {
  _id?: string;
  name: string;
  description: string;
  technologies: string;
  link?: string;
  github?: string;
  startDate?: string;
  endDate?: string;
  profileNames?: string[];
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: ProjectLibraryData) => void;
  project?: ProjectLibraryData | null;
}

export default function ProjectModal({ isOpen, onClose, onSubmit, project }: ProjectModalProps) {
  const [formData, setFormData] = useState<ProjectLibraryData>({
    name: '',
    description: '',
    technologies: '',
    link: '',
    github: '',
    startDate: '',
    endDate: '',
  });

  const formatDateForInput = (date: string | Date | undefined): string => {
    if (!date) return '';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return '';
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (project) {
      setFormData({
        _id: project._id,
        name: project.name || '',
        description: project.description || '',
        technologies: project.technologies || '',
        link: project.link || '',
        github: project.github || '',
        startDate: formatDateForInput(project.startDate),
        endDate: formatDateForInput(project.endDate),
      });
    } else {
      setFormData({
        name: '',
        description: '',
        technologies: '',
        link: '',
        github: '',
        startDate: '',
        endDate: '',
      });
    }
  }, [project, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.technologies.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="project-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="project-modal-header">
          <div>
            <h2>{project ? 'Edit Project' : 'Add Project'}</h2>
            <p className="project-modal-subtitle">Create reusable templates for profiles</p>
          </div>
          <button className="project-modal-close" onClick={onClose}>
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

        <form onSubmit={handleSubmit} className="project-modal-form">
          <div className="project-modal-body">
            <div className="project-form-section">
              <h3 className="project-section-title">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M17.5 13.3333V6.66667C17.4997 6.43273 17.4423 6.20234 17.3329 5.99263C17.2235 5.78293 17.0653 5.6028 16.8708 5.46667L10.8708 1.89167C10.6766 1.75537 10.4509 1.68359 10.2208 1.68359C9.99075 1.68359 9.76506 1.75537 9.57082 1.89167L3.57082 5.46667C3.37638 5.6028 3.21813 5.78293 3.10871 5.99263C2.99928 6.20234 2.94189 6.43273 2.94165 6.66667V13.3333C2.94189 13.5673 2.99928 13.7977 3.10871 14.0074C3.21813 14.2171 3.37638 14.3972 3.57082 14.5333L9.57082 18.1083C9.76506 18.2446 9.99075 18.3164 10.2208 18.3164C10.4509 18.3164 10.6766 18.2446 10.8708 18.1083L16.8708 14.5333C17.0653 14.3972 17.2235 14.2171 17.3329 14.0074C17.4423 13.7977 17.4997 13.5673 17.5 13.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.72915 5.80835L10.2208 10.0084L17.7125 5.80835" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10.2208 18.4V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Project Details
              </h3>
              
              <div className="project-modal-grid">
                <div className="project-form-group project-full-width">
                  <label className="project-form-label">Project Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="project-form-input"
                    placeholder="e.g., E-Commerce Platform"
                    required
                  />
                </div>

                <div className="project-form-group project-full-width">
                  <label className="project-form-label">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="project-form-input"
                    placeholder="Describe your project, its features, and impact..."
                    rows={5}
                    required
                  />
                </div>

                <div className="project-form-group project-full-width">
                  <label className="project-form-label">Technologies * (comma-separated)</label>
                  <input
                    type="text"
                    name="technologies"
                    value={formData.technologies}
                    onChange={handleChange}
                    className="project-form-input"
                    placeholder="React, Node.js, MongoDB, AWS"
                    required
                  />
                  <small className="project-form-hint">Separate technologies with commas</small>
                </div>
              </div>
            </div>

            <div className="project-form-section">
              <h3 className="project-section-title">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M16.6667 8.33333V13.3333C16.6667 13.687 16.5262 14.0261 16.2761 14.2761C16.0261 14.5262 15.687 14.6667 15.3333 14.6667H3.33333C2.97971 14.6667 2.64057 14.5262 2.39052 14.2761C2.14048 14.0261 2 13.687 2 13.3333V5C2 4.64638 2.14048 4.30724 2.39052 4.05719C2.64057 3.80714 2.97971 3.66667 3.33333 3.66667H9.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14.1667 1.66667H17.5V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8.33334 10L17.5 1.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Links & Timeline
              </h3>
              
              <div className="project-modal-grid">
                <div className="project-form-group">
                  <label className="project-form-label">Project URL</label>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    className="project-form-input"
                    placeholder="https://your-project.com"
                  />
                </div>

                <div className="project-form-group">
                  <label className="project-form-label">GitHub Repository</label>
                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    className="project-form-input"
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                <div className="project-form-group">
                  <label className="project-form-label">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="project-form-input"
                  />
                </div>

                <div className="project-form-group">
                  <label className="project-form-label">End Date (Leave empty if ongoing)</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="project-form-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="project-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M15 4.5L6.75 12.75L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {project ? 'Update' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

