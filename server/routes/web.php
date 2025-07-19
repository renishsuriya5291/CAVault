<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DocumentController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return view('welcome');
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// API routes (CSRF excluded via bootstrap/app.php)
Route::prefix('api')->group(function () {
    
    // Public routes (no authentication required)
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    // Public download route (token-based authentication)
    Route::get('/documents/{id}/download/{token}', [DocumentController::class, 'downloadFile'])->name('api.documents.download-file');

    // Protected routes (authentication required)
    Route::middleware('auth:sanctum')->group(function () {
        
        // Auth routes
        Route::prefix('auth')->group(function () {
            Route::get('/user', [AuthController::class, 'user']);
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/logout-all', [AuthController::class, 'logoutAll']);
            Route::post('/update-profile', [AuthController::class, 'updateProfile']);
        });

        // Document management routes
        Route::prefix('documents')->name('api.documents.')->group(function () {
            // Main CRUD operations
            Route::get('/', [DocumentController::class, 'index'])->name('index');
            Route::post('/', [DocumentController::class, 'store'])->name('store');
            Route::delete('/{id}', [DocumentController::class, 'destroy'])->name('destroy');
            
            // Download routes (protected)
            Route::get('/{id}/download', [DocumentController::class, 'download'])->name('download');
            
            // Dashboard and analytics
            Route::get('/stats', [DocumentController::class, 'stats'])->name('stats');
            Route::get('/recent', [DocumentController::class, 'recent'])->name('recent');
            
            // Search and filtering
            Route::get('/search', [DocumentController::class, 'search'])->name('search');
            Route::get('/categories', [DocumentController::class, 'categories'])->name('categories');
        });

        // Dashboard routes
        Route::prefix('dashboard')->name('api.dashboard.')->group(function () {
            Route::get('/stats', [DocumentController::class, 'stats'])->name('stats');
            Route::get('/recent-documents', [DocumentController::class, 'recent'])->name('recent-documents');
            Route::get('/recent-activity', function() {
                $user = request()->user();
                $documentService = app(\App\Services\DocumentService::class);
                $activity = $documentService->getRecentActivity($user);
                
                return response()->json([
                    'success' => true,
                    'data' => $activity
                ]);
            })->name('recent-activity');
        });

        // Storage management routes
        Route::prefix('storage')->name('api.storage.')->group(function () {
            Route::get('/stats', function() {
                $user = request()->user();
                $documentService = app(\App\Services\DocumentService::class);
                $stats = $documentService->getStorageStats($user);
                
                return response()->json([
                    'success' => true,
                    'data' => $stats
                ]);
            })->name('stats');
        });

    });

    // API Fallback route
    Route::fallback(function () {
        return response()->json([
            'success' => false,
            'message' => 'API endpoint not found'
        ], 404);
    });
});