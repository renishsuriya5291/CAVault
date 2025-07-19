<?php
// =============================================================================
// 1. CLIENT MODEL (app/Models/Client.php)
// =============================================================================

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'company_name',
        'gst_number',
        'pan_number',
        'address',
        'city',
        'state',
        'pincode',
        'country',
        'status',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array'
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('email', 'like', "%{$term}%")
              ->orWhere('company_name', 'like', "%{$term}%")
              ->orWhere('gst_number', 'like', "%{$term}%")
              ->orWhere('pan_number', 'like', "%{$term}%");
        });
    }

    // Accessors
    public function getDocumentCountAttribute()
    {
        return $this->documents()->count();
    }

    public function getRecentDocumentAttribute()
    {
        return $this->documents()->latest('upload_date')->first();
    }

    public function getFormattedAddressAttribute()
    {
        $parts = array_filter([
            $this->address,
            $this->city,
            $this->state,
            $this->pincode
        ]);
        
        return implode(', ', $parts);
    }

    public function getDisplayNameAttribute()
    {
        return $this->company_name ? "{$this->name} ({$this->company_name})" : $this->name;
    }
}
