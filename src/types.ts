export interface ProcessedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  notes?: GeneratedNotes;
  processingStage?: string;
  currentPage?: number;
  error?: string;
}

export interface GeneratedNotes {
  title: string;
  summary: string;
  sections: NoteSection[];
  keyPoints: string[];
  tags: string[];
  wordCount: number;
}

export interface NoteSection {
  id: string;
  title: string;
  content: string;
  subsections?: NoteSection[];
}

export type ViewMode = 'upload' | 'processing' | 'notes' | 'history';