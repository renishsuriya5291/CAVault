<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->foreignId('client_id')->nullable()->after('user_id')
                  ->constrained()->onDelete('set null');
            $table->index(['user_id', 'client_id']);
        });
    }

    public function down()
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropIndex(['user_id', 'client_id']);
            $table->dropColumn('client_id');
        });
    }
};