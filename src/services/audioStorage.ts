// Audio file storage service for managing downloaded songs

interface StoredAudio {
  id: string;
  title: string;
  audioBlob: Blob;
  audioUrl: string;
  metadata: {
    artist?: string;
    duration?: number;
    size: number;
    createdAt: string;
    tags?: string;
    prompt?: string;
  };
}

interface MinimalSongData {
  id: string;
  title: string;
  tags?: string;
  prompt?: string;
}

class AudioStorageService {
  private dbName = 'MusicMotivateDB';
  private dbVersion = 1;
  private storeName = 'audioFiles';
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('title', 'title', { unique: false });
          store.createIndex('createdAt', 'metadata.createdAt', { unique: false });
        }
      };
    });
  }

  async downloadAndStore(audioUrl: string, songData: MinimalSongData): Promise<StoredAudio> {
    try {
      // Use proxy route to bypass CORS
      const proxyUrl = `/api/proxy-audio?url=${encodeURIComponent(audioUrl)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Failed to download audio');
      
      const audioBlob = await response.blob();
      const localUrl = URL.createObjectURL(audioBlob);
      
      const storedAudio: StoredAudio = {
        id: songData.id,
        title: songData.title,
        audioBlob,
        audioUrl: localUrl,
        metadata: {
          artist: 'Suno AI',
          size: audioBlob.size,
          createdAt: new Date().toISOString(),
          tags: songData.tags,
          prompt: songData.prompt
        }
      };

      await this.storeAudio(storedAudio);
      return storedAudio;
    } catch (error) {
      console.error('Download and store error:', error);
      throw new Error(`Failed to download audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async storeAudio(audio: StoredAudio): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.put(audio);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getStoredAudio(id: string): Promise<StoredAudio | null> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAllStoredAudio(): Promise<StoredAudio[]> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteStoredAudio(id: string): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clearAllAudio(): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const audioStorage = new AudioStorageService();
export const downloadAndStore = audioStorage.downloadAndStore.bind(audioStorage);
export type { StoredAudio, MinimalSongData };