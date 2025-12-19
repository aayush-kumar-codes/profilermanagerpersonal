'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/utils/api';
import ProjectModal, { ProjectLibraryData } from '../../components/ProjectModal';
import ConfirmModal from '../../components/ConfirmModal';
import { useConfirmModal } from '@/lib/hooks/useConfirmModal';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectLibraryData[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectLibraryData[]>([]);
  const [techStacks, setTechStacks] = useState<string[]>([]);
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectLibraryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const confirmModal = useConfirmModal();
  const deleteModal = useConfirmModal();

  useEffect(() => {
    fetchProjects();
    fetchTechStacks();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [selectedTech, projects]);

  const fetchProjects = async () => {
    const [projectsResponse, profilesResponse] = await Promise.all([
      api.get<{ projects: ProjectLibraryData[] }>('/api/projects'),
      api.get<{ profiles: any[] }>('/api/profiles')
    ]);
    
    const allProjects: ProjectLibraryData[] = [];
    const projectUsage: Map<string, string[]> = new Map();
    
    if (profilesResponse.data) {
      profilesResponse.data.profiles.forEach((profile: any) => {
        if (profile.projects && Array.isArray(profile.projects)) {
          profile.projects.forEach((project: any) => {
            if (project._id) {
              const profiles = projectUsage.get(project._id) || [];
              profiles.push(profile.name || 'Unknown Profile');
              projectUsage.set(project._id, profiles);
            }
          });
        }
      });
    }
    
    if (projectsResponse.data) {
      const projectsWithUsage = projectsResponse.data.projects.map(p => ({
        ...p,
        profileNames: projectUsage.get(p._id || '') || []
      }));
      allProjects.push(...projectsWithUsage);
    }
    
    setProjects(allProjects);
    setFilteredProjects(allProjects);
    setIsLoading(false);
  };

  const fetchTechStacks = async () => {
    const { data } = await api.get<{ techStacks: string[] }>('/api/projects/techstacks');
    if (data) {
      setTechStacks(data.techStacks);
    }
  };

  const filterProjects = () => {
    if (selectedTech === 'all') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(
        projects.filter(p => 
          p.technologies && p.technologies.split(',').map(t => t.trim()).includes(selectedTech)
        )
      );
    }
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: ProjectLibraryData) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = (id: string) => {
    const project = projects.find(p => p._id === id);
    const profileCount = project?.profileNames?.length || 0;
    const message = profileCount > 0
      ? `This project is used in ${profileCount} profile${profileCount > 1 ? 's' : ''}. Deleting it will remove it from all profiles. This action cannot be undone.`
      : 'Are you sure you want to delete this project? This action cannot be undone.';
    
    deleteModal.showWarning(
      message,
      () => confirmDeleteProject(id),
      'Delete Project',
      'Delete'
    );
  };

  const confirmDeleteProject = async (id: string) => {
    deleteModal.closeModal();
    
    const { data, error } = await api.delete(`/api/projects/${id}`);
    
    if (data) {
      setProjects((prev) => prev.filter((p) => p._id !== id));
      confirmModal.showSuccess('Project deleted successfully', 'Deleted');
      fetchTechStacks();
    } else {
      confirmModal.showError(error || 'Failed to delete project');
    }
  };

  const handleSubmitProject = async (projectData: ProjectLibraryData) => {
    const isEditing = !!editingProject;
    const endpoint = isEditing ? `/api/projects/${editingProject._id}` : '/api/projects';
    
    const { data, error } = isEditing
      ? await api.put<{ project: ProjectLibraryData }>(endpoint, projectData)
      : await api.post<{ project: ProjectLibraryData }>(endpoint, projectData);

    if (data) {
      if (isEditing) {
        setProjects((prev) =>
          prev.map((p) => (p._id === data.project._id ? data.project : p))
        );
      } else {
        setProjects((prev) => [data.project, ...prev]);
      }
      setIsModalOpen(false);
      setEditingProject(null);
      confirmModal.showSuccess(
        `Project ${isEditing ? 'updated' : 'added to library'} successfully`
      );
      fetchTechStacks();
    } else {
      confirmModal.showError(error || 'Failed to save project');
    }
  };

  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return '';
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return '';
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
          <h1 className="dashboard-title">Projects</h1>
          <p className="dashboard-subtitle">Central management - edit once, updates everywhere</p>
        </div>
        <button className="btn-primary" onClick={handleAddProject}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 4V16M4 10H16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Add Project
        </button>
      </div>

      {techStacks.length > 0 && (
        <div className="filter-section">
          <label className="filter-label">Filter by Tech Stack:</label>
          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Technologies</option>
            {techStacks.map((tech) => (
              <option key={tech} value={tech}>
                {tech}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="projects-grid-container">
        {filteredProjects.length === 0 ? (
          <div className="empty-state-card">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p>No projects yet</p>
            <span>Add projects here and reuse them across profiles</span>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div key={project._id} className="project-card-item">
              <div className="project-card-header">
                <div>
                  <h3 className="project-card-title">{project.name}</h3>
                  {project.profileNames && project.profileNames.length > 0 && (
                    <span className="project-usage-badge">
                      📊 Used in {project.profileNames.length} profile{project.profileNames.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="project-card-actions">
                  <button
                    className="action-btn edit"
                    onClick={() => handleEditProject(project)}
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
                    onClick={() => handleDeleteProject(project._id!)}
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
              </div>
              
              <p className="project-card-description">{project.description}</p>
              
              {project.technologies && (
                <div className="project-card-tech">
                  {project.technologies.split(',').map((tech, i) => (
                    <span key={i} className="tech-badge">{tech.trim()}</span>
                  ))}
                </div>
              )}

              {(project.startDate || project.endDate) && (
                <div className="project-card-date">
                  📅 {formatDate(project.startDate)} {project.endDate && `- ${formatDate(project.endDate)}`}
                </div>
              )}
              
              {(project.link || project.github) && (
                <div className="project-card-links">
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.3333 8.66667V13.3333C13.3333 13.687 13.1928 14.0261 12.9428 14.2761C12.6927 14.5262 12.3536 14.6667 12 14.6667H2.66667C2.31304 14.6667 1.97391 14.5262 1.72386 14.2761C1.47381 14.0261 1.33333 13.687 1.33333 13.3333V4C1.33333 3.64638 1.47381 3.30724 1.72386 3.05719C1.97391 2.80714 2.31304 2.66667 2.66667 2.66667H7.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M11.3333 1.33333H14.6666V4.66666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.66666 9.33333L14.6667 1.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Live Demo
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                      </svg>
                      GitHub
                    </a>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleSubmitProject}
        project={editingProject}
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
