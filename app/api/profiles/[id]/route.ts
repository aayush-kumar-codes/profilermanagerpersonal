import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Profile from '@/lib/models/Profile';
import Project from '@/lib/models/Project';
import { verifyAccessToken } from '@/lib/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    await connectDB();

    const { id } = await params;
    const profile = await Profile.findOne({ _id: id, userId: payload.userId })
      .populate('projectIds');

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profileObj = profile.toObject() as any;
    if (profileObj.projectIds && profileObj.projectIds.length > 0) {
      profileObj.projects = profileObj.projectIds;
    }

    return NextResponse.json({ profile: profileObj }, { status: 200 });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { personal, education, experience, projects, projectIds, skills, certification } = body;

    const updateData: any = {};
    
    if (personal) {
      if (personal.name) updateData.name = personal.name;
      if (personal.email) updateData.email = personal.email;
      if (personal.phone !== undefined) updateData.phone = personal.phone;
      if (personal.bio !== undefined) updateData.bio = personal.bio;
      if (personal.designation !== undefined) updateData.designation = personal.designation;
      if (personal.location !== undefined) updateData.location = personal.location;
      if (personal.website !== undefined) updateData.website = personal.website;
      if (personal.avatar?.url || personal.profileImage) {
        updateData.profileImage = personal.avatar?.url || personal.profileImage;
      }
      if (personal.github !== undefined) updateData.github = personal.github;
      if (personal.linkedin !== undefined) updateData.linkedin = personal.linkedin;
      if (personal.twitter !== undefined) updateData.twitter = personal.twitter;
    }
    
    if (education) updateData.education = education;
    if (experience) updateData.experience = experience;
    if (projects) updateData.projects = projects;
    if (projectIds !== undefined) updateData.projectIds = projectIds;
    if (skills) updateData.skills = skills;
    if (certification) updateData.certification = certification;

    const profile = await Profile.findOneAndUpdate(
      { _id: id, userId: payload.userId },
      updateData,
      { new: true }
    ).populate('projectIds');

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profileObj = profile.toObject() as any;
    if (profileObj.projectIds && profileObj.projectIds.length > 0) {
      profileObj.projects = profileObj.projectIds;
    }

    return NextResponse.json(
      { message: 'Profile updated successfully', profile: profileObj },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    await connectDB();

    const { id } = await params;
    const profile = await Profile.findOneAndDelete({
      _id: id,
      userId: payload.userId,
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Profile deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

