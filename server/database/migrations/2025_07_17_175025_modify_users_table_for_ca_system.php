<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Add CA specific fields
            $table->string('ca_license_number')->unique()->after('email');
            $table->string('firm_name')->after('ca_license_number');
            $table->string('phone')->nullable()->after('firm_name');
            $table->text('address')->nullable()->after('phone');
            $table->string('city')->nullable()->after('address');
            $table->string('state')->nullable()->after('city');
            $table->string('country')->default('India')->after('state');
            $table->string('postal_code')->nullable()->after('country');
            $table->enum('account_status', ['pending', 'active', 'suspended'])->default('pending')->after('postal_code');
            $table->timestamp('email_verified_at')->nullable()->change();
            $table->boolean('terms_accepted')->default(false)->after('account_status');
            $table->timestamp('terms_accepted_at')->nullable()->after('terms_accepted');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
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
                'terms_accepted_at'
            ]);
        });
    }
};