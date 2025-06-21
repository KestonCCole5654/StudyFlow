export interface Upload {
  id: string;
  user_id: string;
  type: 'video' | 'document' | 'image';
  url: string;
  filename?: string;
  file_size?: number;
  created_at: string;
}

export interface Quiz {
  id: string;
  user_id: string;
  upload_id?: string;
  title: string;
  description?: string;
  created_at: string;
  upload?: Upload;
  questions?: Question[];
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  answer_text: string;
  is_flashcard: boolean;
  order_index: number;
  created_at: string;
}

export interface QuizGenerationRequest {
  content: string;
  contentType: 'youtube' | 'document' | 'image';
  filename?: string;
}

export interface QuizGenerationResponse {
  quiz: Quiz;
  questions: Question[];
}