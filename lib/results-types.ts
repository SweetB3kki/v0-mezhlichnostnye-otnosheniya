import type { SocialStatus, SociometryEdge } from "@/lib/sociometry";
import type { FiroDomainCode, FiroDomainProfile, FiroScale, FiroScaleProfile, FiroScoreLevel } from "@/lib/firo";

export type FiroScaleCompactResult = {
  score: number;
  level: FiroScoreLevel;
};

export type ClassResultsStudent = {
  id: string;
  firstName: string;
  lastName: string;
  submittedAt: string | null;
  sociometryResponseCount: number;
  firoResponseCount: number;
  inDegree: number;
  outDegree: number;
  mutualChoices: number;
  status: SocialStatus;
  firoSum: number;
  firoAvg: number;
  firoCount: number;
  firoScales: Record<FiroScale, FiroScaleCompactResult>;
};

export type ClassResultsApiResponse = {
  class: {
    id: string;
    name: string;
    teacher: string | null;
    studentCount: number;
  };
  students: ClassResultsStudent[];
  sociometry: {
    totalChoices: number;
    mutualChoices: number;
    cohesion: number;
    statusCounts: Record<SocialStatus, number>;
    mutualPairs: Array<[string, string]>;
    edges: SociometryEdge[];
  };
  firo: {
    respondentCount: number;
    scaleAverages: Record<FiroScale, number>;
  };
};

export type StudentSociometryAnswer = {
  questionKey: string;
  selectedStudents: Array<{ id: string; firstName: string; lastName: string }>;
};

export type StudentResultsApiResponse = {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    classId: string | null;
    className: string | null;
  };
  session: {
    id: string;
    submittedAt: string;
    meta: Record<string, unknown> | null;
  } | null;
  sociometry: {
    answers: StudentSociometryAnswer[];
    inDegree: number;
    outDegree: number;
    mutualChoices: number;
    status: SocialStatus;
  };
  firo: {
    responses: Array<{ questionKey: string; value: number }>;
    sum: number;
    avg: number;
    count: number;
    scales: Record<FiroScale, FiroScaleProfile>;
    domains: Record<FiroDomainCode, FiroDomainProfile>;
  };
};
