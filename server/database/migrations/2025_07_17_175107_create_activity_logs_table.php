<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('action'); // login, upload, download, delete, etc.
            $table->string('resource_type')->nullable(); // document, user, etc.
            $table->unsignedBigInteger('resource_id')->nullable();
            $table->text('description');
            $table->json('metadata')->nullable(); // IP, user agent, etc.
            $table->timestamps();

            $table->index(['user_id', 'action']);
            $table->index(['resource_type', 'resource_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('activity_logs');
    }
};