<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Register a new CA user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::min(8)
                ->mixedCase()
                ->numbers()
                ->symbols()
                ->uncompromised()],
            'ca_license_number' => 'required|string|unique:users|max:50',
            'firm_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'terms_accepted' => 'required|accepted',
        ], [
            'ca_license_number.required' => 'CA License Number is required',
            'ca_license_number.unique' => 'This CA License Number is already registered',
            'firm_name.required' => 'Firm Name is required',
            'terms_accepted.accepted' => 'You must accept the Terms and Conditions',
            'password.uncompromised' => 'This password has been compromised in a data breach. Please choose a different password.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'ca_license_number' => strtoupper($request->ca_license_number),
                'firm_name' => $request->firm_name,
                'phone' => $request->phone,
                'address' => $request->address,
                'city' => $request->city,
                'state' => $request->state,
                'country' => $request->country ?? 'India',
                'postal_code' => $request->postal_code,
                'terms_accepted' => true,
                'terms_accepted_at' => now(),
                'account_status' => 'pending',
            ]);

            // Create access token
            $token = $user->createToken('CA-Document-System', ['*'])->plainTextToken;

            // Log registration activity
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'register',
                'resource_type' => 'user',
                'resource_id' => $user->id,
                'description' => 'User registered successfully',
                'metadata' => [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'ca_license_number' => $user->ca_license_number,
                        'firm_name' => $user->firm_name,
                        'account_status' => $user->account_status,
                        'email_verified_at' => $user->email_verified_at,
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer',
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
            'remember_me' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Check if user exists
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'No account found with this email address.'
                ], 401);
            }

            // Check if account is suspended
            if ($user->isSuspended()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account has been suspended. Please contact support.'
                ], 403);
            }

            // Verify password
            if (!Hash::check($request->password, $user->password)) {
                // Log failed login attempt
                ActivityLog::create([
                    'user_id' => $user->id,
                    'action' => 'login_failed',
                    'resource_type' => 'user',
                    'resource_id' => $user->id,
                    'description' => 'Failed login attempt - incorrect password',
                    'metadata' => [
                        'ip' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                    ]
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email or password.'
                ], 401);
            }

            // Create token with appropriate expiry
            $tokenName = 'CA-Document-System';
            $abilities = ['*'];
            
            if ($request->remember_me) {
                $token = $user->createToken($tokenName, $abilities, now()->addDays(30))->plainTextToken;
            } else {
                $token = $user->createToken($tokenName, $abilities, now()->addHours(8))->plainTextToken;
            }

            // Log successful login
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'login',
                'resource_type' => 'user',
                'resource_id' => $user->id,
                'description' => 'User logged in successfully',
                'metadata' => [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'ca_license_number' => $user->ca_license_number,
                        'firm_name' => $user->firm_name,
                        'account_status' => $user->account_status,
                        'email_verified_at' => $user->email_verified_at,
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer',
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get authenticated user details
     */
    public function user(Request $request)
    {
        try {
            $user = $request->user();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'ca_license_number' => $user->ca_license_number,
                        'firm_name' => $user->firm_name,
                        'phone' => $user->phone,
                        'address' => $user->address,
                        'city' => $user->city,
                        'state' => $user->state,
                        'country' => $user->country,
                        'postal_code' => $user->postal_code,
                        'account_status' => $user->account_status,
                        'email_verified_at' => $user->email_verified_at,
                        'created_at' => $user->created_at,
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user data',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        try {
            $user = $request->user();
            
            // Log logout activity
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'logout',
                'resource_type' => 'user',
                'resource_id' => $user->id,
                'description' => 'User logged out',
                'metadata' => [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]
            ]);

            // Delete current access token
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Logout from all devices
     */
    public function logoutAll(Request $request)
    {
        try {
            $user = $request->user();
            
            // Log logout from all devices activity
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'logout_all',
                'resource_type' => 'user',
                'resource_id' => $user->id,
                'description' => 'User logged out from all devices',
                'metadata' => [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]
            ]);

            // Delete all access tokens
            $user->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logged out from all devices successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}