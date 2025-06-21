const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  likeCount: string;
  videoUrl: string;
  tags?: string[];
  categoryId?: string;
  defaultLanguage?: string;
  transcript?: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  videoCount: number;
  playlistUrl: string;
}

export interface YouTubeSearchResponse {
  items: any[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface YouTubeVideoDetails {
  id: string;
  title: string;
  description: string;
  tags: string[];
  categoryId: string;
  duration: string;
  viewCount: string;
  likeCount: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string;
  defaultLanguage?: string;
  transcript?: string;
}

class YouTubeAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    
    // Enhanced debugging for API key configuration
    console.log('🎥 ===== QUIZ HUB: YOUTUBE API INITIALIZATION =====');
    console.log('🔑 QUIZ HUB: Environment variable VITE_YOUTUBE_API_KEY exists:', !!import.meta.env.VITE_YOUTUBE_API_KEY);
    console.log('🔑 QUIZ HUB: Raw API key value:', import.meta.env.VITE_YOUTUBE_API_KEY ? 'EXISTS' : 'MISSING');
    console.log('🔑 QUIZ HUB: API key length:', apiKey?.length || 0);
    console.log('🔑 QUIZ HUB: API key type:', typeof apiKey);
    console.log('🔑 QUIZ HUB: API key is empty string:', apiKey === '');
    console.log('🔑 QUIZ HUB: API key is undefined:', apiKey === undefined);
    console.log('🔑 QUIZ HUB: API key is null:', apiKey === null);
    
    if (apiKey && apiKey.length > 0) {
      console.log('✅ QUIZ HUB: YouTube API Key configured successfully!');
      console.log('🔑 QUIZ HUB: YouTube API Key preview:', apiKey.substring(0, 15) + '...');
      console.log('🔑 QUIZ HUB: YouTube API Key ends with:', '...' + apiKey.substring(apiKey.length - 10));
    } else {
      console.log('❌ QUIZ HUB: YouTube API Key NOT configured!');
      console.log('⚠️ QUIZ HUB: Please ensure VITE_YOUTUBE_API_KEY is set in your Vercel environment variables');
      console.log('💡 QUIZ HUB: Get your YouTube API key from: https://console.developers.google.com/');
    }
    console.log('🎥 ===== QUIZ HUB: END YOUTUBE API INITIALIZATION =====');
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    if (!this.isConfigured()) {
      console.error('❌ QUIZ HUB: YouTube API not configured - cannot make request to:', endpoint);
      throw new Error('YouTube API not configured. Please add VITE_YOUTUBE_API_KEY to your environment variables.');
    }

    const url = new URL(`${YOUTUBE_BASE_URL}${endpoint}`);
    url.searchParams.set('key', this.apiKey);
    if (endpoint === '/search') {
      url.searchParams.set('part', 'snippet');
    } else if (endpoint === '/videos') {
      url.searchParams.set('part', 'snippet,contentDetails,statistics');
    } else if (endpoint === '/playlistItems') {
      url.searchParams.set('part', 'snippet');
    } else if (endpoint === '/captions') {
      url.searchParams.set('part', 'snippet');
    }
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    console.log('🌐 QUIZ HUB: Making YouTube API request to:', endpoint);
    console.log('📋 QUIZ HUB: Request params:', params);
    console.log('🔗 QUIZ HUB: Full URL (without key):', url.toString().replace(this.apiKey, 'HIDDEN_KEY'));

    try {
      const response = await fetch(url.toString());
      console.log('📡 QUIZ HUB: YouTube API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ QUIZ HUB: YouTube API HTTP error:', response.status, response.statusText);
        console.error('❌ QUIZ HUB: Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      if (data.error) {
        console.error('❌ QUIZ HUB: YouTube API error:', data.error);
        throw new Error(data.error.message || 'YouTube API error');
      }
      
      console.log('✅ QUIZ HUB: YouTube API request successful');
      console.log('📊 QUIZ HUB: Response data preview:', {
        itemsCount: data.items?.length || 0,
        pageInfo: data.pageInfo
      });
      
      return data;
    } catch (error) {
      console.error('❌ QUIZ HUB: YouTube API request failed:', error);
      throw error;
    }
  }

  async getVideoDetails(videoId: string): Promise<YouTubeVideoDetails | null> {
    console.log('🔍 ===== QUIZ HUB: Getting video details for ID:', videoId, '=====');
    
    if (!this.isConfigured()) {
      console.error('❌ QUIZ HUB: YouTube API not configured - cannot get video details');
      return null;
    }

    try {
      const response = await this.makeRequest('/videos', {
        id: videoId,
        part: 'snippet,contentDetails,statistics'
      });

      if (!response.items || response.items.length === 0) {
        console.log('⚠️ QUIZ HUB: No video found for ID:', videoId);
        return null;
      }

      const video = response.items[0];
      const snippet = video.snippet;
      const contentDetails = video.contentDetails;
      const statistics = video.statistics;

      console.log('📊 QUIZ HUB: Video details retrieved:', {
        title: snippet.title,
        channelTitle: snippet.channelTitle,
        duration: contentDetails.duration,
        viewCount: statistics.viewCount,
        descriptionLength: snippet.description?.length || 0,
        tagsCount: snippet.tags?.length || 0
      });

      // 🔍 ENHANCED TRANSCRIPT DEBUGGING FOR QUIZ HUB
      console.log('📝 ===== QUIZ HUB TRANSCRIPT DEBUGGING START =====');
      let transcript = '';
      try {
        console.log('📝 QUIZ HUB: Attempting to get video transcript...');
        transcript = await this.getVideoTranscript(videoId);
        console.log('📝 QUIZ HUB: Transcript retrieved successfully!');
        console.log('📝 QUIZ HUB: Transcript length:', transcript.length);
        console.log('📝 QUIZ HUB: Transcript type:', typeof transcript);
        
        // 🔍 DETAILED TRANSCRIPT CONTENT ANALYSIS FOR QUIZ HUB
        if (transcript && transcript.length > 0) {
          console.log('📝 ===== QUIZ HUB: FULL TRANSCRIPT CONTENT =====');
          console.log('📝 QUIZ HUB COMPLETE TRANSCRIPT:', transcript);
          console.log('📝 ===== QUIZ HUB: END FULL TRANSCRIPT =====');
          
          console.log('📝 QUIZ HUB: Transcript first 1000 characters:', transcript.substring(0, 1000));
          console.log('📝 QUIZ HUB: Transcript last 500 characters:', transcript.substring(Math.max(0, transcript.length - 500)));
          
          // Check for placeholder patterns
          const placeholderPatterns = [
            '[Transcript available but requires additional processing',
            '[No transcript available',
            '[Transcript information unavailable',
            'Captions are available',
            'caption track(s) available'
          ];
          
          let isPlaceholder = false;
          for (const pattern of placeholderPatterns) {
            if (transcript.includes(pattern)) {
              console.log('⚠️ QUIZ HUB: DETECTED PLACEHOLDER PATTERN:', pattern);
              isPlaceholder = true;
              break;
            }
          }
          
          if (!isPlaceholder) {
            console.log('✅ QUIZ HUB: TRANSCRIPT APPEARS TO BE REAL CONTENT!');
            console.log('📝 QUIZ HUB: Transcript word count:', transcript.split(' ').length);
            console.log('📝 QUIZ HUB: Transcript contains numbers:', /\d/.test(transcript));
            console.log('📝 QUIZ HUB: Transcript contains common words:', /\b(the|and|is|to|of|a|in|that|have|for|not|with|he|as|you|do|at)\b/i.test(transcript));
          } else {
            console.log('⚠️ QUIZ HUB: TRANSCRIPT IS A PLACEHOLDER - NO REAL CONTENT');
          }
        } else {
          console.log('❌ QUIZ HUB: TRANSCRIPT IS EMPTY OR NULL');
        }
      } catch (error) {
        console.log('❌ QUIZ HUB: Could not fetch transcript for video:', videoId, error);
        transcript = `[Error fetching transcript: ${error.message}]`;
      }
      console.log('📝 ===== QUIZ HUB TRANSCRIPT DEBUGGING END =====');

      const videoDetails = {
        id: videoId,
        title: snippet.title,
        description: snippet.description || '',
        tags: snippet.tags || [],
        categoryId: snippet.categoryId,
        duration: contentDetails.duration,
        viewCount: statistics.viewCount || '0',
        likeCount: statistics.likeCount || '0',
        channelTitle: snippet.channelTitle,
        publishedAt: snippet.publishedAt,
        thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url || '',
        defaultLanguage: snippet.defaultLanguage,
        transcript
      };

      console.log('✅ QUIZ HUB: Video details compiled successfully');
      console.log('📊 QUIZ HUB: Final video details summary:', {
        titleLength: videoDetails.title.length,
        descriptionLength: videoDetails.description.length,
        tagsCount: videoDetails.tags.length,
        transcriptLength: videoDetails.transcript?.length || 0,
        transcriptPreview: videoDetails.transcript?.substring(0, 100) + '...'
      });
      
      return videoDetails;
    } catch (error) {
      console.error('❌ QUIZ HUB: Error fetching video details:', error);
      return null;
    }
  }

  async getVideoTranscript(videoId: string): Promise<string> {
    console.log('📝 ===== QUIZ HUB: TRANSCRIPT FETCH ATTEMPT =====');
    console.log('📝 QUIZ HUB: Attempting to get transcript for video:', videoId);
    
    if (!this.isConfigured()) {
      console.log('❌ QUIZ HUB: YouTube API not configured - cannot fetch transcript');
      return '[QUIZ HUB: YouTube API not configured. Add VITE_YOUTUBE_API_KEY to enable transcript fetching.]';
    }
    
    try {
      // Try to get captions using YouTube API
      console.log('🔍 QUIZ HUB: Checking for available captions...');
      
      try {
        const captionsResponse = await this.makeRequest('/captions', {
          videoId: videoId,
          part: 'snippet'
        });

        console.log('📝 QUIZ HUB: Captions API response:', captionsResponse);

        if (captionsResponse.items && captionsResponse.items.length > 0) {
          console.log('✅ QUIZ HUB: Captions available:', captionsResponse.items.length, 'track(s)');
          console.log('📝 QUIZ HUB: Caption tracks details:', captionsResponse.items.map((item: any) => ({
            id: item.id,
            language: item.snippet.language,
            name: item.snippet.name,
            trackKind: item.snippet.trackKind
          })));
          
          // Captions are available, but we can't directly access the content via API
          const captionInfo = captionsResponse.items.map((item: any) => 
            `${item.snippet.language} (${item.snippet.name})`
          ).join(', ');
          
          const transcriptMessage = `[QUIZ HUB: Transcript available but requires additional processing. Video has ${captionsResponse.items.length} caption track(s) available: ${captionInfo}. To get actual transcript content, you would need to use a third-party service or implement caption track downloading.]`;
          
          console.log('📝 QUIZ HUB: Returning caption availability message:', transcriptMessage);
          return transcriptMessage;
        } else {
          console.log('⚠️ QUIZ HUB: No captions available for this video');
          const noTranscriptMessage = '[QUIZ HUB: No transcript available for this video. The video does not have captions or subtitles enabled.]';
          console.log('📝 QUIZ HUB: Returning no transcript message:', noTranscriptMessage);
          return noTranscriptMessage;
        }
      } catch (captionError) {
        console.log('❌ QUIZ HUB: Captions API call failed:', captionError);
        
        // Try alternative approach - check if we can get any transcript info
        console.log('🔄 QUIZ HUB: Trying alternative transcript detection...');
        
        const alternativeMessage = `[QUIZ HUB: Transcript information unavailable. Caption API access failed: ${captionError.message}. For real transcript extraction, integrate with youtube-transcript-api or similar service.]`;
        console.log('📝 QUIZ HUB: Returning alternative message:', alternativeMessage);
        return alternativeMessage;
      }
    } catch (error) {
      console.log('❌ QUIZ HUB: General transcript fetch error:', error);
      const errorMessage = `[QUIZ HUB: Transcript fetch failed: ${error.message}. This is expected as YouTube API doesn't provide direct transcript access.]`;
      console.log('📝 QUIZ HUB: Returning error message:', errorMessage);
      return errorMessage;
    }
  }

  extractVideoId(url: string): string | null {
    console.log('🔍 QUIZ HUB: Extracting video ID from URL:', url);
    
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    const videoId = match ? match[1] : null;
    
    console.log('🆔 QUIZ HUB: Extracted video ID:', videoId);
    return videoId;
  }

  async getVideoContentForQuiz(videoUrl: string): Promise<{
    title: string;
    description: string;
    tags: string[];
    transcript: string;
    metadata: any;
  } | null> {
    console.log('🎯 ===== QUIZ HUB: GET VIDEO CONTENT FOR QUIZ =====');
    console.log('🎯 QUIZ HUB: Getting video content for quiz generation from URL:', videoUrl);
    
    const videoId = this.extractVideoId(videoUrl);
    if (!videoId) {
      console.error('❌ QUIZ HUB: Invalid YouTube URL provided');
      throw new Error('Invalid YouTube URL');
    }

    console.log('🔍 QUIZ HUB: Fetching video details for quiz generation...');
    const videoDetails = await this.getVideoDetails(videoId);
    if (!videoDetails) {
      console.error('❌ QUIZ HUB: Could not fetch video details');
      throw new Error('Could not fetch video details');
    }

    const content = {
      title: videoDetails.title,
      description: videoDetails.description,
      tags: videoDetails.tags,
      transcript: videoDetails.transcript || '',
      metadata: {
        duration: videoDetails.duration,
        viewCount: videoDetails.viewCount,
        channelTitle: videoDetails.channelTitle,
        publishedAt: videoDetails.publishedAt,
        categoryId: videoDetails.categoryId
      }
    };

    console.log('✅ QUIZ HUB: Video content compiled for quiz generation:');
    console.log('📊 QUIZ HUB: CONTENT SUMMARY:');
    console.log('  - Title:', content.title);
    console.log('  - Title length:', content.title.length);
    console.log('  - Description length:', content.description.length);
    console.log('  - Tags count:', content.tags.length);
    console.log('  - Tags:', content.tags);
    console.log('  - Transcript length:', content.transcript.length);
    console.log('  - Channel:', content.metadata.channelTitle);
    console.log('  - Duration:', content.metadata.duration);
    console.log('  - Views:', content.metadata.viewCount);
    
    console.log('📝 ===== QUIZ HUB: FULL CONTENT FOR GEMINI =====');
    console.log('📝 QUIZ HUB: TITLE FOR GEMINI:', content.title);
    console.log('📝 QUIZ HUB: DESCRIPTION FOR GEMINI (first 500 chars):', content.description.substring(0, 500));
    console.log('📝 QUIZ HUB: TAGS FOR GEMINI:', content.tags.join(', '));
    console.log('📝 QUIZ HUB: TRANSCRIPT FOR GEMINI:', content.transcript);
    console.log('📝 ===== QUIZ HUB: END CONTENT FOR GEMINI =====');

    return content;
  }

  async searchVideos(query: string, maxResults: number = 20): Promise<YouTubeVideo[]> {
    if (!this.isConfigured()) {
      console.error('❌ QUIZ HUB: YouTube API not configured - cannot search videos');
      return [];
    }

    const params = {
      q: query,
      type: 'video',
      maxResults: maxResults.toString(),
      videoCategoryId: '10', // Music category
      order: 'relevance'
    };

    const response = await this.makeRequest('/search', params);
    
    if (!response.items || response.items.length === 0) {
      return [];
    }

    // Get video details for each result
    const videoIds = response.items.map((item: any) => item.id.videoId).join(',');
    const videoDetails = await this.getVideoDetails(videoIds);
    
    return response.items.map((item: any, index: number) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      duration: videoDetails[index]?.duration || 'PT0S',
      viewCount: videoDetails[index]?.viewCount || '0',
      likeCount: videoDetails[index]?.likeCount || '0',
      videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      tags: item.snippet.tags || []
    }));
  }

  async searchStudyMusic(maxResults: number = 20): Promise<YouTubeVideo[]> {
    const studyKeywords = [
      'instrumental study music',
      'ambient study music',
      'focus music',
      'classical study music',
      'piano study music',
      'chill study music',
      'lofi study music'
    ];
    
    const randomKeyword = studyKeywords[Math.floor(Math.random() * studyKeywords.length)];
    return this.searchVideos(randomKeyword, maxResults);
  }

  async searchPlaylists(query: string, maxResults: number = 20): Promise<YouTubePlaylist[]> {
    if (!this.isConfigured()) {
      console.error('❌ QUIZ HUB: YouTube API not configured - cannot search playlists');
      return [];
    }

    const params = {
      q: query,
      type: 'playlist',
      maxResults: maxResults.toString(),
      order: 'relevance'
    };

    const response = await this.makeRequest('/search', params);
    
    if (!response.items || response.items.length === 0) {
      return [];
    }

    return response.items.map((item: any) => ({
      id: item.id.playlistId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      videoCount: 0, // Would need additional API call to get this
      playlistUrl: `https://www.youtube.com/playlist?list=${item.id.playlistId}`
    }));
  }

  async getPlaylistVideos(playlistId: string, maxResults: number = 50): Promise<YouTubeVideo[]> {
    if (!this.isConfigured()) {
      console.error('❌ QUIZ HUB: YouTube API not configured - cannot get playlist videos');
      return [];
    }

    const params = {
      playlistId: playlistId,
      maxResults: maxResults.toString()
    };

    const response = await this.makeRequest('/playlistItems', params);
    
    if (!response.items || response.items.length === 0) {
      return [];
    }

    // Get video details for each playlist item
    const videoIds = response.items.map((item: any) => item.snippet.resourceId.videoId).join(',');
    const videoDetails = await this.getVideoDetails(videoIds);
    
    return response.items.map((item: any, index: number) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      duration: videoDetails[index]?.duration || 'PT0S',
      viewCount: videoDetails[index]?.viewCount || '0',
      likeCount: videoDetails[index]?.likeCount || '0',
      videoUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
      tags: []
    }));
  }

  formatDuration(duration: string): string {
    // Convert ISO 8601 duration (PT4M13S) to MM:SS format
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  formatViewCount(viewCount: string): string {
    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }

  // Check if API key is configured
  isConfigured(): boolean {
    const isConfigured = !!(this.apiKey && this.apiKey.trim() !== '');
    console.log('🔑 QUIZ HUB: YouTube API configured:', isConfigured ? 'YES' : 'NO');
    if (isConfigured) {
      console.log('🔑 QUIZ HUB: YouTube API Key preview:', this.apiKey.substring(0, 15) + '...');
    } else {
      console.log('⚠️ QUIZ HUB: YouTube API not configured. Add VITE_YOUTUBE_API_KEY to environment variables.');
      console.log('💡 QUIZ HUB: Get your YouTube API key from: https://console.developers.google.com/');
      console.log('🔧 QUIZ HUB: Current environment variables check:');
      console.log('   - VITE_YOUTUBE_API_KEY exists:', !!import.meta.env.VITE_YOUTUBE_API_KEY);
      console.log('   - VITE_YOUTUBE_API_KEY value:', import.meta.env.VITE_YOUTUBE_API_KEY ? 'SET' : 'NOT_SET');
    }
    return isConfigured;
  }
}

export const youtubeAPI = new YouTubeAPI(YOUTUBE_API_KEY);