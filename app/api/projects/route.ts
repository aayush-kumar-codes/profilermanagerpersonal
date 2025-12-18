import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
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

    const { searchParams } = new URL(request.url);
    const techStack = searchParams.get('techStack');

    let query: any = { userId: payload.userId };
    
    if (techStack && techStack !== 'all') {
      query.technologies = { $regex: techStack, $options: 'i' };
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error: any) {
    console.error('Get projects error:', error);
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
    const { name, description, technologies, link, github, startDate, endDate } = body;

    if (!name || !description || !technologies) {
      return NextResponse.json(
        { error: 'Name, description, and technologies are required' },
        { status: 400 }
      );
    }

    const project = await Project.create({
      userId: payload.userId,
      name,
      description,
      technologies,
      link,
      github,
      startDate,
      endDate,
    });

    return NextResponse.json(
      { message: 'Project created successfully', project },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

