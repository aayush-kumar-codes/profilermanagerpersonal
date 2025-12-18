import mongoose, { Schema, Document, Model } from 'mongoose';
import './Project';

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  grade?: string;
  description?: string;
  order: number;
}

interface Experience {
  company: string;
  position: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  technologies: string;
  order: number;
}

interface Project {
  name: string;
  description: string;
  link?: string;
  github?: string;
  technologies: string;
  startDate: Date;
  endDate?: Date;
  order: number;
}

interface Skill {
  header: string;
  skills: string;
  order: number;
}

interface Certification {
  name: string;
  issuer: string;
  issueDate: Date;
  order: number;
}

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  designation?: string;
  location?: string;
  website?: string;
  profileImage?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  projectIds: mongoose.Types.ObjectId[];
  skills: Skill[];
  certification: Certification[];
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    designation: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    github: {
      type: String,
      default: '',
    },
    linkedin: {
      type: String,
      default: '',
    },
    twitter: {
      type: String,
      default: '',
    },
    education: [{
      institution: { type: String, required: true },
      degree: { type: String, required: true },
      fieldOfStudy: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date },
      grade: { type: String },
      description: { type: String },
      order: { type: Number, default: 0 },
    }],
    experience: [{
      company: { type: String, required: true },
      position: { type: String, required: true },
      location: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date },
      description: { type: String, required: true },
      technologies: { type: String },
      order: { type: Number, default: 0 },
    }],
    projects: [{
      name: { type: String, required: true },
      description: { type: String, required: true },
      link: { type: String },
      github: { type: String },
      technologies: { type: String },
      startDate: { type: Date, required: true },
      endDate: { type: Date },
      order: { type: Number, default: 0 },
    }],
    projectIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Project',
    }],
    skills: [{
      header: { type: String, required: true },
      skills: { type: String, required: true },
      order: { type: Number, default: 0 },
    }],
    certification: [{
      name: { type: String, required: true },
      issuer: { type: String, required: true },
      issueDate: { type: Date, required: true },
      order: { type: Number, default: 0 },
    }],
  },
  {
    timestamps: true,
  }
);

const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);

export default Profile;

