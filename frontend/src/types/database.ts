export interface Database {
  public: {
    Tables: {
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          subject: string;
          notes: string | null;
          date: string;
          duration_minutes: number;
          syllabus_unit_id: string | null;
          completed: boolean;
          created_at: string;
          breaks: StudyBreak[];
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          subject: string;
          notes?: string | null;
          date: string;
          duration_minutes: number;
          syllabus_unit_id?: string | null;
          completed?: boolean;
          created_at?: string;
          breaks?: StudyBreak[];
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          subject?: string;
          notes?: string | null;
          date?: string;
          duration_minutes?: number;
          syllabus_unit_id?: string | null;
          completed?: boolean;
          created_at?: string;
          breaks?: StudyBreak[];
        };
      };
      syllabus_units: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          is_completed: boolean;
          exam_date: string | null;
          uploaded_file_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          is_completed?: boolean;
          exam_date?: string | null;
          uploaded_file_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          is_completed?: boolean;
          exam_date?: string | null;
          uploaded_file_url?: string | null;
          created_at?: string;
        };
      };
      uploads: {
        Row: {
          id: string;
          user_id: string;
          type: 'video' | 'document' | 'image';
          url: string;
          filename: string | null;
          file_size: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'video' | 'document' | 'image';
          url: string;
          filename?: string | null;
          file_size?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'video' | 'document' | 'image';
          url?: string;
          filename?: string | null;
          file_size?: number | null;
          created_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          user_id: string;
          upload_id: string | null;
          title: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          upload_id?: string | null;
          title: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          upload_id?: string | null;
          title?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          quiz_id: string;
          question_text: string;
          answer_text: string;
          is_flashcard: boolean;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question_text: string;
          answer_text: string;
          is_flashcard?: boolean;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          question_text?: string;
          answer_text?: string;
          is_flashcard?: boolean;
          order_index?: number;
          created_at?: string;
        };
      };
    };
  };
}

// Represents a scheduled break during a study session
export interface StudyBreak {
  startAfterMinutes: number; // When the break should start, relative to session start
  durationMinutes: number;   // How long the break lasts
}

// Extend StudySession to include breaks from backend
export type StudySession = Database['public']['Tables']['study_sessions']['Row'];

export type SyllabusUnit = Database['public']['Tables']['syllabus_units']['Row'];