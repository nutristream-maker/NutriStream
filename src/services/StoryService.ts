import { Story } from '../components/social/StoriesBar';
import { LeagueTier } from '../types/SocialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CreateStoryRequest {
    mediaFile: File;
    mediaType: 'image' | 'video';
    sensorData?: {
        heartRate?: number;
        vo2Max?: number;
        caloriesBurned?: number;
        fatigueLevel?: number;
    };
}

export interface StoryViewResponse {
    storyId: string;
    viewCount: number;
    viewers: { userId: string; viewedAt: Date }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const mockStories: Story[] = [
    {
        id: 's-1',
        userId: 'u-2',
        userName: 'Carlos Fit',
        userAvatar: 'https://randomuser.me/api/portraits/men/2.jpg',
        userLeague: 'diamond',
        mediaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
        mediaType: 'image',
        createdAt: new Date(Date.now() - 3600000 * 2),
        expiresAt: new Date(Date.now() + 3600000 * 22),
        viewCount: 234,
        isViewed: false,
        sensorData: { heartRate: 156, caloriesBurned: 420 }
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// STORY SERVICE
// ═══════════════════════════════════════════════════════════════════════════

class StoryServiceClass {
    /**
     * Get stories for feed
     */
    async getStories(): Promise<Story[]> {
        // Simulate API delay
        await new Promise(r => setTimeout(r, 300));

        // Filter expired stories
        const now = Date.now();
        return mockStories.filter(s => s.expiresAt.getTime() > now);
    }

    /**
     * Get stories for a specific user
     */
    async getUserStories(userId: string): Promise<Story[]> {
        await new Promise(r => setTimeout(r, 200));
        return mockStories.filter(s => s.userId === userId);
    }

    /**
     * Create a new story
     */
    async createStory(userId: string, request: CreateStoryRequest): Promise<Story> {
        await new Promise(r => setTimeout(r, 500));

        // In real app, would upload media to storage
        const mediaUrl = URL.createObjectURL(request.mediaFile);

        const newStory: Story = {
            id: `s-${Date.now()}`,
            userId,
            userName: 'Usuario Actual',
            userAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
            userLeague: 'gold' as LeagueTier,
            mediaUrl,
            mediaType: request.mediaType,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            viewCount: 0,
            isViewed: true,
            sensorData: request.sensorData
        };

        mockStories.unshift(newStory);
        return newStory;
    }

    /**
     * Mark story as viewed
     */
    async markViewed(storyId: string, viewerId: string): Promise<void> {
        await new Promise(r => setTimeout(r, 100));

        const story = mockStories.find(s => s.id === storyId);
        if (story) {
            story.isViewed = true;
            story.viewCount += 1;
        }
    }

    /**
     * Get story viewers
     */
    async getViewers(storyId: string): Promise<{ userId: string; userName: string; viewedAt: Date }[]> {
        await new Promise(r => setTimeout(r, 200));

        // Mock viewers
        return [
            { userId: 'u-3', userName: 'Elena Pérez', viewedAt: new Date(Date.now() - 3600000) },
            { userId: 'u-4', userName: 'Miguel López', viewedAt: new Date(Date.now() - 7200000) },
            { userId: 'u-5', userName: 'Laura Martín', viewedAt: new Date(Date.now() - 10800000) }
        ];
    }

    /**
     * Delete a story
     */
    async deleteStory(storyId: string): Promise<void> {
        await new Promise(r => setTimeout(r, 200));

        const index = mockStories.findIndex(s => s.id === storyId);
        if (index !== -1) {
            mockStories.splice(index, 1);
        }
    }
}

export const StoryService = new StoryServiceClass();
export default StoryService;
