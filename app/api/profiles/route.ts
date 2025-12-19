import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Profile from '@/lib/models/Profile';
import Project from '@/lib/models/Project';
import { verifyAccessToken } from '@/lib/jwt';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    await connectDB();

    const profiles = await Profile.find({ userId: payload.userId })
      .populate('projectIds')
      .sort({ createdAt: -1 });

    const transformedProfiles = profiles.map(profile => {
      const profileObj = profile.toObject() as any;
      if (profileObj.projectIds && profileObj.projectIds.length > 0) {
        profileObj.projects = profileObj.projectIds;
      } else {
        profileObj.projects = [];
      }
      return profileObj;
    });

    return NextResponse.json({ profiles: transformedProfiles }, { status: 200 });
  } catch (error: any) {
    console.error('Get profiles error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    await connectDB();

    const body = await request.json();
    const { personal, education, experience, projects, projectIds, skills, certification } = body;

    if (!personal?.name || !personal?.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    let finalProjectIds: string[] = [];
    
    if (projects && Array.isArray(projects)) {
      const existingProjectIds = new Set<string>();
      
      for (const project of projects) {
        try {
          if (project._id) {
            const projectId = typeof project._id === 'string' ? project._id : project._id.toString();
            
            if (mongoose.Types.ObjectId.isValid(projectId)) {
              const existingProject = await Project.findById(projectId);
              if (existingProject) {
                if (!existingProjectIds.has(projectId)) {
                  existingProjectIds.add(projectId);
                  finalProjectIds.push(projectId);
                }
                continue;
              }
            }
            
            if (project.name?.trim() && project.description?.trim() && project.technologies?.trim()) {
              const newProject = await Project.create({
                userId: payload.userId,
                name: project.name.trim(),
                description: project.description.trim(),
                technologies: project.technologies.trim(),
                link: project.link?.trim() || '',
                github: project.github?.trim() || '',
                startDate: project.startDate && !isNaN(new Date(project.startDate).getTime()) ? new Date(project.startDate) : undefined,
                endDate: project.endDate && !isNaN(new Date(project.endDate).getTime()) ? new Date(project.endDate) : undefined,
              });
              
              if (newProject._id) {
                const newId = typeof newProject._id === 'string' ? newProject._id : String(newProject._id);
                finalProjectIds.push(newId);
              }
            }
          } else {
            if (project.name?.trim() && project.description?.trim() && project.technologies?.trim()) {
              const newProject = await Project.create({
                userId: payload.userId,
                name: project.name.trim(),
                description: project.description.trim(),
                technologies: project.technologies.trim(),
                link: project.link?.trim() || '',
                github: project.github?.trim() || '',
                startDate: project.startDate && !isNaN(new Date(project.startDate).getTime()) ? new Date(project.startDate) : undefined,
                endDate: project.endDate && !isNaN(new Date(project.endDate).getTime()) ? new Date(project.endDate) : undefined,
              });
              
              if (newProject._id) {
                const newId = typeof newProject._id === 'string' ? newProject._id : String(newProject._id);
                finalProjectIds.push(newId);
              }
            }
          }
        } catch (projectError: any) {
          console.error('Error processing project:', projectError);
        }
      }
    }
    
    if (projectIds && Array.isArray(projectIds)) {
      for (const projectId of projectIds) {
        try {
          const id = typeof projectId === 'string' ? projectId : projectId.toString();
          if (mongoose.Types.ObjectId.isValid(id)) {
            const project = await Project.findOne({ _id: id, userId: payload.userId });
            if (project && !finalProjectIds.includes(id)) {
              finalProjectIds.push(id);
            }
          }
        } catch (error: any) {
          console.error('Error processing projectId:', error);
        }
      }
    }

    const profile = await Profile.create({
      userId: payload.userId,
      name: personal.name,
      email: personal.email,
      phone: personal.phone || '',
      bio: personal.bio || '',
      designation: personal.designation || '',
      location: personal.location || '',
      website: personal.website || '',
      profileImage: personal.avatar?.url || personal.profileImage || '',
      github: personal.github || '',
      linkedin: personal.linkedin || '',
      twitter: personal.twitter || '',
      education: education || [],
      experience: experience || [],
      projects: [],
      projectIds: finalProjectIds,
      skills: skills || [],
      certification: certification || [],
    });

    const populatedProfile = await Profile.findById(profile._id).populate('projectIds');
    const profileObj = populatedProfile.toObject() as any;
    if (profileObj.projectIds && profileObj.projectIds.length > 0) {
      profileObj.projects = profileObj.projectIds;
    } else {
      profileObj.projects = [];
    }

    return NextResponse.json(
      { message: 'Profile created successfully', profile: profileObj },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

