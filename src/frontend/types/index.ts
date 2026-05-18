export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export interface Analysis {
  summary: string;
  keyPoints: string[];
  tags: string[];
}

export interface Document {
  id: string;
  userId: string;
  title: string;
  content: string;
  fileName?: string;
  fileType?: string;
  analysis?: Analysis;
  createdAt: string;
}

export interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  documentId: string;
  userId: string;
  title: string;
  questions: Question[];
  createdAt: string;
}

export interface Progress {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}
export interface Note {
  id: string;
  userId: string;
  content: string;
  color: string;
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
}
