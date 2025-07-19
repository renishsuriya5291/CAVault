<?php

namespace App\Services;

use App\Models\Document;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentService
{
    protected $encryptionService;
    protected $wasabiService;

    public function __construct(EncryptionService $encryptionService, WasabiService $wasabiService)
    {
        $this->encryptionService = $encryptionService;
        $this->wasabiService = $wasabiService;
    }

    /**
     * Upload and encrypt document
     */
    public function uploadDocument(UploadedFile $file, User $user, array $metadata): array
    {
        try {
            // Generate unique document ID and paths - FIXED: Convert to string
            $documentId = (string) Str::uuid();
            $originalFilename = $file->getClientOriginalName();
            $fileExtension = $file->getClientOriginalExtension();
            $fileName = $documentId . '.' . $fileExtension;
            
            // Read file content
            $fileContent = file_get_contents($file->getPathname());
            
            // Generate encryption key for this document
            $encryptionKey = $this->encryptionService->generateKey();
            
            // Encrypt file content
            $encryptedContent = $this->encryptionService->encrypt($fileContent, $encryptionKey);
            
            // Create file path structure: user_id/year/month/filename
            $filePath = sprintf(
                '%d/%s/%s',
                $user->id,
                now()->format('Y/m'),
                $fileName
            );
            
            // Upload to Wasabi S3
            $uploadResult = $this->wasabiService->uploadFile($filePath, $encryptedContent, [
                'ContentType' => $file->getMimeType(),
                'Metadata' => [
                    'user_id' => (string) $user->id,  // FIXED: Convert to string
                    'original_filename' => $originalFilename,
                    'document_id' => $documentId,
                ]
            ]);
            
            if (!$uploadResult['success']) {
                throw new \Exception('Failed to upload file to cloud storage: ' . ($uploadResult['error'] ?? 'Unknown error'));
            }
            
            // Store document in database
            $document = Document::create([
                'user_id' => $user->id,
                'client_name' => $metadata['client_name'],
                'document_name' => $this->generateDocumentName($originalFilename, $metadata),
                'original_filename' => $originalFilename,
                'file_path' => $filePath,
                'file_size' => $file->getSize(),
                'file_type' => strtolower($fileExtension),
                'mime_type' => $file->getMimeType(),
                'category' => $metadata['category'],
                'description' => $metadata['description'] ?? null,
                'tags' => $metadata['tags'] ?? [],
                'encryption_key' => $this->encryptionService->encryptKey($encryptionKey),
                'status' => 'processing',
                'upload_date' => now(),
                'metadata' => [
                    'wasabi_etag' => $uploadResult['etag'] ?? null,
                    'original_size' => $file->getSize(),
                    'encrypted_size' => strlen($encryptedContent),
                    'upload_ip' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ]
            ]);
            
            // Process document asynchronously (you can use queues here)
            $this->processDocument($document);
            
            Log::info('Document uploaded successfully', [
                'document_id' => $document->id,
                'user_id' => $user->id,
                'filename' => $originalFilename,
                'size' => $file->getSize()
            ]);
            
            return [
                'id' => $document->id,
                'document_name' => $document->document_name,
                'status' => $document->status,
                'upload_date' => $document->upload_date->toISOString(),
            ];
            
        } catch (\Exception $e) {
            Log::error('Document upload failed', [
                'user_id' => $user->id,
                'filename' => $originalFilename ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e;
        }
    }

    /**
     * Generate secure download URL with temporary token
     */
    public function generateSecureDownloadUrl(Document $document): string
    {
        // Generate temporary download token
        $token = Str::random(64);
        $tokenKey = "download_token:{$document->id}:{$token}";
        
        // Store token in cache for 5 minutes
        Cache::put($tokenKey, [
            'document_id' => $document->id,
            'user_id' => $document->user_id,
            'created_at' => now()
        ], now()->addMinutes(5));
        
        return route('api.documents.download-file', [
            'id' => $document->id,
            'token' => $token
        ]);
    }

    /**
     * Validate download token
     */
    public function validateDownloadToken(string $token, int $documentId): bool
    {
        $tokenKey = "download_token:{$documentId}:{$token}";
        $tokenData = Cache::get($tokenKey);
        
        if (!$tokenData || $tokenData['document_id'] !== $documentId) {
            return false;
        }
        
        // Remove token after validation (single use)
        Cache::forget($tokenKey);
        
        return true;
    }

    /**
     * Stream decrypted file for download
     */
    public function streamDecryptedFile(Document $document): StreamedResponse
    {
        try {
            // Get encrypted content from Wasabi
            $encryptedContent = $this->wasabiService->getFileContent($document->file_path);
            
            // Decrypt encryption key
            $encryptionKey = $this->encryptionService->decryptKey($document->encryption_key);
            
            // Decrypt file content
            $decryptedContent = $this->encryptionService->decrypt($encryptedContent, $encryptionKey);
            
            $headers = [
                'Content-Type' => $document->mime_type,
                'Content-Disposition' => 'attachment; filename="' . $document->original_filename . '"',
                'Content-Length' => strlen($decryptedContent),
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ];
            
            return response()->streamDownload(function () use ($decryptedContent) {
                echo $decryptedContent;
            }, $document->original_filename, $headers);
            
        } catch (\Exception $e) {
            Log::error('File download failed', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);
            
            abort(500, 'Failed to process file for download');
        }
    }

    /**
     * Delete document and file
     */
    public function deleteDocument(Document $document): bool
    {
        try {
            // Delete from Wasabi S3
            $deleteResult = $this->wasabiService->deleteFile($document->file_path);
            
            if (!$deleteResult['success']) {
                Log::warning('Failed to delete file from cloud storage', [
                    'document_id' => $document->id,
                    'file_path' => $document->file_path
                ]);
            }
            
            // Soft delete from database
            $document->delete();
            
            Log::info('Document deleted successfully', [
                'document_id' => $document->id,
                'file_path' => $document->file_path
            ]);
            
            return true;
            
        } catch (\Exception $e) {
            Log::error('Document deletion failed', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    /**
     * Advanced search with multiple filters
     */
    public function advancedSearch(User $user, string $searchTerm, array $filters): array
    {
        $query = Document::where('user_id', $user->id);
        
        // Text search
        if (!empty($searchTerm)) {
            $query->search($searchTerm);
        }
        
        // Apply filters
        if (!empty($filters['category'])) {
            $query->byCategory($filters['category']);
        }
        
        if (!empty($filters['client'])) {
            $query->byClient($filters['client']);
        }
        
        if (!empty($filters['date_from'])) {
            $query->where('upload_date', '>=', $filters['date_from']);
        }
        
        if (!empty($filters['date_to'])) {
            $query->where('upload_date', '<=', $filters['date_to']);
        }
        
        if (!empty($filters['tags'])) {
            $tags = explode(',', $filters['tags']);
            $query->where(function ($q) use ($tags) {
                foreach ($tags as $tag) {
                    $q->orWhereJsonContains('tags', trim($tag));
                }
            });
        }
        
        $results = $query->orderBy('upload_date', 'desc')
                        ->limit(50)
                        ->get()
                        ->map(function ($document) {
                            return [
                                'id' => $document->id,
                                'document_name' => $document->document_name,
                                'client_name' => $document->client_name,
                                'category' => $document->category,
                                'file_size' => $document->formatted_file_size,
                                'file_type' => strtoupper($document->file_type),
                                'status' => $document->status,
                                'upload_date' => $document->upload_date->format('M d, Y'),
                                'uploaded_time_ago' => $document->uploaded_time_ago,
                                'tags' => $document->tags ?? [],
                                'download_url' => $document->getDownloadUrl(),
                            ];
                        });
        
        return $results->toArray();
    }

    /**
     * Process document after upload (virus scan, OCR, etc.)
     */
    private function processDocument(Document $document): void
    {
        try {
            // Mark as processing
            $document->markAsProcessing();
            
            // Here you can add additional processing:
            // - Virus scanning
            // - OCR for text extraction
            // - Thumbnail generation
            // - Document validation
            
            // For now, just mark as completed
            sleep(1); // Simulate processing time
            $document->markAsProcessed();
            
        } catch (\Exception $e) {
            Log::error('Document processing failed', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);
            
            $document->markAsFailed();
        }
    }

    /**
     * Generate document name from filename and metadata
     */
    private function generateDocumentName(string $originalFilename, array $metadata): string
    {
        $baseName = pathinfo($originalFilename, PATHINFO_FILENAME);
        
        // If filename already contains client name or category, use as is
        $clientName = $metadata['client_name'];
        $category = $metadata['category'];
        
        if (stripos($baseName, $clientName) !== false) {
            return $baseName;
        }
        
        // Generate descriptive name
        return sprintf('%s - %s', $category, $clientName);
    }

    /**
     * Get storage statistics for user
     */
    public function getStorageStats(User $user): array
    {
        $documents = Document::where('user_id', $user->id);
        
        $totalSize = $documents->sum('file_size');
        $totalDocuments = $documents->count();
        
        $categoryStats = $documents->selectRaw('category, COUNT(*) as count, SUM(file_size) as size')
                                  ->groupBy('category')
                                  ->get()
                                  ->mapWithKeys(function ($item) {
                                      return [$item->category => [
                                          'count' => $item->count,
                                          'size' => $this->formatBytes($item->size)
                                      ]];
                                  });
        
        return [
            'total_size' => $totalSize,
            'total_documents' => $totalDocuments,
            'formatted_size' => $this->formatBytes($totalSize),
            'category_breakdown' => $categoryStats,
            'storage_limit' => 100 * 1024 * 1024 * 1024, // 100GB
            'usage_percentage' => min(100, ($totalSize / (100 * 1024 * 1024 * 1024)) * 100)
        ];
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

    /**
     * Get recent activity for dashboard
     */
    public function getRecentActivity(User $user, int $limit = 10): array
    {
        $recentDocuments = Document::where('user_id', $user->id)
                                 ->orderBy('created_at', 'desc')
                                 ->limit($limit)
                                 ->get();
        
        $activities = [];
        
        foreach ($recentDocuments as $document) {
            $activities[] = [
                'id' => $document->id,
                'action' => 'Document uploaded',
                'details' => $document->document_name,
                'time' => $document->created_at->diffForHumans(),
                'icon' => 'Upload',
                'color' => 'text-green-600'
            ];
            
            if ($document->processed_at) {
                $activities[] = [
                    'id' => $document->id . '_processed',
                    'action' => 'Document processed',
                    'details' => $document->document_name,
                    'time' => $document->processed_at->diffForHumans(),
                    'icon' => 'CheckCircle',
                    'color' => 'text-green-600'
                ];
            }
        }
        
        // Sort by time and limit
        usort($activities, function ($a, $b) {
            return strtotime($b['time']) - strtotime($a['time']);
        });
        
        return array_slice($activities, 0, $limit);
    }
}