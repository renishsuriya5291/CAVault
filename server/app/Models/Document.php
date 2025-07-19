<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'client_id',        // NEW: Link to client
        'client_name',      // Keep for backward compatibility
        'document_name',
        'original_filename',
        'file_path',
        'file_size',
        'file_type',
        'mime_type',
        'category',
        'description',
        'tags',
        'encryption_key',
        'status',
        'upload_date',
        'processed_at',
        'metadata'
    ];

    protected $casts = [
        'tags' => 'array',
        'metadata' => 'array',
        'upload_date' => 'datetime',
        'processed_at' => 'datetime',
        'file_size' => 'integer'
    ];

    protected $dates = [
        'upload_date',
        'processed_at',
        'deleted_at'
    ];

    protected $hidden = [
        'encryption_key',
        'file_path'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    // Scopes
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByClient($query, $clientValue)
    {
        if (is_numeric($clientValue)) {
            // Search by client ID
            return $query->where('client_id', $clientValue);
        } else {
            // Search by client name (backward compatibility)
            return $query->where('client_name', 'like', "%{$clientValue}%");
        }
    }

    public function scopeByClientId($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }
    public function getClientDisplayNameAttribute()
    {
        if ($this->client) {
            return $this->client->display_name;
        }
        return $this->client_name; // Fallback for old records
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('document_name', 'like', '%' . $search . '%')
                ->orWhere('client_name', 'like', '%' . $search . '%')
                ->orWhere('description', 'like', '%' . $search . '%')
                ->orWhere('tags', 'like', '%' . $search . '%');
        });
    }

    // Accessors
    public function getFormattedFileSizeAttribute()
    {
        $bytes = $this->file_size;

        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }

    public function getUploadedTimeAgoAttribute()
    {
        return $this->upload_date->diffForHumans();
    }

    public function getStatusBadgeAttribute()
    {
        $statusMap = [
            'completed' => ['class' => 'bg-green-100 text-green-800', 'label' => 'Completed'],
            'processing' => ['class' => 'bg-yellow-100 text-yellow-800', 'label' => 'Processing'],
            'review' => ['class' => 'bg-orange-100 text-orange-800', 'label' => 'Review'],
            'failed' => ['class' => 'bg-red-100 text-red-800', 'label' => 'Failed'],
        ];

        return $statusMap[$this->status] ?? ['class' => 'bg-gray-100 text-gray-800', 'label' => 'Unknown'];
    }

    // Methods
    public function getDownloadUrl()
    {
        // FIXED: Use the correct route name with proper URL generation
        return url('/api/documents/' . $this->id . '/download');
    }

    public function canBeAccessedBy(User $user)
    {
        return $this->user_id === $user->id;
    }

    public function markAsProcessed()
    {
        $this->update([
            'status' => 'completed',
            'processed_at' => now()
        ]);
    }

    public function markAsProcessing()
    {
        $this->update([
            'status' => 'processing'
        ]);
    }

    public function markAsFailed()
    {
        $this->update([
            'status' => 'failed'
        ]);
    }
}