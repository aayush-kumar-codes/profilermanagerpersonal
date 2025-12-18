import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Profile from '@/lib/models/Profile';
import Project from '@/lib/models/Project';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const profile = await Profile.findById(id)
      .populate('projectIds');

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profileObj = profile.toObject();
    if (profileObj.projectIds && profileObj.projectIds.length > 0) {
      profileObj.projects = profileObj.projectIds;
    }

    return NextResponse.json({ profile: profileObj }, { status: 200 });
  } catch (error: any) {
    console.error('Get public profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

