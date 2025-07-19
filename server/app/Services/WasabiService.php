<?php

namespace App\Services;

use Aws\S3\S3Client;
use Aws\Exception\AwsException;
use Illuminate\Support\Facades\Log;

class WasabiService
{
    protected $s3Client;
    protected $bucket;

    public function __construct()
    {
        $this->bucket = config('filesystems.disks.wasabi.bucket');
        
        $this->s3Client = new S3Client([
            'version' => 'latest',
            'region' => config('filesystems.disks.wasabi.region', 'us-east-1'),
            'endpoint' => config('filesystems.disks.wasabi.endpoint'),
            'credentials' => [
                'key' => config('filesystems.disks.wasabi.key'),
                'secret' => config('filesystems.disks.wasabi.secret'),
            ],
            'use_path_style_endpoint' => true,
        ]);
    }

    /**
     * Upload file to Wasabi S3
     */
    public function uploadFile(string $filePath, string $content, array $options = []): array
    {
        try {
            $params = [
                'Bucket' => $this->bucket,
                'Key' => $filePath,
                'Body' => $content,
                'ServerSideEncryption' => 'AES256',
                'StorageClass' => 'STANDARD',
            ];

            // Add optional parameters
            if (isset($options['ContentType'])) {
                $params['ContentType'] = $options['ContentType'];
            }

            if (isset($options['Metadata'])) {
                $params['Metadata'] = $options['Metadata'];
            }

            $result = $this->s3Client->putObject($params);

            Log::info('File uploaded to Wasabi successfully', [
                'bucket' => $this->bucket,
                'key' => $filePath,
                'etag' => $result['ETag'] ?? null
            ]);

            return [
                'success' => true,
                'etag' => $result['ETag'] ?? null,
                'version_id' => $result['VersionId'] ?? null,
            ];

        } catch (AwsException $e) {
            Log::error('Wasabi upload failed', [
                'bucket' => $this->bucket,
                'key' => $filePath,
                'error' => $e->getMessage(),
                'aws_error_code' => $e->getAwsErrorCode()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'error_code' => $e->getAwsErrorCode()
            ];
        }
    }

    /**
     * Get file content from Wasabi S3
     */
    public function getFileContent(string $filePath): string
    {
        try {
            $result = $this->s3Client->getObject([
                'Bucket' => $this->bucket,
                'Key' => $filePath,
            ]);

            return $result['Body']->getContents();

        } catch (AwsException $e) {
            Log::error('Failed to get file from Wasabi', [
                'bucket' => $this->bucket,
                'key' => $filePath,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Failed to retrieve file from cloud storage');
        }
    }

    /**
     * Delete file from Wasabi S3
     */
    public function deleteFile(string $filePath): array
    {
        try {
            $this->s3Client->deleteObject([
                'Bucket' => $this->bucket,
                'Key' => $filePath,
            ]);

            Log::info('File deleted from Wasabi successfully', [
                'bucket' => $this->bucket,
                'key' => $filePath
            ]);

            return ['success' => true];

        } catch (AwsException $e) {
            Log::error('Failed to delete file from Wasabi', [
                'bucket' => $this->bucket,
                'key' => $filePath,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Check if file exists in Wasabi S3
     */
    public function fileExists(string $filePath): bool
    {
        try {
            $this->s3Client->headObject([
                'Bucket' => $this->bucket,
                'Key' => $filePath,
            ]);

            return true;

        } catch (AwsException $e) {
            return false;
        }
    }

    /**
     * Get file metadata
     */
    public function getFileMetadata(string $filePath): array
    {
        try {
            $result = $this->s3Client->headObject([
                'Bucket' => $this->bucket,
                'Key' => $filePath,
            ]);

            return [
                'success' => true,
                'content_length' => $result['ContentLength'] ?? 0,
                'content_type' => $result['ContentType'] ?? null,
                'last_modified' => $result['LastModified'] ?? null,
                'etag' => $result['ETag'] ?? null,
                'metadata' => $result['Metadata'] ?? [],
            ];

        } catch (AwsException $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Generate presigned URL for direct download (optional)
     */
    public function generatePresignedUrl(string $filePath, int $expiresIn = 300): string
    {
        try {
            $command = $this->s3Client->getCommand('GetObject', [
                'Bucket' => $this->bucket,
                'Key' => $filePath,
            ]);

            $request = $this->s3Client->createPresignedRequest($command, "+{$expiresIn} seconds");

            return (string) $request->getUri();

        } catch (AwsException $e) {
            Log::error('Failed to generate presigned URL', [
                'bucket' => $this->bucket,
                'key' => $filePath,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Failed to generate download URL');
        }
    }

    /**
     * List files in directory
     */
    public function listFiles(string $prefix = '', int $maxKeys = 1000): array
    {
        try {
            $result = $this->s3Client->listObjectsV2([
                'Bucket' => $this->bucket,
                'Prefix' => $prefix,
                'MaxKeys' => $maxKeys,
            ]);

            $files = [];
            if (isset($result['Contents'])) {
                foreach ($result['Contents'] as $object) {
                    $files[] = [
                        'key' => $object['Key'],
                        'size' => $object['Size'],
                        'last_modified' => $object['LastModified'],
                        'etag' => $object['ETag'],
                    ];
                }
            }

            return [
                'success' => true,
                'files' => $files,
                'count' => count($files),
                'is_truncated' => $result['IsTruncated'] ?? false,
            ];

        } catch (AwsException $e) {
            Log::error('Failed to list files from Wasabi', [
                'bucket' => $this->bucket,
                'prefix' => $prefix,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get bucket storage usage statistics
     */
    public function getStorageStats(): array
    {
        try {
            $result = $this->listFiles('', 10000); // Get up to 10k files
            
            if (!$result['success']) {
                throw new \Exception($result['error']);
            }

            $totalSize = 0;
            $fileCount = 0;
            $typeStats = [];

            foreach ($result['files'] as $file) {
                $totalSize += $file['size'];
                $fileCount++;
                
                $extension = pathinfo($file['key'], PATHINFO_EXTENSION);
                $typeStats[$extension] = ($typeStats[$extension] ?? 0) + 1;
            }

            return [
                'success' => true,
                'total_size' => $totalSize,
                'file_count' => $fileCount,
                'type_breakdown' => $typeStats,
                'formatted_size' => $this->formatBytes($totalSize),
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes(int $size, int $precision = 2): string
    {
        if ($size > 0) {
            $base = log($size) / log(1024);
            $suffixes = [' B', ' KB', ' MB', ' GB', ' TB'];
            return round(pow(1024, $base - floor($base)), $precision) . $suffixes[floor($base)];
        }
        return '0 B';
    }
}