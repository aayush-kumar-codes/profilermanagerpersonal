import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Profile from '@/lib/models/Profile';
import { verifyAccessToken } from '@/lib/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectToDatabase();
    const profile = await Profile.findOne({ _id: id, userId: decoded.userId });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Generate HTML content for PDF
    const htmlContent = generatePDFHTML(profile);

    // Return HTML with special headers that trigger PDF generation
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="portfolio-${profile.personal?.name || 'profile'}.html"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

function formatDate(date: any): string {
  if (!date) return 'Present';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function generatePDFHTML(profile: any): string {
  const personal = profile.personal || {};
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

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - Portfolio</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: white;
      padding: 40px;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      padding: 40px 0;
      border-bottom: 3px solid #3b82f6;
      margin-bottom: 40px;
    }

    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 0 auto 20px;
      overflow: hidden;
      border: 4px solid #3b82f6;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-size: 48px;
      font-weight: 700;
      color: white;
    }

    h1 {
      font-size: 36px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 8px;
    }

    .designation {
      font-size: 18px;
      font-weight: 600;
      color: #3b82f6;
      margin-bottom: 12px;
    }

    .contact-info {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
      margin-top: 20px;
      font-size: 14px;
      color: #64748b;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #3b82f6;
    }

    .bio {
      font-size: 16px;
      line-height: 1.8;
      color: #475569;
      margin-bottom: 20px;
    }

    .timeline-item {
      margin-bottom: 30px;
      padding-left: 20px;
      border-left: 2px solid #3b82f6;
      page-break-inside: avoid;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .timeline-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }

    .timeline-date {
      font-size: 13px;
      font-weight: 600;
      color: #3b82f6;
      white-space: nowrap;
    }

    .timeline-company {
      font-size: 15px;
      font-weight: 600;
      color: #06b6d4;
      margin-bottom: 8px;
    }

    .timeline-description {
      font-size: 14px;
      line-height: 1.7;
      color: #64748b;
      margin-bottom: 12px;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }

    .tag {
      padding: 4px 12px;
      background: #e0f2fe;
      border: 1px solid #3b82f6;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #3b82f6;
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .project-card {
      padding: 20px;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      page-break-inside: avoid;
    }

    .project-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }

    .project-description {
      font-size: 14px;
      line-height: 1.6;
      color: #64748b;
      margin-bottom: 12px;
    }

    .project-link {
      font-size: 12px;
      color: #3b82f6;
      text-decoration: none;
      display: block;
      margin-bottom: 4px;
    }

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .skill-group {
      padding: 20px;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      page-break-inside: avoid;
    }

    .skill-header {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }

    .certifications-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .certification-card {
      padding: 20px;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      text-align: center;
      page-break-inside: avoid;
    }

    .certification-name {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }

    .certification-issuer {
      font-size: 14px;
      font-weight: 600;
      color: #06b6d4;
      margin-bottom: 6px;
    }

    .certification-date {
      font-size: 12px;
      color: #64748b;
    }

    @media print {
      body {
        padding: 20px;
      }

      .section {
        page-break-inside: avoid;
      }
    }
  </style>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      ${avatar ? `
        <div class="avatar">
          <img src="${avatar}" alt="${name}" />
        </div>
      ` : `
        <div class="avatar">
          <div class="avatar-placeholder">
            ${name.charAt(0).toUpperCase()}
          </div>
        </div>
      `}
      <h1>${name}</h1>
      ${designation ? `<div class="designation">${designation}</div>` : ''}
      ${location ? `<div class="designation">${location}</div>` : ''}
      
      <div class="contact-info">
        ${email ? `<div class="contact-item">📧 ${email}</div>` : ''}
        ${phone ? `<div class="contact-item">📱 ${phone}</div>` : ''}
        ${website ? `<div class="contact-item">🌐 ${website}</div>` : ''}
        ${github ? `<div class="contact-item">💻 GitHub</div>` : ''}
        ${linkedin ? `<div class="contact-item">💼 LinkedIn</div>` : ''}
        ${twitter ? `<div class="contact-item">🐦 Twitter</div>` : ''}
      </div>
    </div>

    <!-- Bio -->
    ${bio ? `
      <div class="section">
        <div class="section-title">About Me</div>
        <div class="bio">${bio}</div>
      </div>
    ` : ''}

    <!-- Experience -->
    ${profile.experience && profile.experience.length > 0 ? `
      <div class="section">
        <div class="section-title">Experience</div>
        ${profile.experience.map((exp: any) => `
          <div class="timeline-item">
            <div class="timeline-header">
              <div class="timeline-title">${exp.position}</div>
              <div class="timeline-date">${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}</div>
            </div>
            <div class="timeline-company">${exp.company} • ${exp.location}</div>
            <div class="timeline-description">${exp.description}</div>
            ${exp.technologies ? `
              <div class="tags">
                ${exp.technologies.split(',').map((tech: string) => 
                  `<span class="tag">${tech.trim()}</span>`
                ).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- Education -->
    ${profile.education && profile.education.length > 0 ? `
      <div class="section">
        <div class="section-title">Education</div>
        ${profile.education.map((edu: any) => `
          <div class="timeline-item">
            <div class="timeline-header">
              <div class="timeline-title">${edu.degree}</div>
              <div class="timeline-date">${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</div>
            </div>
            <div class="timeline-company">${edu.institution}</div>
            <div class="timeline-description">${edu.fieldOfStudy}</div>
            ${edu.grade ? `<div class="timeline-description">Grade: ${edu.grade}</div>` : ''}
            ${edu.description ? `<div class="timeline-description">${edu.description}</div>` : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- Projects -->
    ${profile.projects && profile.projects.length > 0 ? `
      <div class="section">
        <div class="section-title">Projects</div>
        <div class="projects-grid">
          ${profile.projects.map((project: any) => `
            <div class="project-card">
              <div class="project-title">${project.name}</div>
              <div class="project-description">${project.description}</div>
              <div class="tags">
                ${project.technologies.split(',').map((tech: string) => 
                  `<span class="tag">${tech.trim()}</span>`
                ).join('')}
              </div>
              ${project.link ? `<a href="${project.link}" class="project-link">🔗 ${project.link}</a>` : ''}
              ${project.github ? `<a href="${project.github}" class="project-link">💻 ${project.github}</a>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Skills -->
    ${profile.skills && profile.skills.length > 0 ? `
      <div class="section">
        <div class="section-title">Skills</div>
        <div class="skills-grid">
          ${profile.skills.map((skillGroup: any) => `
            <div class="skill-group">
              <div class="skill-header">${skillGroup.header}</div>
              <div class="tags">
                ${skillGroup.skills.split(',').map((skill: string) => 
                  `<span class="tag">${skill.trim()}</span>`
                ).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Certifications -->
    ${profile.certification && profile.certification.length > 0 ? `
      <div class="section">
        <div class="section-title">Certifications</div>
        <div class="certifications-grid">
          ${profile.certification.map((cert: any) => `
            <div class="certification-card">
              <div class="certification-name">${cert.name}</div>
              <div class="certification-issuer">${cert.issuer}</div>
              <div class="certification-date">Issued: ${formatDate(cert.issueDate)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  </div>
</body>
</html>
  `;
}

