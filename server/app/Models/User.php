<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'ca_license_number',
        'firm_name',
        'phone',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'account_status',
        'terms_accepted',
        'terms_accepted_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'terms_accepted' => 'boolean',
        'terms_accepted_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relationships
    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    // Accessors & Mutators
    public function getFullAddressAttribute()
    {
        return trim($this->address . ', ' . $this->city . ', ' . $this->state . ' ' . $this->postal_code);
    }

    // Helper methods
    public function isActive()
    {
        return $this->account_status === 'active';
    }

    public function isPending()
    {
        return $this->account_status === 'pending';
    }

    public function isSuspended()
    {
        return $this->account_status === 'suspended';
    }
}