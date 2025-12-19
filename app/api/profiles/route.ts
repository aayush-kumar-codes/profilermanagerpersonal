import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Profile from '@/lib/models/Profile';
import Project from '@/lib/models/Project';
import { verifyAccessToken } from '@/lib/jwt';

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
      projects: projects || [],
      projectIds: projectIds || [],
      skills: skills || [],
      certification: certification || [],
    });

    const populatedProfile = await Profile.findById(profile._id).populate('projectIds');

    return NextResponse.json(
      { message: 'Profile created successfully', profile: populatedProfile },
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

