import mongoose, { Schema, Model } from 'mongoose';

export interface IProject {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  technologies: string;
  link?: string;
  github?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const projectSchema = new Schema<IProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [200, 'Project name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    technologies: {
      type: String,
      required: [true, 'Technologies are required'],
      trim: true,
    },
    link: {
      type: String,
      trim: true,
      default: '',
    },
    github: {
      type: String,
      trim: true,
      default: '',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ userId: 1, name: 1 });

const Project: Model<IProject> = 
  mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema);

export default Project;

