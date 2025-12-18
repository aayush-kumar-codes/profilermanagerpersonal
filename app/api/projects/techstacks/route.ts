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

    const projects = await Project.find({ userId: payload.userId });
    
    const techStacksSet = new Set<string>();
    projects.forEach(project => {
      if (project.technologies) {
        project.technologies.split(',').forEach(tech => {
          techStacksSet.add(tech.trim());
        });
      }
    });

    const techStacks = Array.from(techStacksSet).sort();

    return NextResponse.json({ techStacks }, { status: 200 });
  } catch (error: any) {
    console.error('Get tech stacks error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

