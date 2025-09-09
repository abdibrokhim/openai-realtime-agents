// Englify Backend API Service
// Handles authentication and API calls to backend services

interface EnglifyApiConfig {
  baseUrl: string;
  apiToken: string;
  bearerToken?: string;
}

class EnglifyApiService {
  private config: EnglifyApiConfig;

  constructor(config: EnglifyApiConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    // Remove leading slash if present since we're using proxy
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${this.config.baseUrl}/${cleanEndpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Student Profile API
  async getUserProfile(): Promise<any> {
    return this.makeRequest('/student/v1/profile');
  }

  // Leaderboard API
  async getLeaderboard(level: number = 1): Promise<any> {
    return this.makeRequest(`/student/v1/ranking/${level}`);
  }

  // User Medals/Achievements API
  async getUserMedals(userId: string): Promise<any> {
    return this.makeRequest(`/student/v1/public-profile/view?id=${userId}`);
  }

  // Available Levels API
  async getLevels(): Promise<any> {
    return this.makeRequest('/student/v1/level');
  }

  // Podcasts API
  async getPodcasts(): Promise<any> {
    return this.makeRequest('/student/v1/resource/podcasts');
  }

  async getPodcastById(id: string): Promise<any> {
    return this.makeRequest(`/student/v1/resource/podcast/${id}`);
  }

  // Movies API
  async getMovies(): Promise<any> {
    return this.makeRequest('/student/v1/resource/movies');
  }

  async getMovieById(id: string): Promise<any> {
    return this.makeRequest(`/student/v1/resource/movie/${id}`);
  }

  // Books API
  async getBooks(): Promise<any> {
    return this.makeRequest('/student/v1/resource/books');
  }

  // Exclusive Content API
  async getExclusiveContent(): Promise<any> {
    return this.makeRequest('/student/v1/resource/exclusives');
  }

  // Comments API
  async getComments(resourceId: string): Promise<any> {
    return this.makeRequest(`/student/v1/resource/comments?resource_id=${resourceId}`);
  }
}

// Initialize API service with client-side configuration (using local proxy)
export function createEnglifyApiService(): EnglifyApiService {
  // Use local Next.js API route as proxy instead of direct API calls
  const config: EnglifyApiConfig = {
    baseUrl: '/api/englify', // Local proxy route
    apiToken: 'client-side', // Placeholder, actual auth handled by proxy
  };

  return new EnglifyApiService(config);
}

export { EnglifyApiService };
