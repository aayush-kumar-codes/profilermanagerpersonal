import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyAccessToken } from '@/lib/jwt';
import { getProfilePictureUrl, createProfilePictureObject } from '@/lib/utils/imageHelpers';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    await connectDB();

    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userObj = user.toObject() as any;
    const userResponse = {
      ...userObj,
      profilePicture: getProfilePictureUrl(userObj.profilePicture, userObj.avatar),
    };

    return NextResponse.json({ user: userResponse }, { status: 200 });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    await connectDB();

    const body = await request.json();
    const { name, profilePicture } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!/^[A-Za-z\s]+$/.test(name)) {
      return NextResponse.json(
        { error: 'Name can only contain letters and spaces' },
        { status: 400 }
      );
    }

    const updateData: any = { name };
    
    if (profilePicture) {
      const imageObj = createProfilePictureObject(profilePicture);
      updateData.avatar = imageObj;
      updateData.profilePicture = imageObj;
    }

    const user = await User.findByIdAndUpdate(
      payload.userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userObj = user.toObject() as any;
    const userResponse = {
      ...userObj,
      profilePicture: getProfilePictureUrl(userObj.profilePicture, userObj.avatar),
    };

    return NextResponse.json(
      { message: 'Profile updated successfully', user: userResponse },
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

