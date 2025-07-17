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
        'original_name',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
        'category',
        'description',
        'metadata',
        'encryption_key',
        'encryption_method',
        'file_hash',
        'status',
        'uploaded_at',
        'last_accessed_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'uploaded_at' => 'datetime',
        'last_accessed_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Accessors
    public function getFileSizeHumanAttribute()
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    // Scopes
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeReady($query)
    {
        return $query->where('status', 'ready');
    }

    // Helper methods
    public function isReady()
    {
        return $this->status === 'ready';
    }

    public function markAsAccessed()
    {
        $this->update(['last_accessed_at' => now()]);
    }
}