import AsyncStorage from '@react-native-async-storage/async-storage';

export interface JourneyState {
  answers: Record<string, string>;
  currentQuestionIndex: number;
  completed: boolean;
}

export interface KnowledgeBlock {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
}

const CACHE_PREFIX = '@sdsa_cache_';
const JOURNEY_KEY = '@sdsa_journey';
const CACHE_EXPIRY_HOURS = 24;

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiryHours: number;
}

class CacheService {
  /**
   * Save data to cache with expiry
   */
  async set<T>(key: string, data: T, expiryHours = CACHE_EXPIRY_HOURS): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiryHours,
      };
      const serialized = JSON.stringify(cacheItem);
      await AsyncStorage.setItem(CACHE_PREFIX + key, serialized);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  /**
   * Get data from cache if not expired
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const serialized = await AsyncStorage.getItem(CACHE_PREFIX + key);
      if (!serialized) return null;

      const cacheItem: CacheItem<T> = JSON.parse(serialized);

      // Check if expired
      const expiryMs = cacheItem.expiryHours * 60 * 60 * 1000;
      const isExpired = Date.now() - cacheItem.timestamp > expiryMs;

      if (isExpired) {
        await this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  /**
   * Remove item from cache
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
    } catch (error) {
      console.error('Error removing from cache:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Save journey state for persistence
   */
  async saveJourney(journey: JourneyState): Promise<void> {
    try {
      await AsyncStorage.setItem(JOURNEY_KEY, JSON.stringify(journey));
    } catch (error) {
      console.error('Error saving journey:', error);
    }
  }

  /**
   * Load saved journey state
   */
  async loadJourney(): Promise<JourneyState | null> {
    try {
      const serialized = await AsyncStorage.getItem(JOURNEY_KEY);
      return serialized ? JSON.parse(serialized) : null;
    } catch (error) {
      console.error('Error loading journey:', error);
      return null;
    }
  }

  /**
   * Clear journey state
   */
  async clearJourney(): Promise<void> {
    try {
      await AsyncStorage.removeItem(JOURNEY_KEY);
    } catch (error) {
      console.error('Error clearing journey:', error);
    }
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));

      let totalSize = 0;
      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Error calculating cache size:', error);
      return 0;
    }
  }

  /**
   * Cache a knowledge block
   */
  async cacheKnowledgeBlock(blockId: string, block: KnowledgeBlock): Promise<void> {
    await this.set(`knowledge_block_${blockId}`, block, 7 * 24); // Cache for 1 week
  }

  /**
   * Get cached knowledge block
   */
  async getCachedKnowledgeBlock(blockId: string): Promise<KnowledgeBlock | null> {
    return await this.get(`knowledge_block_${blockId}`);
  }

  /**
   * Cache a resource
   */
  async cacheResource(resourcePath: string, content: string): Promise<void> {
    await this.set(`resource_${resourcePath}`, content, 7 * 24); // Cache for 1 week
  }

  /**
   * Get cached resource
   */
  async getCachedResource(resourcePath: string): Promise<string | null> {
    return await this.get(`resource_${resourcePath}`);
  }

  /**
   * Prefetch and cache multiple knowledge blocks
   */
  async prefetchKnowledgeBlocks(blockIds: string[]): Promise<void> {
    const promises = blockIds.map(async (blockId) => {
      try {
        // This would fetch from the actual service
        // For now, we'll just log
        console.warn(`Prefetching block: ${blockId}`);
      } catch (error) {
        console.error(`Error prefetching block ${blockId}:`, error);
      }
    });

    await Promise.all(promises);
  }
}

export const cacheService = new CacheService();
