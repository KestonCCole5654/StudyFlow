import { GoogleGenerativeAI } from '@google/generative-ai';
import { youtubeAPI } from './youtube';
import { supabase } from './supabase';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface GeneratedQuestion {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface QuizGenerationOptions {
  numQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  questionTypes?: ('flashcard' | 'multiple-choice' | 'short-answer')[];
  focusAreas?: string[];
}

export class GeminiQuizGenerator {
  private static instance: GeminiQuizGenerator;
  private model: any;
  private static _isConfigured: boolean | null = null;

  constructor() {
    try {
      this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      console.log('🤖 Gemini AI model initialized successfully');
    } catch (error) {
      console.warn('⚠️ Gemini AI not configured:', error);
      this.model = null;
    }
  }

  static getInstance(): GeminiQuizGenerator {
    if (!GeminiQuizGenerator.instance) {
      GeminiQuizGenerator.instance = new GeminiQuizGenerator();
    }
    return GeminiQuizGenerator.instance;
  }

  // Helper method to check if API key is configured
  static isConfigured(): boolean {
    // Cache the result to prevent repeated checks
    if (GeminiQuizGenerator._isConfigured !== null) {
      return GeminiQuizGenerator._isConfigured;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const isConfigured = !!(apiKey && apiKey.trim() !== '');
    
    // Cache the result
    GeminiQuizGenerator._isConfigured = isConfigured;
    
    console.log('🔑 Gemini API Key configured:', isConfigured ? 'YES' : 'NO');
    if (isConfigured) {
      console.log('🔑 API Key preview:', apiKey.substring(0, 10) + '...');
    }
    return isConfigured;
  }

  // Instance method that calls the static method
  isConfigured(): boolean {
    return GeminiQuizGenerator.isConfigured();
  }

  async generateFromText(
    content: string, 
    title: string,
    options: QuizGenerationOptions = {}
  ): Promise<GeneratedQuestion[]> {
    console.log('📝 QUIZ HUB: generateFromText called with:', { title, contentLength: content.length, options });
    
    if (!this.isConfigured() || !this.model) {
      console.error('❌ QUIZ HUB: Gemini AI is not configured');
      throw new Error('Gemini AI is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }

    const {
      numQuestions = 5,
      difficulty = 'mixed',
      questionTypes = ['flashcard'],
      focusAreas = []
    } = options;

    const prompt = this.buildPrompt(content, title, numQuestions, difficulty, questionTypes, focusAreas);
    console.log('📋 QUIZ HUB: Generated prompt preview:', prompt.substring(0, 200) + '...');

    try {
      console.log('🚀 QUIZ HUB: Sending request to Gemini AI...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ QUIZ HUB: Received response from Gemini AI');
      console.log('📄 QUIZ HUB: Response preview:', text.substring(0, 300) + '...');

      if (!text) {
        throw new Error('No response from Gemini');
      }

      const questions = this.parseQuestions(text);
      console.log('🎯 QUIZ HUB: Successfully parsed questions:', questions.length);
      return questions;
    } catch (error) {
      console.error('❌ QUIZ HUB: Error generating quiz with Gemini:', error);
      throw new Error('Failed to generate quiz questions');
    }
  }

  async generateFromYouTube(
    videoUrl: string,
    title: string,
    options: QuizGenerationOptions = {}
  ): Promise<GeneratedQuestion[]> {
    console.log('🎥 ===== QUIZ HUB: GEMINI YOUTUBE GENERATION START =====');
    console.log('🎥 QUIZ HUB: generateFromYouTube called with:', { videoUrl, title, options });
    
    if (!this.isConfigured() || !this.model) {
      console.error('❌ QUIZ HUB: Gemini AI is not configured');
      throw new Error('Gemini AI is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }

    try {
      // Extract video ID from URL
      console.log('🔍 QUIZ HUB: Extracting video ID from URL...');
      const videoId = youtubeAPI.extractVideoId(videoUrl);
      console.log('🆔 QUIZ HUB: Extracted video ID:', videoId);
      
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      // Check YouTube API configuration
      const youtubeConfigured = youtubeAPI.isConfigured();
      console.log('🔑 QUIZ HUB: YouTube API configured:', youtubeConfigured ? 'YES' : 'NO');

      // ALWAYS try to get video content if YouTube API is configured
      let videoContent = null;
      let useEnhancedPrompt = false;

      if (youtubeConfigured) {
        console.log('🎯 QUIZ HUB: Using YouTube API to fetch video content...');
        try {
          console.log('🚀 QUIZ HUB: CALLING getVideoContentForQuiz...');
          videoContent = await youtubeAPI.getVideoContentForQuiz(videoUrl);
          
          if (videoContent && videoContent.title && videoContent.description) {
            console.log('✅ QUIZ HUB: Successfully fetched video content from YouTube API');
            console.log('📊 QUIZ HUB: Video content details:', {
              title: videoContent.title,
              descriptionLength: videoContent.description.length,
              tagsCount: videoContent.tags?.length || 0,
              transcriptLength: videoContent.transcript?.length || 0,
              metadata: videoContent.metadata
            });
            useEnhancedPrompt = true;
          } else {
            console.log('⚠️ QUIZ HUB: Video content is incomplete, will use fallback');
            videoContent = null;
          }

          // 🔍 DETAILED TRANSCRIPT DEBUGGING FOR GEMINI IN QUIZ HUB
          if (videoContent?.transcript) {
            console.log('📝 ===== QUIZ HUB: GEMINI TRANSCRIPT ANALYSIS =====');
            console.log('📝 QUIZ HUB: TRANSCRIPT FOUND FOR GEMINI!');
            console.log('📝 QUIZ HUB: Transcript length for Gemini:', videoContent.transcript.length);
            console.log('📝 QUIZ HUB: FULL TRANSCRIPT CONTENT FOR GEMINI:');
            console.log('📝 ===== QUIZ HUB: START TRANSCRIPT =====');
            console.log(videoContent.transcript);
            console.log('📝 ===== QUIZ HUB: END TRANSCRIPT =====');
            
            // Check if transcript contains actual content or just placeholder text
            if (videoContent.transcript.includes('[Transcript available but requires additional processing')) {
              console.log('⚠️ QUIZ HUB GEMINI: Transcript is a placeholder - no actual transcript content available');
            } else if (videoContent.transcript.includes('[No transcript available')) {
              console.log('⚠️ QUIZ HUB GEMINI: No transcript available for this video');
            } else if (videoContent.transcript.includes('[Transcript information unavailable')) {
              console.log('⚠️ QUIZ HUB GEMINI: Transcript information unavailable');
            } else {
              console.log('✅ QUIZ HUB GEMINI: Real transcript content detected!');
            }
          } else {
            console.log('❌ QUIZ HUB GEMINI: NO TRANSCRIPT in video content');
          }

        } catch (apiError) {
          console.error('❌ QUIZ HUB: YouTube API failed:', apiError);
          console.log('⚠️ QUIZ HUB: Falling back to basic video processing...');
          videoContent = null;
          useEnhancedPrompt = false;
        }
      } else {
        console.log('⚠️ QUIZ HUB: YouTube API not configured, using basic video info...');
      }

      let prompt: string;

      // FIXED: Only use enhanced prompt if we actually got valid video content
      if (useEnhancedPrompt && videoContent && videoContent.title && videoContent.description) {
        console.log('🚀 QUIZ HUB: Building ENHANCED prompt with YouTube API data...');
        
        // 🔍 TRANSCRIPT ANALYSIS FOR PROMPT IN QUIZ HUB
        let transcriptSection = '';
        if (videoContent.transcript && 
            videoContent.transcript.length > 100 && 
            !videoContent.transcript.includes('[QUIZ HUB:') &&
            !videoContent.transcript.includes('[Transcript available but requires') &&
            !videoContent.transcript.includes('[No transcript available') &&
            !videoContent.transcript.includes('[Transcript information unavailable')) {
          
          console.log('✅ QUIZ HUB: Using REAL transcript in Gemini prompt!');
          console.log('📝 QUIZ HUB: TRANSCRIPT BEING SENT TO GEMINI:');
          console.log('📝 ===== QUIZ HUB: GEMINI PROMPT TRANSCRIPT START =====');
          console.log(videoContent.transcript);
          console.log('📝 ===== QUIZ HUB: GEMINI PROMPT TRANSCRIPT END =====');
          transcriptSection = `TRANSCRIPT (ACTUAL CONTENT): ${videoContent.transcript}`;
        } else {
          console.log('⚠️ QUIZ HUB: Using description and title only (no real transcript)');
          transcriptSection = `TRANSCRIPT: Not available, but use title and description for context`;
        }

        // Enhanced prompt with actual video data from YouTube API
        prompt = `You are an expert educational content creator. I have a YouTube video with the following comprehensive information:

TITLE: ${videoContent.title}

DESCRIPTION: ${videoContent.description}

TAGS: ${videoContent.tags?.join(', ') || 'No tags available'}

${transcriptSection}

METADATA:
- Duration: ${videoContent.metadata?.duration || 'Unknown'}
- Channel: ${videoContent.metadata?.channelTitle || 'Unknown'}
- Views: ${videoContent.metadata?.viewCount || 'Unknown'}
- Published: ${videoContent.metadata?.publishedAt || 'Unknown'}

Based on this comprehensive video content, generate ${options.numQuestions || 5} high-quality, specific study questions and answers that directly relate to the actual content of this video.

Requirements:
- Generate exactly ${options.numQuestions || 5} questions
- Difficulty level: ${options.difficulty || 'mixed'}
- Questions must be SPECIFIC to the actual video content (use the title, description, tags, and transcript when available)
- Focus on educational concepts that are actually covered in this video
- Make questions practical and meaningful for studying this specific content
- Use information from the transcript when available
- Reference specific topics mentioned in the description and tags

Format your response as a JSON array with this structure:
[
  {
    "question": "Your specific question here",
    "answer": "Detailed answer based on video content", 
    "difficulty": "easy|medium|hard",
    "topic": "Specific topic from video"
  }
]

Make sure questions are:
- Directly based on the video's actual content
- Educational and meaningful for learning
- Specific rather than generic
- Varied in scope (some detail-focused, some big-picture)
- Appropriate for the specified difficulty level
- Designed to help students learn from this specific video

IMPORTANT: Respond ONLY with the JSON array, no additional text or formatting.`;

        console.log('📋 ===== QUIZ HUB: FULL GEMINI PROMPT =====');
        console.log(prompt);
        console.log('📋 ===== QUIZ HUB: END GEMINI PROMPT =====');
      } else {
        console.log('⚠️ QUIZ HUB: Building FALLBACK prompt (limited video data)...');
        // Fallback prompt when YouTube API is not available or failed
        prompt = `You are an expert educational content creator. I have a YouTube video with the following basic information:

URL: ${videoUrl}
Title: ${title}

Since detailed video content is not available, generate ${options.numQuestions || 5} educational study questions that would be appropriate for a video with this title. Make the questions as relevant as possible based on the title and common educational patterns.

Requirements:
- Generate exactly ${options.numQuestions || 5} questions
- Difficulty level: ${options.difficulty || 'mixed'}
- Questions should be relevant to the likely content based on the title
- Focus on educational concepts that would typically be covered in such a video
- Make questions practical and meaningful for studying

Format your response as a JSON array with this structure:
[
  {
    "question": "Your question here",
    "answer": "Detailed answer here", 
    "difficulty": "easy|medium|hard",
    "topic": "Main topic/concept"
  }
]

IMPORTANT: Respond ONLY with the JSON array, no additional text or formatting.`;

        console.log('📋 ===== QUIZ HUB: FALLBACK GEMINI PROMPT =====');
        console.log(prompt);
        console.log('📋 ===== QUIZ HUB: END FALLBACK PROMPT =====');
      }

      console.log('🚀 QUIZ HUB: Sending request to Gemini AI...');

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ QUIZ HUB: Received response from Gemini AI');
      console.log('📄 ===== QUIZ HUB: FULL GEMINI RESPONSE =====');
      console.log(text);
      console.log('📄 ===== QUIZ HUB: END GEMINI RESPONSE =====');

      if (!text) {
        throw new Error('No response from Gemini');
      }

      const questions = this.parseQuestions(text);
      console.log('🎯 QUIZ HUB: Successfully parsed questions:', questions.length);
      console.log('📝 QUIZ HUB: Generated questions preview:', questions.map(q => q.question.substring(0, 50) + '...'));
      console.log('🎥 ===== QUIZ HUB: GEMINI YOUTUBE GENERATION END =====');
      
      return questions;
    } catch (error) {
      console.error('❌ QUIZ HUB: Error generating quiz from YouTube video:', error);
      console.log('🔄 QUIZ HUB: This error will cause fallback to sample questions in the calling function');
      
      // Re-throw the error so the calling function can handle the fallback
      throw error;
    }
  }

  private generateFallbackYouTubeQuestions(
    title: string, 
    videoUrl: string, 
    options: QuizGenerationOptions = {}
  ): GeneratedQuestion[] {
    console.log('🔄 QUIZ HUB: Generating fallback YouTube questions for:', title);
    
    const numQuestions = options.numQuestions || 5;
    const difficulty = options.difficulty || 'mixed';
    
    // Generate more specific fallback questions based on the video title
    const questions: GeneratedQuestion[] = [
      {
        question: `What is the main topic or subject covered in the video "${title}"?`,
        answer: `The main topic of this video focuses on the key concepts and educational content related to ${title}. Students should pay attention to the primary learning objectives and main ideas presented.`,
        difficulty: 'easy' as const,
        topic: 'Main Topic'
      },
      {
        question: `What are the key learning objectives that students should focus on while watching "${title}"?`,
        answer: `The key learning objectives include understanding the fundamental concepts, being able to apply the knowledge presented, and grasping the practical implications of the material covered in the video.`,
        difficulty: 'medium' as const,
        topic: 'Learning Objectives'
      },
      {
        question: `How can the information presented in "${title}" be applied in real-world scenarios?`,
        answer: `The information can be applied by using the concepts and principles demonstrated in the video to solve practical problems, make informed decisions, and understand related topics in the field.`,
        difficulty: 'hard' as const,
        topic: 'Practical Application'
      },
      {
        question: `What are the most important points or takeaways from "${title}" that students should remember?`,
        answer: `The most important takeaways include the core concepts explained, any formulas or methods demonstrated, key terminology introduced, and the overall understanding of how these elements work together.`,
        difficulty: 'medium' as const,
        topic: 'Key Takeaways'
      },
      {
        question: `What additional resources or topics should students explore after watching "${title}" to deepen their understanding?`,
        answer: `Students should explore related topics, practice problems, additional examples, and supplementary materials that build upon the concepts introduced in this video to gain a more comprehensive understanding.`,
        difficulty: 'medium' as const,
        topic: 'Further Study'
      }
    ];

    console.log('✅ QUIZ HUB: Generated fallback questions:', questions.length);
    // Return the requested number of questions
    return questions.slice(0, numQuestions);
  }

  async generateFromDocument(
    documentText: string,
    filename: string,
    options: QuizGenerationOptions = {}
  ): Promise<GeneratedQuestion[]> {
    console.log('📄 QUIZ HUB: generateFromDocument called with:', { filename, textLength: documentText.length, options });
    
    // Truncate very long documents to stay within token limits
    const maxLength = 30000; // Gemini has higher token limits than GPT-3.5
    const truncatedText = documentText.length > maxLength 
      ? documentText.substring(0, maxLength) + "..."
      : documentText;

    if (documentText.length > maxLength) {
      console.log('✂️ QUIZ HUB: Document truncated from', documentText.length, 'to', maxLength, 'characters');
    }

    return this.generateFromText(truncatedText, filename, options);
  }

  async generateFromImage(
    imageDescription: string,
    filename: string,
    options: QuizGenerationOptions = {}
  ): Promise<GeneratedQuestion[]> {
    console.log('🖼️ QUIZ HUB: generateFromImage called with:', { filename, description: imageDescription, options });
    
    const content = `This is an image file named "${filename}". ${imageDescription}. Generate study questions based on what might be shown in this educational image. Focus on visual learning concepts, diagrams, charts, or any text that might be visible in educational images.`;
    
    return this.generateFromText(content, filename, options);
  }

  async generateFromImageFile(
    imageFile: File,
    filename: string,
    options: QuizGenerationOptions = {}
  ): Promise<GeneratedQuestion[]> {
    console.log('🖼️ QUIZ HUB: generateFromImageFile called with:', { filename, fileSize: imageFile.size, fileType: imageFile.type, options });
    
    if (!this.isConfigured() || !this.model) {
      console.log('⚠️ QUIZ HUB: Gemini not configured, falling back to text-based generation');
      // Fallback to text-based generation
      return this.generateFromImage(`Educational image: ${filename}`, filename, options);
    }

    try {
      console.log('🔄 QUIZ HUB: Converting image file to base64...');
      // Convert image file to base64
      const imageData = await this.fileToGenerativePart(imageFile);
      console.log('✅ QUIZ HUB: Image converted successfully');
      
      const {
        numQuestions = 5,
        difficulty = 'mixed'
      } = options;

      const prompt = `Analyze this educational image and generate ${numQuestions} study questions and answers based on what you see. 

Requirements:
- Generate exactly ${numQuestions} questions
- Difficulty level: ${difficulty}
- Focus on educational content visible in the image
- Include questions about diagrams, text, formulas, or concepts shown

Format your response as a JSON array with this structure:
[
  {
    "question": "Your question here",
    "answer": "Detailed answer here", 
    "difficulty": "easy|medium|hard",
    "topic": "Main topic/concept"
  }
]

Make sure questions are:
- Clear and specific to what's shown in the image
- Educational and meaningful
- Varied in scope (some detail-focused, some big-picture)
- Appropriate for the specified difficulty level`;

      console.log('🚀 QUIZ HUB: Sending image analysis request to Gemini AI...');
      const result = await this.model.generateContent([prompt, imageData]);
      const response = await result.response;
      const text = response.text();

      console.log('✅ QUIZ HUB: Received image analysis response from Gemini AI');
      console.log('📄 QUIZ HUB: Response preview:', text.substring(0, 300) + '...');

      const questions = this.parseQuestions(text);
      console.log('🎯 QUIZ HUB: Successfully parsed image questions:', questions.length);
      return questions;
    } catch (error) {
      console.error('❌ QUIZ HUB: Error generating quiz from image with Gemini:', error);
      console.log('🔄 QUIZ HUB: Falling back to text-based generation...');
      // Fallback to text-based generation
      return this.generateFromImage(`Educational image: ${filename}`, filename, options);
    }
  }

  private async fileToGenerativePart(file: File) {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.readAsDataURL(file);
    });

    return {
      inlineData: {
        data: await base64EncodedDataPromise,
        mimeType: file.type,
      },
    };
  }

  private buildPrompt(
    content: string,
    title: string,
    numQuestions: number,
    difficulty: string,
    questionTypes: string[],
    focusAreas: string[]
  ): string {
    let prompt = `You are an expert educational content creator. Based on the following content titled "${title}", generate ${numQuestions} high-quality educational questions and answers.\n\n`;
    
    prompt += `Content:\n${content}\n\n`;
    
    prompt += `Requirements:\n`;
    prompt += `- Generate exactly ${numQuestions} questions\n`;
    prompt += `- Difficulty level: ${difficulty}\n`;
    prompt += `- Question types: ${questionTypes.join(', ')}\n`;
    
    if (focusAreas.length > 0) {
      prompt += `- Focus on these areas: ${focusAreas.join(', ')}\n`;
    }
    
    prompt += `\nFormat your response as a JSON array with this structure:\n`;
    prompt += `[\n`;
    prompt += `  {\n`;
    prompt += `    "question": "Your question here",\n`;
    prompt += `    "answer": "Detailed answer here",\n`;
    prompt += `    "difficulty": "easy|medium|hard",\n`;
    prompt += `    "topic": "Main topic/concept"\n`;
    prompt += `  }\n`;
    prompt += `]\n\n`;
    
    prompt += `Make sure questions are:\n`;
    prompt += `- Clear and specific\n`;
    prompt += `- Educational and meaningful\n`;
    prompt += `- Based directly on the provided content\n`;
    prompt += `- Varied in scope (some detail-focused, some big-picture)\n`;
    prompt += `- Appropriate for the specified difficulty level\n`;
    prompt += `- Designed to help students learn and retain information\n\n`;
    
    prompt += `IMPORTANT: Respond ONLY with the JSON array, no additional text or formatting.`;

    return prompt;
  }

  private parseQuestions(response: string): GeneratedQuestion[] {
    console.log('🔍 QUIZ HUB: Parsing questions from response...');
    console.log('📄 QUIZ HUB: Raw response length:', response.length);
    
    try {
      // Clean up the response to extract JSON
      let cleanResponse = response.trim();
      
      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Try to extract JSON from the response
      const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('❌ QUIZ HUB: No JSON found in response');
        console.log('📄 QUIZ HUB: Response content:', response);
        throw new Error('No JSON found in response');
      }

      console.log('✅ QUIZ HUB: Found JSON in response');
      const questions = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(questions)) {
        console.error('❌ QUIZ HUB: Response is not an array');
        throw new Error('Response is not an array');
      }

      console.log('✅ QUIZ HUB: Successfully parsed', questions.length, 'questions');
      const parsedQuestions = questions.map((q: any) => ({
        question: q.question || '',
        answer: q.answer || '',
        difficulty: q.difficulty || 'medium',
        topic: q.topic || 'General'
      }));

      console.log('📝 QUIZ HUB: Parsed questions preview:', parsedQuestions.map(q => ({
        question: q.question.substring(0, 50) + '...',
        topic: q.topic,
        difficulty: q.difficulty
      })));

      return parsedQuestions;
    } catch (error) {
      console.error('❌ QUIZ HUB: Error parsing questions:', error);
      console.log('📄 QUIZ HUB: Raw response:', response);
      
      // Re-throw the error so the calling function can handle the fallback
      throw error;
    }
  }
}

export const geminiQuizGenerator = GeminiQuizGenerator.getInstance();

/**
 * Calls the Supabase Edge Function to generate a quiz from a YouTube video.
 * Returns an array of questions in the Gemini format.
 */
export async function generateYouTubeQuizEdge(videoUrl: string): Promise<GeneratedQuestion[]> {
  console.log('🌐 QUIZ HUB: Calling YouTube quiz edge function for:', videoUrl);
  
  try {
    const { data, error } = await supabase.functions.invoke('youtube-quiz-generator', {
      body: { video_url: videoUrl },
    });
    
    if (error) {
      console.error('❌ QUIZ HUB: Edge function error:', error);
      throw error;
    }
    
    if (!data || !data.quiz) {
      console.error('❌ QUIZ HUB: No quiz returned from edge function');
      throw new Error('No quiz returned from edge function');
    }
    
    console.log('✅ QUIZ HUB: Edge function returned quiz with', data.quiz.length, 'questions');
    console.log('📝 QUIZ HUB: Edge function quiz preview:', data.quiz.map((q: any) => q.question?.substring(0, 50) + '...'));
    
    // Convert edge function format to our format
    const convertedQuestions = data.quiz.map((q: any) => ({
      question: q.question || '',
      answer: q.answer || (q.options ? `Correct answer: ${q.answer}. Options were: ${q.options.join(', ')}` : ''),
      difficulty: 'medium' as const,
      topic: 'Video Content'
    }));
    
    return convertedQuestions;
  } catch (error) {
    console.error('❌ QUIZ HUB: Edge function failed:', error);
    throw error;
  }
}