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
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@sdsa_cache_non-existent');
    });

    it('should return cached data for valid key', async () => {
      const testData = { test: 'data' };
      const cachedItem = {
        data: testData,
        timestamp: Date.now(),
        expiryHours: 24,
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
        expiryHours: 24,
      };
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(expiredItem));
      
      const result = await cacheService.get('test-key');
      expect(result).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@sdsa_cache_test-key');
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
        '@sdsa_cache_test-key',
        expect.stringContaining('"data":{"test":"data"}')
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@sdsa_cache_test-key',
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

  // Note: clear method doesn't exist in cacheService, skipping these tests

  describe('clearAll', () => {
    it('should clear all cache keys', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([
        '@sdsa_cache_key1',
        '@sdsa_cache_key2',
        'other_key',
        '@sdsa_cache_key3',
      ]);
      
      await cacheService.clearAll();
      
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@sdsa_cache_key1',
        '@sdsa_cache_key2',
        '@sdsa_cache_key3',
      ]);
    });

    it('should handle empty cache', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);
      
      await cacheService.clearAll();
      
      // clearAll calls multiRemove with empty array when no cache keys
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([]);
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
        expiryHours: 24,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(validItem));
      
      const result = await cacheService.get('test-key');
      expect(result).toEqual(testData);
      expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
      
      // Mock data that's 25 hours old (should be expired)
      const expiredItem = {
        data: testData,
        timestamp: Date.now() - (25 * 60 * 60 * 1000),
        expiryHours: 24,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(expiredItem));
      
      const expiredResult = await cacheService.get('test-key');
      expect(expiredResult).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@sdsa_cache_test-key');
    });
  });
});