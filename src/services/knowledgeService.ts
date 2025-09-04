import { KnowledgeBlock } from '../types/knowledge';
import { cacheService } from './cacheService';
import * as YAML from 'yaml';

const KNOWLEDGE_BASE_URL = 'https://raw.githubusercontent.com/eugene-taran/sdsa.team/main';

export class KnowledgeService {
  private memoryCache: Map<string, KnowledgeBlock> = new Map();

  async fetchKnowledgeBlock(blockId: string): Promise<KnowledgeBlock> {
    // Check memory cache first
    if (this.memoryCache.has(blockId)) {
      return this.memoryCache.get(blockId)!;
    }

    // Check persistent cache
    const cachedBlock = await cacheService.getCachedKnowledgeBlock(blockId);
    if (cachedBlock) {
      this.memoryCache.set(blockId, cachedBlock);
      return cachedBlock;
    }

    try {
      const response = await fetch(`${KNOWLEDGE_BASE_URL}/blocks/${blockId}.yaml`);
      if (!response.ok) {
        throw new Error(`Failed to fetch knowledge block: ${blockId}`);
      }

      const yamlContent = await response.text();
      const block = YAML.parse(yamlContent) as KnowledgeBlock;

      // Cache the block in both memory and persistent storage
      this.memoryCache.set(blockId, block);
      await cacheService.cacheKnowledgeBlock(blockId, block);

      return block;
    } catch (error) {
      console.error('Error fetching knowledge block:', error);
      // Return a mock block for development
      return this.getMockBlock(blockId);
    }
  }

  async fetchResource(resourcePath: string): Promise<string> {
    // Check cache first
    const cachedResource = await cacheService.getCachedResource(resourcePath);
    if (cachedResource) {
      return cachedResource;
    }

    try {
      const response = await fetch(`${KNOWLEDGE_BASE_URL}/resources/${resourcePath}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch resource: ${resourcePath}`);
      }
      const content = await response.text();

      // Cache the resource
      await cacheService.cacheResource(resourcePath, content);

      return content;
    } catch (error) {
      console.error('Error fetching resource:', error);
      return '# Resource not found\nThe requested resource could not be loaded.';
    }
  }

  private getMockBlock(blockId: string): KnowledgeBlock {
    // Mock data for development
    return {
      id: blockId,
      title: 'Mock Knowledge Block',
      initial_question: 'Do you have an existing test system?',
      paths: {
        yes: {
          question: 'Which framework are you using?',
          options: ['cypress', 'playwright', 'selenium'],
          next: 'framework-specific',
        },
        no: {
          question: "What's your primary application type?",
          options: ['web', 'mobile', 'desktop'],
          resources: ['getting-started-with-e2e.md'],
        },
      },
      context_variables: ['has_test_system', 'framework_choice', 'app_type'],
    };
  }
}

export const knowledgeService = new KnowledgeService();
