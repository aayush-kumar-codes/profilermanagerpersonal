export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  grade?: string;
  description?: string;
  order: number;
}

export interface Experience {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string;
  technologies: string;
  order: number;
}

export interface Project {
  _id?: string;
  name: string;
  description: string;
  link?: string;
  github?: string;
  technologies: string;
  startDate: string;
  endDate?: string;
  order: number;
}

export interface Skill {
  header: string;
  skills: string;
  order: number;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  order: number;
}

export interface ProfileData {
  _id?: string;
  personal?: {
    name: string;
    avatar?: {
      url?: string;
      publicId?: string;
    };
    bio?: string;
    designation?: string;
    location?: string;
    website?: string;
    email: string;
    phone?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
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
  projectIds: string[];
  skills: Skill[];
  certification: Certification[];
}

export interface UserData {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string | {
    url?: string;
    publicId?: string;
    resourceType?: string;
  };
}

