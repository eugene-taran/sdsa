# Knowledge Content Consumption Strategy

## Overview

The SDSA app consumes knowledge tree releases from the `sdsa.team` repository. This document describes how the app fetches, caches, and updates knowledge content.

## Content Source

### Remote Repository
- **Source**: `https://github.com/eugene-taran/sdsa.team`
- **Releases**: Published automatically when content changes
- **Manifest URL**: `https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/knowledge/manifest.json`
- **Bundle URL**: `https://github.com/eugene-taran/sdsa.team/releases/latest/download/knowledge-bundle.tar.gz`

## App Integration

### 1. Bundled Content (Fallback)

The app ships with a snapshot of knowledge content for offline-first functionality:

```
sdsa/
├── assets/
│   └── knowledge/           # Bundled snapshot
│       ├── manifest.json   # Version info of bundled content
│       ├── catalog.json    # Topics catalog
│       ├── blocks/         # Knowledge trees
│       └── resources/      # Markdown files
```

### 2. Update Check Service

```typescript
// src/services/KnowledgeUpdateService.ts
export class KnowledgeUpdateService {
  private static MANIFEST_URL = 
    'https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/knowledge/manifest.json';
  
  private static BUNDLE_URL = 
    'https://github.com/eugene-taran/sdsa.team/releases/latest/download/knowledge-bundle.tar.gz';
  
  async checkForUpdates(): Promise<UpdateInfo | null> {
    try {
      // Get current version from storage
      const currentVersion = await AsyncStorage.getItem('knowledge_version');
      
      // Fetch remote manifest
      const response = await fetch(KnowledgeUpdateService.MANIFEST_URL);
      const remoteManifest = await response.json();
      
      // Compare versions
      if (currentVersion !== remoteManifest.version) {
        return {
          hasUpdate: true,
          currentVersion,
          remoteVersion: remoteManifest.version,
          size: remoteManifest.size,
          changelog: remoteManifest.changelog
        };
      }
      
      return null;
    } catch (error) {
      console.error('Update check failed:', error);
      return null;
    }
  }
  
  async downloadUpdate(): Promise<boolean> {
    try {
      // Download bundle
      const response = await fetch(KnowledgeUpdateService.BUNDLE_URL);
      const bundleData = await response.blob();
      
      // Extract to file system
      await this.extractBundle(bundleData);
      
      // Update stored version
      const manifest = await this.loadManifest();
      await AsyncStorage.setItem('knowledge_version', manifest.version);
      
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      return false;
    }
  }
}
```

### 3. Loading Priority

```typescript
// src/services/KnowledgeService.ts
export class KnowledgeService {
  private memoryCache: Map<string, any> = new Map();
  private fileSystemCache: Map<string, any> = new Map();
  private bundledContent: Map<string, any> = new Map();
  
  async initialize() {
    // 1. Load bundled content (always available)
    await this.loadBundledContent();
    
    // 2. Check for cached downloaded content
    const hasCachedContent = await this.checkFileSystemCache();
    if (hasCachedContent) {
      await this.loadFileSystemCache();
    }
    
    // 3. Background update check (non-blocking)
    this.checkForUpdatesInBackground();
  }
  
  private async checkForUpdatesInBackground() {
    // Don't block app startup
    setTimeout(async () => {
      const updateService = new KnowledgeUpdateService();
      const updateInfo = await updateService.checkForUpdates();
      
      if (updateInfo?.hasUpdate) {
        // Notify user or auto-download based on settings
        if (await this.shouldAutoUpdate()) {
          await updateService.downloadUpdate();
          // Reload content for next app launch
        }
      }
    }, 3000); // Check after 3 seconds
  }
}
```

## Update Strategies

### 1. Silent Auto-Update (Default)
- Check for updates on app launch
- Download in background if on WiFi
- Apply update on next app restart
- No user interruption

```typescript
const updateStrategy = {
  checkFrequency: 'on_launch', // or 'daily', 'weekly'
  autoDownload: true,
  requireWifi: true,
  notifyUser: false
};
```

### 2. User-Prompted Updates
- Check for updates on app launch
- Show notification if update available
- Let user choose when to download

```typescript
if (updateInfo?.hasUpdate) {
  Alert.alert(
    'Content Update Available',
    `New knowledge content (${updateInfo.size}) is available. Download now?`,
    [
      { text: 'Later', style: 'cancel' },
      { text: 'Download', onPress: () => downloadUpdate() }
    ]
  );
}
```

### 3. Manual Update Check
- Settings screen option
- User triggers check manually
- Shows current version and update status

```typescript
// In SettingsScreen.tsx
<TouchableOpacity onPress={checkForUpdates}>
  <Text>Check for Updates</Text>
  <Text>Current Version: {currentVersion}</Text>
</TouchableOpacity>
```

## Caching Strategy

### File System Structure
```
${FileSystem.documentDirectory}/
└── knowledge/
    ├── .version        # Currently cached version
    ├── manifest.json   # Downloaded manifest
    ├── catalog.json    # Topics catalog
    ├── blocks/
    │   └── *.yaml     # Knowledge trees
    └── resources/
        └── *.md       # Resource files
```

### Cache Management
```typescript
class CacheManager {
  private static MAX_CACHE_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days
  
  async validateCache(): Promise<boolean> {
    const versionFile = `${CACHE_DIR}/.version`;
    
    if (!await FileSystem.getInfoAsync(versionFile).exists) {
      return false;
    }
    
    // Check cache age
    const stats = await FileSystem.getInfoAsync(versionFile);
    const age = Date.now() - stats.modificationTime;
    
    return age < CacheManager.MAX_CACHE_AGE;
  }
  
  async clearCache(): Promise<void> {
    await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
  }
}
```

## Version Management

### Version Storage
```typescript
// Multiple version tracking points
const versionTracking = {
  bundled: '2024.12.01.0',    // Version shipped with app
  cached: '2024.12.10.0',      // Version in file cache
  remote: '2024.12.15.0',      // Latest available version
  active: '2024.12.10.0'       // Currently loaded version
};
```

### Version Comparison
```typescript
function isNewerVersion(v1: string, v2: string): boolean {
  // Format: YYYY.MM.DD.PATCH
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < 4; i++) {
    if (parts1[i] > parts2[i]) return true;
    if (parts1[i] < parts2[i]) return false;
  }
  
  return false;
}
```

## Error Handling

### Network Failures
```typescript
async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        timeout: 30000, // 30 seconds
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) return response;
      
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
}
```

### Corruption Recovery
```typescript
async function verifyContent(manifest: Manifest): Promise<boolean> {
  // Verify checksums if provided
  for (const [file, checksum of Object.entries(manifest.checksums)]) {
    const content = await FileSystem.readAsStringAsync(`${CACHE_DIR}/${file}`);
    const computed = await crypto.digest('SHA-256', content);
    
    if (computed !== checksum) {
      console.error(`Checksum mismatch: ${file}`);
      return false;
    }
  }
  
  return true;
}
```

## Bundle Extraction

### Handling tar.gz bundles
```typescript
import * as FileSystem from 'expo-file-system';
import { unzip } from 'react-native-zip-archive';

async function extractBundle(bundlePath: string): Promise<void> {
  const extractDir = `${FileSystem.cacheDirectory}/knowledge_temp`;
  
  try {
    // For .zip bundles
    await unzip(bundlePath, extractDir);
    
    // Move to permanent location
    await FileSystem.moveAsync({
      from: extractDir,
      to: `${FileSystem.documentDirectory}/knowledge`
    });
    
  } catch (error) {
    // Cleanup on failure
    await FileSystem.deleteAsync(extractDir, { idempotent: true });
    throw error;
  }
}
```

## Development & Testing

### Local Development Mode
```typescript
// Use local server during development
const DEV_MANIFEST_URL = __DEV__ 
  ? 'http://localhost:8080/knowledge/manifest.json'
  : 'https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/knowledge/manifest.json';
```

### Testing Different Versions
```bash
# Environment variable to force specific version
FORCE_KNOWLEDGE_VERSION=2024.12.01.0 npm run ios

# Clear cache and force re-download
CLEAR_KNOWLEDGE_CACHE=true npm run android
```

### Mock Updates for Testing
```typescript
// src/services/__mocks__/KnowledgeUpdateService.ts
export class KnowledgeUpdateService {
  async checkForUpdates(): Promise<UpdateInfo> {
    return {
      hasUpdate: true,
      currentVersion: '2024.12.01.0',
      remoteVersion: '2024.12.15.0',
      size: '245KB',
      changelog: 'Test update'
    };
  }
}
```

## Monitoring

### Analytics Events
```typescript
const trackKnowledgeEvents = {
  UPDATE_CHECK: 'knowledge_update_check',
  UPDATE_AVAILABLE: 'knowledge_update_available',
  UPDATE_STARTED: 'knowledge_update_started',
  UPDATE_COMPLETED: 'knowledge_update_completed',
  UPDATE_FAILED: 'knowledge_update_failed',
  CACHE_HIT: 'knowledge_cache_hit',
  CACHE_MISS: 'knowledge_cache_miss'
};

// Track update success rate
analytics.track(trackKnowledgeEvents.UPDATE_COMPLETED, {
  version: manifest.version,
  size: manifest.size,
  duration: downloadTime
});
```

### Error Reporting
```typescript
// Report to Sentry or similar
Sentry.captureException(error, {
  tags: {
    component: 'knowledge_update',
    version_from: currentVersion,
    version_to: remoteVersion
  }
});
```

## Future Enhancements

### Phase 1 (MVP)
- ✅ Bundled content fallback
- ✅ Basic update checking
- ✅ Manual update trigger

### Phase 2
- Differential updates (only changed files)
- Progressive download with resume
- Update channels (stable/beta)
- Offline queue for updates

### Phase 3
- P2P content sharing between devices
- Content preloading based on user patterns
- Smart caching based on usage
- Regional CDN support

## Configuration

### App Configuration
```typescript
// src/config/knowledge.config.ts
export const KnowledgeConfig = {
  // Update checking
  updateCheckInterval: 24 * 60 * 60 * 1000, // 24 hours
  updateCheckOnLaunch: true,
  autoDownloadUpdates: true,
  requireWifiForUpdates: true,
  
  // Caching
  maxCacheAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  maxCacheSize: 50 * 1024 * 1024, // 50MB
  
  // URLs
  manifestUrl: 'https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/knowledge/manifest.json',
  bundleUrl: 'https://github.com/eugene-taran/sdsa.team/releases/latest/download/knowledge-bundle.zip',
  
  // Timeouts
  downloadTimeout: 60000, // 60 seconds
  manifestTimeout: 10000, // 10 seconds
  
  // Retry
  maxRetries: 3,
  retryDelay: 1000 // Base delay, exponential backoff
};
```

## Summary

The SDSA app consumes knowledge content from the sdsa.team repository through:

1. **Bundled fallback** - Always works offline
2. **Version checking** - Lightweight manifest comparison
3. **Background updates** - Non-disruptive downloads
4. **Smart caching** - File system storage with validation
5. **Error recovery** - Graceful handling of failures

This ensures users always have access to knowledge content while keeping it fresh when online.