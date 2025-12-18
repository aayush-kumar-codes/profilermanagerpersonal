import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { ProfileData } from '@/lib/types/profile';

export const generateProfilePDF = async (profile: ProfileData) => {
  try {
    const personal = profile.personal || {} as any;
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

    const formatDate = (date: string | undefined): string => {
      if (!date) return 'Present';
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const createStyledContainer = (content: string) => {
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '1200px';
      container.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
      container.style.padding = '0';
      
      container.innerHTML = `
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          .pdf-section-wrapper {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 20px;
            min-height: 100px;
          }
          
          .pdf-portfolio-content {
            max-width: 1160px;
            margin: 0 auto;
            background: #1e293b;
            border-radius: 24px;
            border: 1px solid #334155;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
            overflow: hidden;
          }

          .pdf-portfolio-hero {
            position: relative;
            padding: 80px 40px 60px;
            text-align: center;
            background: linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #ec4899 100%);
            overflow: hidden;
          }

          .pdf-portfolio-hero-bg {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%);
            opacity: 0.6;
          }

          .pdf-portfolio-hero-content { position: relative; z-index: 1; }
          .pdf-portfolio-avatar {
            width: 180px; height: 180px; border-radius: 50%;
            margin: 0 auto 24px; overflow: hidden;
            border: 6px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
          }
          .pdf-portfolio-avatar img { width: 100%; height: 100%; object-fit: cover; }
          .pdf-portfolio-avatar-placeholder {
            width: 100%; height: 100%; display: flex;
            align-items: center; justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-size: 72px; font-weight: 700; color: white;
          }
          .pdf-portfolio-name {
            font-size: 48px; font-weight: 800; color: white;
            margin-bottom: 8px; letter-spacing: -1px;
            text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
          }
          .pdf-portfolio-designation {
            font-size: 22px; font-weight: 500;
            color: rgba(255, 255, 255, 0.95);
            margin-bottom: 12px; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          }
          .pdf-portfolio-location {
            display: flex; align-items: center; justify-content: center;
            gap: 8px; font-size: 16px; color: rgba(255, 255, 255, 0.9);
            margin-bottom: 24px;
          }
          .pdf-portfolio-social-links {
            display: flex; flex-wrap: wrap; gap: 12px;
            justify-content: center; margin-top: 32px;
          }
          .pdf-social-link {
            display: flex; align-items: center; gap: 8px;
            padding: 10px 20px;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px; color: white;
            font-size: 14px; font-weight: 600;
          }
          .pdf-portfolio-section {
            padding: 48px 40px 60px 40px;
            border-bottom: 1px solid #334155;
          }
          .pdf-portfolio-section:last-child {
            border-bottom: none;
            padding-bottom: 48px;
          }
          .pdf-section-title {
            display: flex; align-items: center; gap: 12px;
            font-size: 28px; font-weight: 700; color: #f1f5f9;
            margin-bottom: 32px; padding-bottom: 16px;
            border-bottom: 2px solid #3b82f6;
          }
          .pdf-portfolio-bio {
            font-size: 18px; line-height: 1.8; color: #94a3b8;
          }
          .pdf-timeline { position: relative; padding-left: 40px; }
          .pdf-timeline::before {
            content: ''; position: absolute; left: 0; top: 0; bottom: 0;
            width: 2px; background: linear-gradient(to bottom, #3b82f6, #06b6d4);
          }
          .pdf-timeline-item { 
            position: relative; 
            margin-bottom: 40px;
          }
          .pdf-timeline-marker {
            position: absolute; left: -46px; top: 6px;
            width: 14px; height: 14px; border-radius: 50%;
            background: #3b82f6; border: 3px solid #1e293b;
            box-shadow: 0 0 0 2px #3b82f6;
          }
          .pdf-timeline-content {
            background: #0f172a; border: 1px solid #334155;
            border-radius: 16px; padding: 24px;
          }
          .pdf-timeline-header {
            display: flex; justify-content: space-between;
            align-items: flex-start; margin-bottom: 8px; gap: 16px;
          }
          .pdf-timeline-header h3 {
            font-size: 20px; font-weight: 700; color: #f1f5f9;
          }
          .pdf-timeline-date {
            font-size: 14px; font-weight: 600;
            color: #3b82f6; white-space: nowrap;
          }
          .pdf-timeline-company {
            font-size: 16px; font-weight: 600;
            color: #06b6d4; margin-bottom: 12px;
          }
          .pdf-timeline-description {
            font-size: 15px; line-height: 1.7;
            color: #94a3b8; margin-bottom: 16px;
          }
          .pdf-timeline-tags {
            display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px;
          }
          .pdf-tag {
            padding: 6px 14px;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 8px; font-size: 13px;
            font-weight: 600; color: #3b82f6;
          }
          .pdf-projects-grid {
            display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;
          }
          .pdf-project-card {
            background: #0f172a; border: 1px solid #334155;
            border-radius: 16px; padding: 28px;
          }
          .pdf-project-title {
            font-size: 20px; font-weight: 700;
            color: #f1f5f9; margin-bottom: 12px;
          }
          .pdf-project-description {
            font-size: 15px; line-height: 1.7;
            color: #94a3b8; margin-bottom: 16px;
          }
          .pdf-project-tags {
            display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;
          }
          .pdf-project-links {
            display: flex; gap: 12px; margin-bottom: 16px;
          }
          .pdf-project-link {
            padding: 8px 16px; background: #3b82f6;
            border-radius: 8px; color: white;
            font-size: 13px; font-weight: 600;
          }
          .pdf-skills-container {
            display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;
          }
          .pdf-skill-group {
            background: #0f172a; border: 1px solid #334155;
            border-radius: 16px; padding: 24px;
          }
          .pdf-skill-header {
            font-size: 18px; font-weight: 700; color: #f1f5f9;
            margin-bottom: 16px; padding-bottom: 12px;
            border-bottom: 2px solid #3b82f6;
          }
          .pdf-skill-tags { display: flex; flex-wrap: wrap; gap: 8px; }
          .pdf-skill-tag {
            padding: 8px 16px;
            background: rgba(20, 184, 166, 0.1);
            border: 1px solid rgba(20, 184, 166, 0.3);
            border-radius: 8px; font-size: 14px;
            font-weight: 600; color: #14b8a6;
          }
          .pdf-certifications-grid {
            display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;
          }
          .pdf-certification-card {
            background: #0f172a; border: 1px solid #334155;
            border-radius: 16px; padding: 28px; text-align: center;
          }
          .pdf-certification-icon {
            display: flex; align-items: center; justify-content: center;
            width: 64px; height: 64px; margin: 0 auto 16px;
            background: linear-gradient(135deg, #06b6d4, #14b8a6);
            border-radius: 50%;
          }
          .pdf-certification-name {
            font-size: 18px; font-weight: 700;
            color: #f1f5f9; margin-bottom: 8px;
          }
          .pdf-certification-issuer {
            font-size: 15px; font-weight: 600;
            color: #06b6d4; margin-bottom: 8px;
          }
          .pdf-certification-date {
            font-size: 13px; color: #94a3b8;
          }
        </style>
        ${content}
      `;
      
      document.body.appendChild(container);
      return container;
    };

    const waitForImages = async (container: HTMLElement) => {
      const images = container.getElementsByTagName('img');
      const imagePromises = Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete) resolve(true);
          else {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true);
          }
        });
      });
      await Promise.all(imagePromises);
    };

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 0;
    let currentY = 0;
    let isFirstPage = true;

    const addBackgroundToPage = () => {
      const gradient = pdf.internal.pageSize.height;
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    };

    const addCanvasToPDF = (canvas: HTMLCanvasElement) => {
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      if (currentY + imgHeight > pageHeight && !isFirstPage) {
        pdf.addPage();
        addBackgroundToPage();
        currentY = 0;
      }

      if (!isFirstPage && currentY === 0) {
        currentY = margin;
      }

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        margin,
        currentY,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );

      currentY += imgHeight;
      isFirstPage = false;
    };

    addBackgroundToPage();

    const completeHTML = `
      <div class="pdf-section-wrapper">
        <div class="pdf-portfolio-content">
          <div class="pdf-portfolio-hero">
            <div class="pdf-portfolio-hero-bg"></div>
            <div class="pdf-portfolio-hero-content">
              <div class="pdf-portfolio-avatar">
                ${avatar ? `<img src="${avatar}" alt="${name}" crossorigin="anonymous" />` : `
                  <div class="pdf-portfolio-avatar-placeholder">
                    <span>${name.charAt(0).toUpperCase()}</span>
                  </div>
                `}
              </div>
              <h1 class="pdf-portfolio-name">${name}</h1>
              ${designation ? `<p class="pdf-portfolio-designation">${designation}</p>` : ''}
              ${location ? `<p class="pdf-portfolio-location">📍 ${location}</p>` : ''}
              <div class="pdf-portfolio-social-links">
                ${email ? `<div class="pdf-social-link">📧 ${email}</div>` : ''}
                ${phone ? `<div class="pdf-social-link">📱 ${phone}</div>` : ''}
                ${website ? `<div class="pdf-social-link">🌐 Website</div>` : ''}
                ${github ? `<div class="pdf-social-link">💻 GitHub</div>` : ''}
                ${linkedin ? `<div class="pdf-social-link">💼 LinkedIn</div>` : ''}
                ${twitter ? `<div class="pdf-social-link">🐦 Twitter</div>` : ''}
              </div>
            </div>
          </div>

          ${bio ? `
            <div class="pdf-portfolio-section">
              <h2 class="pdf-section-title">About Me</h2>
              <p class="pdf-portfolio-bio">${bio}</p>
            </div>
          ` : ''}

          ${profile.experience && profile.experience.length > 0 ? `
            <div class="pdf-portfolio-section">
              <h2 class="pdf-section-title">💼 Experience</h2>
              <div class="pdf-timeline">
                ${profile.experience.map(exp => `
                  <div class="pdf-timeline-item">
                    <div class="pdf-timeline-marker"></div>
                    <div class="pdf-timeline-content">
                      <div class="pdf-timeline-header">
                        <h3>${exp.position}</h3>
                        <span class="pdf-timeline-date">${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}</span>
                      </div>
                      <div class="pdf-timeline-company">${exp.company} • ${exp.location}</div>
                      <p class="pdf-timeline-description">${exp.description}</p>
                      ${exp.technologies ? `
                        <div class="pdf-timeline-tags">
                          ${exp.technologies.split(',').map(tech => `<span class="pdf-tag">${tech.trim()}</span>`).join('')}
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${profile.education && profile.education.length > 0 ? `
            <div class="pdf-portfolio-section">
              <h2 class="pdf-section-title">🎓 Education</h2>
              <div class="pdf-timeline">
                ${profile.education.map(edu => `
                  <div class="pdf-timeline-item">
                    <div class="pdf-timeline-marker"></div>
                    <div class="pdf-timeline-content">
                      <div class="pdf-timeline-header">
                        <h3>${edu.degree}</h3>
                        <span class="pdf-timeline-date">${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</span>
                      </div>
                      <div class="pdf-timeline-company">${edu.institution}</div>
                      <div class="pdf-timeline-description">${edu.fieldOfStudy}</div>
                      ${edu.grade ? `<div class="pdf-timeline-description">Grade: ${edu.grade}</div>` : ''}
                      ${edu.description ? `<p class="pdf-timeline-description">${edu.description}</p>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${profile.projects && profile.projects.length > 0 ? `
            <div class="pdf-portfolio-section">
              <h2 class="pdf-section-title">🚀 Projects</h2>
              <div class="pdf-projects-grid">
                ${profile.projects.map(project => `
                  <div class="pdf-project-card">
                    <h3 class="pdf-project-title">${project.name}</h3>
                    <p class="pdf-project-description">${project.description}</p>
                    <div class="pdf-project-tags">
                      ${project.technologies.split(',').map(tech => `<span class="pdf-tag">${tech.trim()}</span>`).join('')}
                    </div>
                    ${project.link || project.github ? `
                      <div class="pdf-project-links">
                        ${project.link ? `<div class="pdf-project-link">🔗 Live Demo</div>` : ''}
                        ${project.github ? `<div class="pdf-project-link">💻 Source Code</div>` : ''}
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${profile.skills && profile.skills.length > 0 ? `
            <div class="pdf-portfolio-section">
              <h2 class="pdf-section-title">⚡ Skills</h2>
              <div class="pdf-skills-container">
                ${profile.skills.map(skillGroup => `
                  <div class="pdf-skill-group">
                    <h3 class="pdf-skill-header">${skillGroup.header}</h3>
                    <div class="pdf-skill-tags">
                      ${skillGroup.skills.split(',').map(skill => `<span class="pdf-skill-tag">${skill.trim()}</span>`).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${profile.certification && profile.certification.length > 0 ? `
            <div class="pdf-portfolio-section">
              <h2 class="pdf-section-title">📜 Certifications</h2>
              <div class="pdf-certifications-grid">
                ${profile.certification.map(cert => `
                  <div class="pdf-certification-card">
                    <div class="pdf-certification-icon">🏆</div>
                    <h3 class="pdf-certification-name">${cert.name}</h3>
                    <p class="pdf-certification-issuer">${cert.issuer}</p>
                    <p class="pdf-certification-date">Issued: ${formatDate(cert.issueDate)}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    const container = createStyledContainer(completeHTML);
    await waitForImages(container);
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      width: 1200,
      windowWidth: 1200,
    });

    document.body.removeChild(container);
    
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let position = 0;
    let pageNum = 0;

    while (position < imgHeight) {
      if (pageNum > 0) {
        pdf.addPage();
        addBackgroundToPage();
      }

      const remainingHeight = imgHeight - position;
      const heightToAdd = Math.min(pageHeight, remainingHeight);
      
      const sourceY = (position / imgHeight) * canvas.height;
      const sourceHeight = (heightToAdd / imgHeight) * canvas.height;
      
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;

      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          canvas,
          0, sourceY,
          canvas.width, sourceHeight,
          0, 0,
          canvas.width, sourceHeight
        );

        pdf.addImage(
          pageCanvas.toDataURL('image/png', 0.95),
          'PNG',
          0,
          0,
          imgWidth,
          heightToAdd,
          undefined,
          'FAST'
        );
      }

      position += pageHeight;
      pageNum++;
    }

    const fileName = `${name.replace(/\s+/g, '_')}_Portfolio.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
