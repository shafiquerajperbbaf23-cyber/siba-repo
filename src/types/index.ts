// src/types/index.ts

export interface ProgramWithCounts {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { semesters: number; resources: number };
}

export interface SemesterWithCounts {
  id: string;
  number: number;
  label: string;
  programId: string;
  program: { name: string; slug: string };
  _count: { courses: number; resources: number };
}

export interface CourseWithCounts {
  id: string;
  name: string;
  code: string;
  instructor: string | null;
  description: string | null;
  semesterId: string;
  semester: { number: number; label: string; program: { name: string; slug: string } };
  _count: { resources: number };
}

export interface ResourceFull {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileSize: string | null;
  year: number | null;
  createdAt: string;
  type: { id: string; name: string; slug: string; icon: string | null };
  course: { id: string; name: string; code: string };
  semester: { id: string; number: number; label: string };
  program: { id: string; name: string; slug: string };
  tags: { tag: { id: string; name: string; slug: string } }[];
  uploadedBy: { name: string };
}

export interface SearchResult {
  resources: ResourceFull[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminStats {
  totalResources: number;
  totalCourses: number;
  totalPrograms: number;
  recentResources: ResourceFull[];
  byProgram: { name: string; count: number }[];
  bySemester: { label: string; programName: string; count: number }[];
  byType: { name: string; count: number }[];
}
