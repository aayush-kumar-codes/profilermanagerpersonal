'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { ProfileData } from '@/lib/types/profile';

export default function PortfolioViewPage() {
  const params = useParams();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const id = params.id as string;
      try {
        const response = await fetch(`/api/public/portfolio/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
        } else {
          console.error('Error fetching profile:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
      setIsLoading(false);
    };

    if (params.id) {
      fetchProfile();
    }
  }, [params.id]);

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Present';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="portfolio-container">
        <div className="portfolio-loading">
          <div className="loading-spinner"></div>
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="portfolio-container">
        <div className="portfolio-error">
          <h2>Profile not found</h2>
          <p>The profile you are looking for does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const personal = profile.personal as any || {};
  const name = personal.name || profile.name || 'N/A';
  const email = personal.email || profile.email || '';
  const phone = personal.phone || profile.phone || '';
  const avatar = personal.avatar?.url || profile.profileImage || '';
  const bio = personal.bio || profile.bio || '';
  const designation = personal.designation || profile.designation || '';
  const location = personal.location || profile.location || '';
  const website = personal.website || profile.website || '';
  const github = personal.github || profile.github || '';
  const linkedin = personal.linkedin || profile.linkedin || '';
  const twitter = personal.twitter || profile.twitter || '';

  return (
    <div className="portfolio-container" id="portfolio-content">
      {/* Portfolio Content */}
      <div className="portfolio-content">
        {/* Hero Section */}
        <div className="portfolio-hero">
          <div className="portfolio-hero-bg"></div>
          <div className="portfolio-hero-content">
            <div className="portfolio-avatar">
              {avatar ? (
                <img src={avatar} alt={name} />
              ) : (
                <div className="portfolio-avatar-placeholder">
                  <span>{name.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <h1 className="portfolio-name">{name}</h1>
            {designation && <p className="portfolio-designation">{designation}</p>}
            {location && (
              <p className="portfolio-location">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 6.66667C14 11.3333 8 15.3333 8 15.3333C8 15.3333 2 11.3333 2 6.66667C2 5.07536 2.63214 3.54926 3.75736 2.42403C4.88258 1.29881 6.40869 0.666668 8 0.666668C9.59131 0.666668 11.1174 1.29881 12.2426 2.42403C13.3679 3.54926 14 5.07536 14 6.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 8.66667C9.10457 8.66667 10 7.77124 10 6.66667C10 5.5621 9.10457 4.66667 8 4.66667C6.89543 4.66667 6 5.5621 6 6.66667C6 7.77124 6.89543 8.66667 8 8.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {location}
              </p>
            )}
            <div className="portfolio-social-links">
              {email && (
                <a href={`mailto:${email}`} className="social-link" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3.33334 3.33334H16.6667C17.5833 3.33334 18.3333 4.08334 18.3333 5.00001V15C18.3333 15.9167 17.5833 16.6667 16.6667 16.6667H3.33334C2.41668 16.6667 1.66668 15.9167 1.66668 15V5.00001C1.66668 4.08334 2.41668 3.33334 3.33334 3.33334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.3333 5L10 10.8333L1.66666 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Email
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`} className="social-link">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M18.3333 14.1V16.6C18.3343 16.8321 18.2867 17.0618 18.1937 17.2745C18.1008 17.4871 17.9644 17.678 17.7934 17.8349C17.6224 17.9918 17.4205 18.1112 17.2006 18.1856C16.9808 18.26 16.7477 18.288 16.5167 18.2683C13.9524 17.9893 11.489 17.1117 9.32501 15.7083C7.31163 14.4289 5.60455 12.7218 4.32501 10.7083C2.91668 8.53438 2.03883 6.05916 1.76667 3.48334C1.74701 3.25292 1.77482 3.02046 1.84894 2.80109C1.92306 2.58172 2.04202 2.38035 2.19831 2.2096C2.3546 2.03885 2.54475 1.90259 2.75668 1.80962C2.9686 1.71665 3.19766 1.66894 3.42917 1.66917H5.92917C6.32936 1.66522 6.71678 1.80596 7.02421 2.06965C7.33164 2.33333 7.53954 2.69955 7.60917 3.10084C7.73914 3.9007 7.97144 4.68269 8.30001 5.42917C8.4092 5.6799 8.44908 5.95687 8.41563 6.22952C8.38218 6.50217 8.27676 6.76088 8.10834 6.97584L7.04167 8.04251C8.23655 10.1286 9.87144 11.7635 11.9575 12.9583L13.0242 11.8917C13.2391 11.7232 13.4978 11.6178 13.7705 11.5844C14.0431 11.5509 14.3201 11.5908 14.5708 11.7C15.3173 12.0286 16.0993 12.2609 16.8992 12.3908C17.3048 12.4611 17.6746 12.6726 17.9388 12.9849C18.203 13.2972 18.3415 13.6901 18.3333 14.1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Phone
                </a>
              )}
              {website && (
                <a href={website} className="social-link" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39762 1.66667 1.66666 5.39763 1.66666 10C1.66666 14.6024 5.39762 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1.66666 10H18.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 1.66667C12.0844 3.94863 13.269 6.91003 13.3333 10C13.269 13.09 12.0844 16.0514 10 18.3333C7.91558 16.0514 6.73104 13.09 6.66666 10C6.73104 6.91003 7.91558 3.94863 10 1.66667V1.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Website
                </a>
              )}
              {github && (
                <a href={github} className="social-link" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.165 20 14.418 20 10c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  GitHub
                </a>
              )}
              {linkedin && (
                <a href={linkedin} className="social-link" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M18.5195 0H1.47656C0.660156 0 0 0.644531 0 1.44141V18.5547C0 19.3516 0.660156 20 1.47656 20H18.5195C19.3359 20 20 19.3516 20 18.5586V1.44141C20 0.644531 19.3359 0 18.5195 0ZM5.93359 17.043H2.96484V7.49609H5.93359V17.043ZM4.44922 6.19531C3.49609 6.19531 2.72656 5.42578 2.72656 4.47656C2.72656 3.52734 3.49609 2.75781 4.44922 2.75781C5.39844 2.75781 6.16797 3.52734 6.16797 4.47656C6.16797 5.42188 5.39844 6.19531 4.44922 6.19531ZM17.043 17.043H14.0781V12.4023C14.0781 11.2969 14.0586 9.87109 12.5352 9.87109C10.9922 9.87109 10.7578 11.0781 10.7578 12.3242V17.043H7.79688V7.49609H10.6406V8.80078H10.6797C11.0742 8.05078 12.043 7.25781 13.4844 7.25781C16.4883 7.25781 17.043 9.23438 17.043 11.8047V17.043Z"/>
                  </svg>
                  LinkedIn
                </a>
              )}
              {twitter && (
                <a href={twitter} className="social-link" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"/>
                  </svg>
                  Twitter
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {bio && (
          <div className="portfolio-section">
            <h2 className="section-title">About Me</h2>
            <p className="portfolio-bio">{bio}</p>
          </div>
        )}

        {/* Experience Section */}
        {profile.experience && profile.experience.length > 0 && (
          <div className="portfolio-section">
            <h2 className="section-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Experience
            </h2>
            <div className="timeline">
              {profile.experience.map((exp, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h3>{exp.position}</h3>
                      <span className="timeline-date">
                        {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                      </span>
                    </div>
                    <div className="timeline-company">{exp.company} • {exp.location}</div>
                    <p className="timeline-description">{exp.description}</p>
                    {exp.technologies && (
                      <div className="timeline-tags">
                        {exp.technologies.split(',').map((tech, i) => (
                          <span key={i} className="tag">{tech.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {profile.education && profile.education.length > 0 && (
          <div className="portfolio-section">
            <h2 className="section-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 10V15C22 15.5304 21.7893 16.0391 21.4142 16.4142C21.0391 16.7893 20.5304 17 20 17H4C3.46957 17 2.96086 16.7893 2.58579 16.4142C2.21071 16.0391 2 15.5304 2 15V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 5H2L12 13L22 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 19H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Education
            </h2>
            <div className="timeline">
              {profile.education.map((edu, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h3>{edu.degree}</h3>
                      <span className="timeline-date">
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </span>
                    </div>
                    <div className="timeline-company">{edu.institution}</div>
                    <div className="timeline-field">{edu.fieldOfStudy}</div>
                    {edu.grade && <div className="timeline-grade">Grade: {edu.grade}</div>}
                    {edu.description && <p className="timeline-description">{edu.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {profile.projects && profile.projects.length > 0 && (
          <div className="portfolio-section">
            <h2 className="section-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.27 6.96L12 12.01L20.73 6.96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Projects
            </h2>
            <div className="projects-grid">
              {profile.projects.map((project, index) => (
                <div key={index} className="project-card">
                  <h3 className="project-title">{project.name}</h3>
                  <p className="project-description">{project.description}</p>
                  <div className="project-tags">
                    {project.technologies.split(',').map((tech, i) => (
                      <span key={i} className="tag">{tech.trim()}</span>
                    ))}
                  </div>
                  <div className="project-links">
                    {project.link && (
                      <a href={project.link} className="project-link" target="_blank" rel="noopener noreferrer">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M13.3333 8.66667V13.3333C13.3333 13.687 13.1928 14.0261 12.9428 14.2761C12.6927 14.5262 12.3536 14.6667 12 14.6667H2.66667C2.31304 14.6667 1.97391 14.5262 1.72386 14.2761C1.47381 14.0261 1.33333 13.687 1.33333 13.3333V4C1.33333 3.64638 1.47381 3.30724 1.72386 3.05719C1.97391 2.80714 2.31304 2.66667 2.66667 2.66667H7.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M11.3333 1.33333H14.6666V4.66666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6.66666 9.33333L14.6667 1.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Live Demo
                      </a>
                    )}
                    {project.github && (
                      <a href={project.github} className="project-link" target="_blank" rel="noopener noreferrer">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                        Source Code
                      </a>
                    )}
                  </div>
                  <div className="project-date">
                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="portfolio-section">
            <h2 className="section-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Skills
            </h2>
            <div className="skills-container">
              {profile.skills.map((skillGroup, index) => (
                <div key={index} className="skill-group">
                  <h3 className="skill-header">{skillGroup.header}</h3>
                  <div className="skill-tags">
                    {skillGroup.skills.split(',').map((skill, i) => (
                      <span key={i} className="skill-tag">{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications Section */}
        {profile.certification && profile.certification.length > 0 && (
          <div className="portfolio-section">
            <h2 className="section-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 15L12 12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Certifications
            </h2>
            <div className="certifications-grid">
              {profile.certification.map((cert, index) => (
                <div key={index} className="certification-card">
                  <div className="certification-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="certification-name">{cert.name}</h3>
                  <p className="certification-issuer">{cert.issuer}</p>
                  <p className="certification-date">Issued: {formatDate(cert.issueDate)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

