<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'ca_license_number',
        'firm_name',
        'phone',
        'business_address',
        'timezone',
        'is_active',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Relationships
     */
    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Accessors
     */
    public function getFirstNameAttribute()
    {
        return explode(' ', $this->name)[0];
    }

    /**
     * Methods
     */
    public function updateLastLogin()
    {
        $this->update(['last_login_at' => now()]);
    }

    public function getTotalDocuments()
    {
        return $this->documents()->count();
    }

    public function getTotalStorageUsed()
    {
        return $this->documents()->sum('file_size');
    }

    public function getFormattedStorageUsed()
    {
        $bytes = $this->getTotalStorageUsed();
        
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

    public function getStorageUsagePercentage($limit = 107374182400) // 100GB default
    {
        $used = $this->getTotalStorageUsed();
        return min(100, ($used / $limit) * 100);
    }
}