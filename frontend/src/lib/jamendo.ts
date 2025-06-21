const JAMENDO_CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID || '0f57f15a';
const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0';

export interface JamendoTrack {
  id: string;
  name: string;
  duration: number;
  artist_id: string;
  artist_name: string;
  album_id: string;
  album_name: string;
  audio: string;
  audiodownload: string;
  image: string;
  waveform: string;
  tags: string[];
}

export interface JamendoSearchResponse {
  headers: {
    status: string;
    code: number;
    error_message?: string;
  };
  results: JamendoTrack[];
}

export interface JamendoPlaylist {
  id: string;
  name: string;
  description: string;
  image: string;
  tracks: JamendoTrack[];
}

class JamendoAPI {
  private clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const url = new URL(`${JAMENDO_BASE_URL}${endpoint}`);
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('format', 'json');
    
    // Add additional parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.headers && data.headers.status !== 'ok') {
        console.error('Jamendo API error:', data.headers);
      }
      return data;
    } catch (error) {
      console.error('Jamendo API request failed:', error);
      throw error;
    }
  }

  async searchTracks(query: string, limit: number = 20): Promise<JamendoTrack[]> {
    const params = {
      search: query,
      limit: limit.toString()
    };

    const response = await this.makeRequest('/tracks/', params);
    return response.results || [];
  }

  async searchStudyMusic(limit: number = 20): Promise<JamendoTrack[]> {
    const studyKeywords = ['instrumental', 'ambient', 'focus', 'study', 'classical', 'piano', 'chill'];
    const randomKeyword = studyKeywords[Math.floor(Math.random() * studyKeywords.length)];
    
    return this.searchTracks(randomKeyword, limit);
  }

  async getTrackById(trackId: string): Promise<JamendoTrack | null> {
    const params = {
      id: trackId
    };

    const response = await this.makeRequest('/tracks/', params);
    return response.results?.[0] || null;
  }

  async getPopularTracks(limit: number = 20): Promise<JamendoTrack[]> {
    const params = {
      limit: limit.toString(),
      orderby: 'popularity_total'
    };

    const response = await this.makeRequest('/tracks/', params);
    return response.results || [];
  }

  async getTracksByTag(tag: string, limit: number = 20): Promise<JamendoTrack[]> {
    const params = {
      tags: tag,
      limit: limit.toString()
    };

    const response = await this.makeRequest('/tracks/', params);
    return response.results || [];
  }
}

export const jamendoAPI = new JamendoAPI(JAMENDO_CLIENT_ID); 