// Mock AWS SDK
const mockSend = jest.fn();
const mockGetSignedUrl = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  PutObjectCommand: jest.fn().mockImplementation((params) => ({ ...params, type: 'PutObject' })),
  GetObjectCommand: jest.fn().mockImplementation((params) => ({ ...params, type: 'GetObject' })),
  DeleteObjectCommand: jest.fn().mockImplementation((params) => ({ ...params, type: 'DeleteObject' })),
  HeadObjectCommand: jest.fn().mockImplementation((params) => ({ ...params, type: 'HeadObject' })),
  CopyObjectCommand: jest.fn().mockImplementation((params) => ({ ...params, type: 'CopyObject' })),
  ListObjectsV2Command: jest.fn().mockImplementation((params) => ({ ...params, type: 'ListObjectsV2' })),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mockGetSignedUrl,
}));

import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { Readable } from 'stream';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(async () => {
    // Reset environment
    process.env.S3_ENDPOINT = 'http://localhost:9000';
    process.env.S3_REGION = 'us-east-1';
    process.env.S3_ACCESS_KEY_ID = 'minioadmin';
    process.env.S3_SECRET_ACCESS_KEY = 'minioadmin';
    process.env.S3_BUCKET = 'test-bucket';

    // Reset mocks
    mockSend.mockReset();
    mockGetSignedUrl.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upload', () => {
    it('should upload file successfully', async () => {
      mockSend.mockResolvedValue({});

      const buffer = Buffer.from('test content');
      const result = await service.upload({
        key: 'test/file.txt',
        body: buffer,
        contentType: 'text/plain',
      });

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('key', 'test/file.txt');
      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        Bucket: 'test-bucket',
        Key: 'test/file.txt',
        Body: buffer,
        ContentType: 'text/plain',
      }));
    });

    it('should use custom bucket when provided', async () => {
      mockSend.mockResolvedValue({});

      await service.upload({
        bucket: 'custom-bucket',
        key: 'test/file.txt',
        body: Buffer.from('test'),
      });

      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        Bucket: 'custom-bucket',
      }));
    });

    it('should auto-detect content type from extension', async () => {
      mockSend.mockResolvedValue({});

      await service.upload({
        key: 'images/photo.jpg',
        body: Buffer.from('image data'),
      });

      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        ContentType: 'image/jpeg',
      }));
    });

    it('should use default content type for unknown extensions', async () => {
      mockSend.mockResolvedValue({});

      await service.upload({
        key: 'data/file.unknownext',
        body: Buffer.from('data'),
      });

      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        ContentType: 'application/octet-stream',
      }));
    });

    it('should include metadata when provided', async () => {
      mockSend.mockResolvedValue({});

      await service.upload({
        key: 'test/file.txt',
        body: Buffer.from('test'),
        metadata: {
          'custom-key': 'custom-value',
        },
      });

      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        Metadata: {
          'custom-key': 'custom-value',
        },
      }));
    });

    it('should throw error on upload failure', async () => {
      mockSend.mockRejectedValue(new Error('Upload failed'));

      await expect(
        service.upload({
          key: 'test/file.txt',
          body: Buffer.from('test'),
        }),
      ).rejects.toThrow('Upload failed');
    });
  });

  describe('download', () => {
    it('should download file successfully', async () => {
      const mockStream = new Readable({
        read() {
          this.push('test content');
          this.push(null);
        },
      });

      mockSend.mockResolvedValue({
        Body: mockStream,
        ContentType: 'text/plain',
        ContentLength: 12,
        Metadata: { key: 'value' },
      });

      const result = await service.download('test/file.txt');

      expect(result).toHaveProperty('body');
      expect(result.contentType).toBe('text/plain');
      expect(result.contentLength).toBe(12);
      expect(result.metadata).toEqual({ key: 'value' });
    });

    it('should use custom bucket when provided', async () => {
      mockSend.mockResolvedValue({
        Body: new Readable({ read() { this.push(null); } }),
      });

      await service.download('test/file.txt', 'custom-bucket');

      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        Bucket: 'custom-bucket',
      }));
    });

    it('should throw error when body is empty', async () => {
      mockSend.mockResolvedValue({
        Body: null,
      });

      await expect(service.download('test/file.txt')).rejects.toThrow('Empty response body');
    });

    it('should throw error on download failure', async () => {
      mockSend.mockRejectedValue(new Error('Download failed'));

      await expect(service.download('test/file.txt')).rejects.toThrow('Download failed');
    });
  });

  describe('getSignedUrl', () => {
    it('should generate signed URL with default expiration', async () => {
      mockGetSignedUrl.mockResolvedValue('https://signed-url.example.com');

      const url = await service.getSignedUrl('test/file.txt');

      expect(url).toBe('https://signed-url.example.com');
      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          Bucket: 'test-bucket',
          Key: 'test/file.txt',
        }),
        { expiresIn: 3600 },
      );
    });

    it('should use custom expiration time', async () => {
      mockGetSignedUrl.mockResolvedValue('https://signed-url.example.com');

      await service.getSignedUrl('test/file.txt', 7200);

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { expiresIn: 7200 },
      );
    });

    it('should use custom bucket when provided', async () => {
      mockGetSignedUrl.mockResolvedValue('https://signed-url.example.com');

      await service.getSignedUrl('test/file.txt', 3600, 'custom-bucket');

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          Bucket: 'custom-bucket',
        }),
        expect.anything(),
      );
    });

    it('should throw error on failure', async () => {
      mockGetSignedUrl.mockRejectedValue(new Error('Signing failed'));

      await expect(service.getSignedUrl('test/file.txt')).rejects.toThrow('Signing failed');
    });
  });

  describe('delete', () => {
    it('should delete file successfully', async () => {
      mockSend.mockResolvedValue({});

      await service.delete('test/file.txt');

      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        Bucket: 'test-bucket',
        Key: 'test/file.txt',
      }));
    });

    it('should use custom bucket when provided', async () => {
      mockSend.mockResolvedValue({});

      await service.delete('test/file.txt', 'custom-bucket');

      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        Bucket: 'custom-bucket',
      }));
    });

    it('should throw error on deletion failure', async () => {
      mockSend.mockRejectedValue(new Error('Delete failed'));

      await expect(service.delete('test/file.txt')).rejects.toThrow('Delete failed');
    });
  });

  describe('exists', () => {
    it('should return true when file exists', async () => {
      mockSend.mockResolvedValue({});

      const result = await service.exists('test/file.txt');

      expect(result).toBe(true);
    });

    it('should return false when file not found', async () => {
      const notFoundError = new Error('Not found');
      (notFoundError as any).name = 'NotFound';
      mockSend.mockRejectedValue(notFoundError);

      const result = await service.exists('nonexistent/file.txt');

      expect(result).toBe(false);
    });

    it('should throw error for other failures', async () => {
      mockSend.mockRejectedValue(new Error('Network error'));

      await expect(service.exists('test/file.txt')).rejects.toThrow('Network error');
    });

    it('should use custom bucket when provided', async () => {
      mockSend.mockResolvedValue({});

      await service.exists('test/file.txt', 'custom-bucket');

      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        Bucket: 'custom-bucket',
      }));
    });
  });

  describe('copy', () => {
    it('should copy file within same bucket', async () => {
      mockSend.mockResolvedValue({});

      await service.copy('source/file.txt', 'dest/file.txt');

      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        CopySource: 'test-bucket/source/file.txt',
        Bucket: 'test-bucket',
        Key: 'dest/file.txt',
      }));
    });

    it('should copy file between different buckets', async () => {
      mockSend.mockResolvedValue({});

      await service.copy('source/file.txt', 'dest/file.txt', 'source-bucket', 'dest-bucket');

      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        CopySource: 'source-bucket/source/file.txt',
        Bucket: 'dest-bucket',
        Key: 'dest/file.txt',
      }));
    });

    it('should throw error on copy failure', async () => {
      mockSend.mockRejectedValue(new Error('Copy failed'));

      await expect(
        service.copy('source/file.txt', 'dest/file.txt'),
      ).rejects.toThrow('Copy failed');
    });
  });

  describe('listFiles', () => {
    it('should list files with prefix', async () => {
      mockSend.mockResolvedValue({
        Contents: [
          { Key: 'test/file1.txt' },
          { Key: 'test/file2.txt' },
          { Key: 'test/file3.txt' },
        ],
      });

      const result = await service.listFiles('test/');

      expect(result).toEqual(['test/file1.txt', 'test/file2.txt', 'test/file3.txt']);
    });

    it('should return empty array when no files found', async () => {
      mockSend.mockResolvedValue({
        Contents: [],
      });

      const result = await service.listFiles('empty/');

      expect(result).toEqual([]);
    });

    it('should handle undefined Contents', async () => {
      mockSend.mockResolvedValue({});

      const result = await service.listFiles('test/');

      expect(result).toEqual([]);
    });

    it('should use custom maxKeys', async () => {
      mockSend.mockResolvedValue({ Contents: [] });

      await service.listFiles('test/', undefined, 500);

      expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
        MaxKeys: 500,
      }));
    });

    it('should throw error on list failure', async () => {
      mockSend.mockRejectedValue(new Error('List failed'));

      await expect(service.listFiles('test/')).rejects.toThrow('List failed');
    });
  });

  describe('generateKey', () => {
    it('should generate tenant-isolated key', () => {
      const key = service.generateKey('account-123', 'uploads', 'photo.jpg');

      expect(key).toMatch(/^accounts\/account-123\/uploads\/\d+-photo\.jpg$/);
    });

    it('should sanitize special characters in filename', () => {
      const key = service.generateKey('account-123', 'uploads', 'my file (1).jpg');

      expect(key).not.toContain(' ');
      expect(key).not.toContain('(');
      expect(key).not.toContain(')');
      expect(key).toMatch(/my_file__1_\.jpg$/);
    });

    it('should include timestamp for uniqueness', () => {
      const key1 = service.generateKey('account-123', 'uploads', 'file.txt');

      // Wait a bit to ensure different timestamp
      const key2 = service.generateKey('account-123', 'uploads', 'file.txt');

      // Both should follow pattern but may have different timestamps
      expect(key1).toMatch(/^accounts\/account-123\/uploads\/\d+-file\.txt$/);
      expect(key2).toMatch(/^accounts\/account-123\/uploads\/\d+-file\.txt$/);
    });
  });

  describe('getPublicUrl', () => {
    it('should return public URL', () => {
      const url = service.getPublicUrl('test/file.txt');

      expect(url).toBe('http://localhost:9000/test-bucket/test/file.txt');
    });

    it('should use custom bucket', () => {
      const url = service.getPublicUrl('test/file.txt', 'public-bucket');

      expect(url).toBe('http://localhost:9000/public-bucket/test/file.txt');
    });
  });
});
