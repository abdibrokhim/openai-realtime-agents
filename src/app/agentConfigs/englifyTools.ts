import { tool } from '@openai/agents/realtime';
import { z } from 'zod';
import { createEnglifyApiService } from './englifyApiService';

// Tool: Get User Profile
export const getUserProfile = tool({
  name: 'getUserProfile',
  description: 'Get the current user profile including level, points, payment status, and preferences. Use this to understand the user\'s current learning status.',
  parameters: z.object({}),
  execute: async () => {
    try {
      const apiService = createEnglifyApiService();
      const profile = await apiService.getUserProfile();
      if (!profile?.result) {
        return 'Unable to fetch user profile. Please try again.';
      }
      
      const user = profile.result;
      return `User Profile:
- Name: ${user.firstname || 'Unknown'}
- Level: ${user.level || 'Unknown'}
- Points: ${user.performance?.point || 0}
- Coins: ${user.performance?.coin || 0}
- Payment Status: ${user.payment_access === 100 ? 'Active' : 'Inactive'}`;
    } catch (error) {
      return `Error fetching user profile: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
  errorFunction: (context, error) => {
    return `Failed to get user profile. Please check your connection and try again.`;
  },
});

// Tool: Get Leaderboard
export const getLeaderboard = tool({
  name: 'getLeaderboard',
  description: 'Get leaderboard ranking for a specific level. Use this when users want to see their ranking or compare with other students.',
  parameters: z.object({
    level: z.number()
      .min(1, 'Level must be at least 1')
      .max(7, 'Level must be at most 7')
      .describe('Level number: 1=Starter, 2=Beginner, 3=Elementary, 4=Pre-Intermediate, 5=Intermediate, 6=Upper-Intermediate, 7=IELTS'),
  }),
  execute: async ({ level }) => {
    try {
      const apiService = createEnglifyApiService();
      const leaderboard = await apiService.getLeaderboard(level);
      if (!leaderboard?.result) {
        return 'Unable to fetch leaderboard data. Please try again.';
      }

      const data = leaderboard.result;
      const topStudents = data.list?.slice(0, 5) || [];
      const userPosition = data.self?.position || 'Not ranked';
      const userPoints = data.self?.points || 0;

      let result = `Leaderboard for Level ${level}:\n`;
      result += `Your Position: #${userPosition} with ${userPoints} points\n\n`;
      result += `Top 5 Students:\n`;
      
      topStudents.forEach((student: any, index: number) => {
        result += `${index + 1}. ${student.student?.full_name || 'Unknown'} - ${student.points} points\n`;
      });

      return result;
    } catch (error) {
      return `Error fetching leaderboard: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
  errorFunction: (context, error) => {
    return 'Failed to get leaderboard data. Please check your connection and try again.';
  },
});

// Tool: Get Available Levels
export const getLevels = tool({
  name: 'getLevels',
  description: 'Get all available English learning levels. Use this to explain level progression to users.',
  parameters: z.object({}),
  execute: async () => {
    try {
      const apiService = createEnglifyApiService();
      const levels = await apiService.getLevels();
      if (!levels?.result) {
        return 'Unable to fetch levels data. Please try again.';
      }

      const levelsList = levels.result;
      let result = 'Available English Learning Levels:\n';
      
      levelsList.forEach((level: any) => {
        result += `- ${level.level} (Value: ${level.value})\n`;
      });

      return result;
    } catch (error) {
      return `Error fetching levels: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
  errorFunction: (context, error) => {
    return 'Failed to get levels data. Please check your connection and try again.';
  },
});

// Tool: Get Learning Resources (Podcasts, Movies, Books)
export const getPodcasts = tool({
  name: 'getPodcasts',
  description: 'Get available podcasts for English listening practice. Use this when users want audio content.',
  parameters: z.object({}),
  execute: async () => {
    try {
      const apiService = createEnglifyApiService();
      const podcasts = await apiService.getPodcasts();
      if (!podcasts?.result) {
        return 'Unable to fetch podcasts data. Please try again.';
      }

      const podcastsList = podcasts.result.slice(0, 10); // Limit to first 10
      let result = `Available Podcasts (${podcasts.result.length} total):\n\n`;
      
      podcastsList.forEach((podcast: any, index: number) => {
        result += `${index + 1}. "${podcast.name}"\n`;
        result += `   Level: ${podcast.level?.name || 'Unknown'}\n`;
        result += `   Category: ${podcast.category?.name || 'General'}\n\n`;
      });

      return result;
    } catch (error) {
      return `Error fetching podcasts: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
  errorFunction: (context, error) => {
    return 'Failed to get podcasts. Please check your connection and try again.';
  },
});

export const getMovies = tool({
  name: 'getMovies',
  description: 'Get available movies for English learning. Use this when users want video content for practice.',
  parameters: z.object({}),
  execute: async () => {
    try {
      const apiService = createEnglifyApiService();
      const movies = await apiService.getMovies();
      if (!movies?.result) {
        return 'Unable to fetch movies data. Please try again.';
      }

      const moviesList = movies.result.slice(0, 10); // Limit to first 10
      let result = `Available Movies (${movies.result.length} total):\n\n`;
      
      moviesList.forEach((movie: any, index: number) => {
        result += `${index + 1}. "${movie.name}"\n`;
        result += `   Level: ${movie.level?.name || 'Unknown'}\n`;
        result += `   Category: ${movie.category?.name || 'General'}\n`;
        result += `   Duration: ${movie.duration || 'Unknown'}\n\n`;
      });

      return result;
    } catch (error) {
      return `Error fetching movies: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
  errorFunction: (context, error) => {
    return 'Failed to get movies. Please check your connection and try again.';
  },
});

export const getBooks = tool({
  name: 'getBooks',
  description: 'Get available books for English reading practice. Use this when users want reading materials.',
  parameters: z.object({}),
  execute: async () => {
    try {
      const apiService = createEnglifyApiService();
      const books = await apiService.getBooks();
      if (!books?.result) {
        return 'Unable to fetch books data. Please try again.';
      }

      const booksList = books.result.slice(0, 10); // Limit to first 10
      let result = `Available Books (${books.result.length} total):\n\n`;
      
      booksList.forEach((book: any, index: number) => {
        result += `${index + 1}. "${book.name}"\n`;
        result += `   Level: ${book.level?.name || 'Unknown'}\n`;
        result += `   Category: ${book.category?.name || 'General'}\n\n`;
      });

      return result;
    } catch (error) {
      return `Error fetching books: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
  errorFunction: (context, error) => {
    return 'Failed to get books. Please check your connection and try again.';
  },
});

// Tool: Get Specific Resource Details
export const getResourceDetails = tool({
  name: 'getResourceDetails',
  description: 'Get detailed information about a specific podcast or movie. Use this when users ask about a particular content item.',
  parameters: z.object({
    resourceType: z.enum(['podcast', 'movie']).describe('Type of resource to get details for'),
    resourceId: z.string().min(1, 'Resource ID is required').describe('ID of the resource'),
  }),
  execute: async ({ resourceType, resourceId }) => {
    try {
      const apiService = createEnglifyApiService();
      let resource;
      if (resourceType === 'podcast') {
        resource = await apiService.getPodcastById(resourceId);
      } else if (resourceType === 'movie') {
        resource = await apiService.getMovieById(resourceId);
      }

      if (!resource?.result) {
        return `Unable to find ${resourceType} with ID ${resourceId}. Please check the ID and try again.`;
      }

      const item = resource.result;
      let result = `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} Details:\n\n`;
      result += `Title: "${item.name || 'Unknown'}"\n`;
      result += `Level: ${item.level?.name || 'Unknown'} (${item.level?.cefr_name || 'N/A'})\n`;
      result += `Category: ${item.category?.name || 'General'}\n`;
      
      if (item.description) {
        result += `Description: ${item.description}\n`;
      }
      
      if (resourceType === 'movie' && item.duration) {
        result += `Duration: ${item.duration}\n`;
      }
      
      result += `Views: ${item.views_count || 0}\n`;
      result += `Likes: ${item.likes_count || 0}`;

      return result;
    } catch (error) {
      return `Error fetching ${resourceType} details: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
  errorFunction: (context, error) => {
    return 'Failed to get resource details. Please check the ID and try again.';
  },
});

// Tool: Get Recommendations Based on User Level
export const getRecommendations = tool({
  name: 'getRecommendations',
  description: 'Get personalized content recommendations based on user level. Use this to suggest appropriate learning materials.',
  parameters: z.object({
    contentType: z.enum(['podcasts', 'movies', 'books', 'all']).describe('Type of content to recommend'),
    userLevel: z.string().nullable().describe('User current level (provide null to fetch from profile automatically)'),
  }),
  execute: async ({ contentType, userLevel }) => {
    try {
      const apiService = createEnglifyApiService();
      // Get user profile for current level if not provided
      let currentLevel = userLevel;
      if (!currentLevel || currentLevel === null) {
        const profile = await apiService.getUserProfile();
        currentLevel = profile.result?.level;
      }

      if (!currentLevel) {
        return 'Unable to determine user level. Please try again or specify a level.';
      }

      let result = `Personalized Recommendations for ${currentLevel} Level:\n\n`;

      // Helper function to filter content by level
      const filterByLevel = (items: any[]) => {
        return items.filter((item: any) => {
          const itemLevel = item.level?.cefr_name || item.level?.name || '';
          const userLevelShort = currentLevel?.split(' ')[0] || '';
          return itemLevel.includes(userLevelShort) || itemLevel.toLowerCase().includes(userLevelShort.toLowerCase());
        }).slice(0, 3);
      };

      // Fetch appropriate content based on type
      if (contentType === 'podcasts' || contentType === 'all') {
        const podcasts = await apiService.getPodcasts();
        if (podcasts?.result) {
          const recommended = filterByLevel(podcasts.result);
          if (recommended.length > 0) {
            result += `📻 Recommended Podcasts:\n`;
            recommended.forEach((podcast: any, index: number) => {
              result += `${index + 1}. "${podcast.name}" (${podcast.level?.name || 'Unknown'})\n`;
            });
            result += '\n';
          }
        }
      }

      if (contentType === 'movies' || contentType === 'all') {
        const movies = await apiService.getMovies();
        if (movies?.result) {
          const recommended = filterByLevel(movies.result);
          if (recommended.length > 0) {
            result += `🎬 Recommended Movies:\n`;
            recommended.forEach((movie: any, index: number) => {
              result += `${index + 1}. "${movie.name}" (${movie.level?.name || 'Unknown'})\n`;
            });
            result += '\n';
          }
        }
      }

      if (contentType === 'books' || contentType === 'all') {
        const books = await apiService.getBooks();
        if (books?.result) {
          const recommended = filterByLevel(books.result);
          if (recommended.length > 0) {
            result += `📚 Recommended Books:\n`;
            recommended.forEach((book: any, index: number) => {
              result += `${index + 1}. "${book.name}" (${book.level?.name || 'Unknown'})\n`;
            });
            result += '\n';
          }
        }
      }

      if (result === `Personalized Recommendations for ${currentLevel} Level:\n\n`) {
        result += 'No specific recommendations found for your level at the moment. Try browsing all available content!';
      }

      return result;
    } catch (error) {
      return `Error getting recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
  errorFunction: (context, error) => {
    return 'Failed to get personalized recommendations. Please check your connection and try again.';
  },
});

// Export all tools as an array
export const englifyTools = [
  getUserProfile,
  getLeaderboard,
  getLevels,
  getPodcasts,
  getMovies,
  getBooks,
  getResourceDetails,
  getRecommendations,
];
