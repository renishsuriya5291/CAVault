<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add CA-specific fields if they don't exist
            if (!Schema::hasColumn('users', 'ca_license_number')) {
                $table->string('ca_license_number')->nullable()->after('email');
            }
            
            if (!Schema::hasColumn('users', 'firm_name')) {
                $table->string('firm_name')->nullable()->after('ca_license_number');
            }
            
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('firm_name');
            }
            
            if (!Schema::hasColumn('users', 'business_address')) {
                $table->text('business_address')->nullable()->after('phone');
            }
            
            if (!Schema::hasColumn('users', 'timezone')) {
                $table->string('timezone')->default('Asia/Kolkata')->after('business_address');
            }
            
            if (!Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('timezone');
            }
            
            if (!Schema::hasColumn('users', 'last_login_at')) {
                $table->timestamp('last_login_at')->nullable()->after('is_active');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = [
                'ca_license_number',
                'firm_name', 
                'phone',
                'business_address',
                'timezone',
                'is_active',
                'last_login_at'
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};