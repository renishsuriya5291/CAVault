<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Client;
use App\Services\DocumentService;
use App\Services\EncryptionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    protected $documentService;
    protected $encryptionService;

    public function __construct(DocumentService $documentService, EncryptionService $encryptionService)
    {
        $this->documentService = $documentService;
        $this->encryptionService = $encryptionService;
    }

    /**
     * Get user's documents with filtering and search
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $query = Document::where('user_id', $user->id);

            // Apply filters
            if ($request->filled('category') && $request->category !== 'all') {
                $query->byCategory($request->category);
            }

            if ($request->filled('client')) {
                $query->byClient($request->client);
            }

            if ($request->filled('status')) {
                $query->byStatus($request->status);
            }

            if ($request->filled('search')) {
                $query->search($request->search);
            }

            // Date range filter
            if ($request->filled('date_from')) {
                $query->where('upload_date', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->where('upload_date', '<=', $request->date_to);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'upload_date');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 12);
            $documents = $query->paginate($perPage);

            // Transform documents for frontend
            $documents->getCollection()->transform(function ($document) {
                return [
                    'id' => $document->id,
                    'document_name' => $document->document_name,
                    'client_name' => $document->client_name,
                    'category' => $document->category,
                    'file_size' => $document->formatted_file_size,
                    'file_type' => strtoupper($document->file_type),
                    'status' => $document->status,
                    'status_badge' => $document->status_badge,
                    'upload_date' => $document->upload_date->format('M d, Y'),
                    'uploaded_time_ago' => $document->uploaded_time_ago,
                    'description' => $document->description,
                    'tags' => $document->tags ?? [],
                    'download_url' => $document->getDownloadUrl(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $documents,
                'stats' => $this->getDocumentStats($user)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch documents',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Upload new document
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Updated validation
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|max:51200|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif',
                'client_id' => 'required|exists:clients,id', // Changed to client_id
                'category' => 'required|string|in:Tax Returns,Financial Statements,Audit Reports,GST Returns,Service Agreements,Invoice Templates,Legal Documents,Other',
                'description' => 'nullable|string|max:1000',
                'tags' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $file = $request->file('file');
            $user = $request->user();

            // Verify client belongs to user
            $client = Client::where('id', $request->client_id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            // Process tags
            $tags = [];
            if ($request->filled('tags')) {
                $tags = array_map('trim', explode(',', $request->tags));
                $tags = array_filter($tags);
            }

            // Upload and encrypt document
            $documentData = $this->documentService->uploadDocument($file, $user, [
                'client_id' => $client->id,           // NEW: Pass client ID
                'client_name' => $client->name,       // Keep for backward compatibility
                'category' => $request->category,
                'description' => $request->description,
                'tags' => $tags,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'data' => $documentData
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload document',
                'error' => config('app.debug') ? $e->getMessage() : 'Upload failed'
            ], 500);
        }
    }

    /**
     * Download document
     */
    public function download(Request $request, $id): JsonResponse
    {
        try {
            $user = $request->user();
            $document = Document::where('id', $id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            // Generate secure download URL
            $downloadUrl = $this->documentService->generateSecureDownloadUrl($document);

            return response()->json([
                'success' => true,
                'download_url' => $downloadUrl,
                'document' => [
                    'name' => $document->document_name,
                    'original_filename' => $document->original_filename,
                    'size' => $document->formatted_file_size
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found or access denied'
            ], 404);
        }
    }

    /**
     * Get direct file download (with token validation)
     */
    public function downloadFile(Request $request, $id, $token)
    {
        try {
            // Validate download token first
            if (!$this->documentService->validateDownloadToken($token, $id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired download token'
                ], 403);
            }

            // Get document without authentication since token is validated
            $document = Document::findOrFail($id);

            // Decrypt and stream file
            return $this->documentService->streamDecryptedFile($document);

        } catch (\Exception $e) {
            Log::error('File download failed', [
                'document_id' => $id,
                'token' => $token,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'File not found or download failed'
            ], 404);
        }
    }

    /**
     * Delete document
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $user = $request->user();
            $document = Document::where('id', $id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            // Delete file from storage and database
            $this->documentService->deleteDocument($document);

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete document'
            ], 500);
        }
    }

    /**
     * Get dashboard statistics
     */
    public function stats(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $stats = $this->getDocumentStats($user);

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics'
            ], 500);
        }
    }

    /**
     * Get recent documents for dashboard
     */
    public function recent(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $limit = $request->get('limit', 4);

            $recentDocuments = Document::where('user_id', $user->id)
                ->orderBy('upload_date', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($document) {
                    return [
                        'id' => $document->id,
                        'name' => $document->document_name,
                        'category' => $document->category,
                        'uploadedAt' => $document->uploaded_time_ago,
                        'status' => $document->status,
                        'size' => $document->formatted_file_size
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $recentDocuments
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recent documents'
            ], 500);
        }
    }

    /**
     * Search documents with advanced options
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $searchTerm = $request->get('q', '');
            $filters = $request->only(['category', 'client', 'date_from', 'date_to', 'tags']);

            $results = $this->documentService->advancedSearch($user, $searchTerm, $filters);

            return response()->json([
                'success' => true,
                'data' => $results,
                'search_term' => $searchTerm,
                'filters_applied' => array_filter($filters)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Search failed'
            ], 500);
        }
    }

    /**
     * Get document categories for filters
     */
    public function categories(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $categories = Document::where('user_id', $user->id)
                ->select('category')
                ->groupBy('category')
                ->pluck('category');

            if ($categories->isEmpty()) {
                $defaultCategories = [
                    'Tax Returns',
                    'Financial Statements',
                    'Audit Reports',
                    'GST Returns',
                    'Service Agreements',
                    'Invoice Templates',
                    'Legal Documents',
                    'Other'
                ];

                $categories = collect($defaultCategories)->map(function ($category) {
                    return [
                        'value' => $category,
                        'label' => $category,
                        'count' => 0
                    ];
                });
            } else {
                $categories = $categories->map(function ($category) {
                    return [
                        'value' => $category,
                        'label' => $category,
                        'count' => Document::where('category', $category)->count()
                    ];
                });
            }

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories'
            ], 500);
        }
    }


    /**
     * Get document statistics for user
     */
    private function getDocumentStats($user): array
    {
        $documents = Document::where('user_id', $user->id);

        $totalDocuments = $documents->count();
        $totalSize = $documents->sum('file_size');
        $storageUsed = ($totalSize / (100 * 1024 * 1024 * 1024)) * 100; // Assuming 100GB limit

        $recentUploads = $documents->where('upload_date', '>=', now()->subDays(7))->count();
        $pendingReviews = $documents->where('status', 'review')->count();

        $activeClients = $documents->distinct('client_name')->count('client_name');

        $categoryCounts = $documents->groupBy('category')
            ->selectRaw('category, count(*) as count')
            ->pluck('count', 'category')
            ->toArray();

        return [
            'totalDocuments' => $totalDocuments,
            'activeClients' => $activeClients,
            'storageUsed' => round($storageUsed, 1),
            'recentUploads' => $recentUploads,
            'pendingReviews' => $pendingReviews,
            'categoryCounts' => $categoryCounts,
            'totalSize' => $this->formatBytes($totalSize),
            'storageLimit' => '100GB'
        ];
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($size, $precision = 2): string
    {
        if ($size > 0) {
            $size = (int) $size;
            $base = log($size) / log(1024);
            $suffixes = array(' bytes', ' KB', ' MB', ' GB', ' TB');
            return round(pow(1024, $base - floor($base)), $precision) . $suffixes[floor($base)];
        }
        return $size;
    }
}