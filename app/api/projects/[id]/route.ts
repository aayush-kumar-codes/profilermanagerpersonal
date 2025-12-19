import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import Profile from '@/lib/models/Profile';
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
    const project = await Project.findOne({ _id: id, userId: payload.userId });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project }, { status: 200 });
  } catch (error: any) {
    console.error('Get project error:', error);
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
    const { name, description, technologies, link, github, startDate, endDate } = body;

    if (!name || !description || !technologies) {
      return NextResponse.json(
        { error: 'Name, description, and technologies are required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      name,
      description,
      technologies,
      link: link || '',
      github: github || '',
    };

    if (startDate && startDate.trim()) {
      updateData.startDate = new Date(startDate);
    } else {
      updateData.startDate = null;
    }

    if (endDate && endDate.trim()) {
      updateData.endDate = new Date(endDate);
    } else {
      updateData.endDate = null;
    }

    const project = await Project.findOneAndUpdate(
      { _id: id, userId: payload.userId },
      updateData,
      { new: true }
    );

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Project updated successfully', project },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update project error:', error);
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
    const project = await Project.findOneAndDelete({
      _id: id,
      userId: payload.userId,
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await Profile.updateMany(
      { userId: payload.userId, projectIds: id },
      { $pull: { projectIds: id } }
    );

    return NextResponse.json(
      { message: 'Project deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

