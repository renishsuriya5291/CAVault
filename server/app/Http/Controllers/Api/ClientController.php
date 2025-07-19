<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ClientController extends Controller
{
    /**
     * Get all clients for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $query = Client::where('user_id', $user->id);

            // Search
            if ($request->filled('search')) {
                $query->search($request->search);
            }

            // Status filter
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'name');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $clients = $query->withCount('documents')->paginate($perPage);

            // Transform data
            $clients->getCollection()->transform(function ($client) {
                return [
                    'id' => $client->id,
                    'name' => $client->name,
                    'email' => $client->email,
                    'phone' => $client->phone,
                    'company_name' => $client->company_name,
                    'gst_number' => $client->gst_number,
                    'pan_number' => $client->pan_number,
                    'address' => $client->formatted_address,
                    'status' => $client->status,
                    'document_count' => $client->documents_count,
                    'recent_document' => $client->recent_document?->document_name,
                    'display_name' => $client->display_name,
                    'created_at' => $client->created_at->format('M d, Y'),
                    'updated_at' => $client->updated_at->diffForHumans(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $clients
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new client
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:20',
                'company_name' => 'nullable|string|max:255',
                'gst_number' => [
                    'nullable',
                    'string',
                    'max:15',
                    'unique:clients,gst_number,NULL,id,user_id,' . $request->user()->id
                ],
                'pan_number' => [
                    'nullable',
                    'string',
                    'max:10',
                    'unique:clients,pan_number,NULL,id,user_id,' . $request->user()->id
                ],
                'address' => 'nullable|string|max:500',
                'city' => 'nullable|string|max:100',
                'state' => 'nullable|string|max:100',
                'pincode' => 'nullable|string|max:10',
                'country' => 'nullable|string|max:100',
                'status' => 'nullable|in:active,inactive'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $client = Client::create([
                'user_id' => $request->user()->id,
                ...$request->only([
                    'name', 'email', 'phone', 'company_name', 
                    'gst_number', 'pan_number', 'address', 
                    'city', 'state', 'pincode', 'country', 'status'
                ])
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Client created successfully',
                'data' => $client
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create client'
            ], 500);
        }
    }

    /**
     * Update client
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $client = Client::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:20',
                'company_name' => 'nullable|string|max:255',
                'gst_number' => [
                    'nullable',
                    'string',
                    'max:15',
                    'unique:clients,gst_number,' . $client->id . ',id,user_id,' . $request->user()->id
                ],
                'pan_number' => [
                    'nullable',
                    'string',
                    'max:10',
                    'unique:clients,pan_number,' . $client->id . ',id,user_id,' . $request->user()->id
                ],
                'address' => 'nullable|string|max:500',
                'city' => 'nullable|string|max:100',
                'state' => 'nullable|string|max:100',
                'pincode' => 'nullable|string|max:10',
                'country' => 'nullable|string|max:100',
                'status' => 'nullable|in:active,inactive'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $client->update($request->only([
                'name', 'email', 'phone', 'company_name', 
                'gst_number', 'pan_number', 'address', 
                'city', 'state', 'pincode', 'country', 'status'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Client updated successfully',
                'data' => $client
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update client'
            ], 500);
        }
    }

    /**
     * Delete client (with document check)
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        try {
            $client = Client::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            // Check if client has documents
            $documentCount = $client->documents()->count();
            
            if ($documentCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete client. {$documentCount} documents are linked to this client.",
                    'document_count' => $documentCount
                ], 422);
            }

            $client->delete();

            return response()->json([
                'success' => true,
                'message' => 'Client deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete client'
            ], 500);
        }
    }

    /**
     * Get client details with documents
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            $client = Client::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->with(['documents' => function ($query) {
                    $query->orderBy('upload_date', 'desc')->limit(10);
                }])
                ->firstOrFail();

            $stats = [
                'total_documents' => $client->documents()->count(),
                'total_size' => $client->documents()->sum('file_size'),
                'categories' => $client->documents()
                    ->selectRaw('category, count(*) as count')
                    ->groupBy('category')
                    ->pluck('count', 'category')
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'client' => $client,
                    'recent_documents' => $client->documents,
                    'stats' => $stats
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Client not found'
            ], 404);
        }
    }

    /**
     * Get client options for dropdowns
     */
    public function options(Request $request): JsonResponse
    {
        try {
            $clients = Client::where('user_id', $request->user()->id)
                ->active()
                ->orderBy('name')
                ->get(['id', 'name', 'company_name']);

            $options = $clients->map(function ($client) {
                return [
                    'value' => $client->id,
                    'label' => $client->display_name
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $options
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch client options'
            ], 500);
        }
    }

    /**
     * Transfer documents from one client to another
     */
    public function transferDocuments(Request $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'target_client_id' => 'required|exists:clients,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid target client'
                ], 422);
            }

            $sourceClient = Client::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            $targetClient = Client::where('id', $request->target_client_id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            // Transfer documents
            $transferCount = $sourceClient->documents()->update([
                'client_id' => $targetClient->id,
                'client_name' => $targetClient->name // Update for backward compatibility
            ]);

            return response()->json([
                'success' => true,
                'message' => "{$transferCount} documents transferred successfully",
                'transferred_count' => $transferCount
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to transfer documents'
            ], 500);
        }
    }
}