import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheService } from '../../services/cacheService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('CacheService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);
    (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);
  });

  describe('get', () => {
    it('should return null for non-existent key', async () => {
      const result = await cacheService.get('non-existent');
      expect(result).toBeNull();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('cache_non-existent');
    });

    it('should return cached data for valid key', async () => {
      const testData = { test: 'data' };
      const cachedItem = {
        data: testData,
        timestamp: Date.now(),
      };
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cachedItem));
      
      const result = await cacheService.get('test-key');
      expect(result).toEqual(testData);
    });

    it('should return null for expired cache', async () => {
      const testData = { test: 'data' };
      const expiredItem = {
        data: testData,
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
      };
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(expiredItem));
      
      const result = await cacheService.get('test-key');
      expect(result).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('cache_test-key');
    });

    it('should handle JSON parse errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');
      
      const result = await cacheService.get('test-key');
      expect(result).toBeNull();
    });

    it('should handle AsyncStorage errors', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      const result = await cacheService.get('test-key');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should store data with timestamp', async () => {
      const testData = { test: 'data' };
      
      await cacheService.set('test-key', testData);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'cache_test-key',
        expect.stringContaining('"data":{"test":"data"}')
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'cache_test-key',
        expect.stringContaining('"timestamp":')
      );
    });

    it('should handle complex data structures', async () => {
      const complexData = {
        array: [1, 2, 3],
        nested: { deep: { value: 'test' } },
        boolean: true,
        null: null,
      };
      
      await cacheService.set('complex', complexData);
      
      const call = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const storedData = JSON.parse(call[1]);
      expect(storedData.data).toEqual(complexData);
    });

    it('should handle storage errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage full'));
      
      // Should not throw
      await expect(cacheService.set('test', { data: 'test' })).resolves.toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear specific cache key', async () => {
      await cacheService.clear('test-key');
      
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('cache_test-key');
    });

    it('should handle clear errors gracefully', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Clear error'));
      
      // Should not throw
      await expect(cacheService.clear('test')).resolves.toBeUndefined();
    });
  });

  describe('clearAll', () => {
    it('should clear all cache keys', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        'cache_key1',
        'cache_key2',
        'other_key',
        'cache_key3',
      ]);
      
      await cacheService.clearAll();
      
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'cache_key1',
        'cache_key2',
        'cache_key3',
      ]);
    });

    it('should handle empty cache', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);
      
      await cacheService.clearAll();
      
      expect(AsyncStorage.multiRemove).not.toHaveBeenCalled();
    });

    it('should handle clearAll errors gracefully', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValue(new Error('Keys error'));
      
      // Should not throw
      await expect(cacheService.clearAll()).resolves.toBeUndefined();
    });
  });

  describe('cache expiration', () => {
    it('should respect default 24 hour expiration', async () => {
      const testData = { test: 'data' };
      
      // Mock data that's 23 hours old (should be valid)
      const validItem = {
        data: testData,
        timestamp: Date.now() - (23 * 60 * 60 * 1000),
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(validItem));
      
      const result = await cacheService.get('test-key');
      expect(result).toEqual(testData);
      expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
      
      // Mock data that's 25 hours old (should be expired)
      const expiredItem = {
        data: testData,
        timestamp: Date.now() - (25 * 60 * 60 * 1000),
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(expiredItem));
      
      const expiredResult = await cacheService.get('test-key');
      expect(expiredResult).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('cache_test-key');
    });
  });
});