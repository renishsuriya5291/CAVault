<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('original_name');
            $table->string('file_name'); // Encrypted filename
            $table->string('file_path'); // Path in Wasabi S3
            $table->string('mime_type');
            $table->bigInteger('file_size'); // in bytes
            $table->string('category')->default('general'); // tax_returns, financial_statements, etc.
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // Additional file metadata
            $table->string('encryption_key'); // Unique encryption key for this document
            $table->string('encryption_method')->default('AES-256-CBC');
            $table->string('file_hash'); // SHA256 hash for integrity check
            $table->enum('status', ['uploading', 'encrypted', 'ready', 'error'])->default('uploading');
            $table->timestamp('uploaded_at')->nullable();
            $table->timestamp('last_accessed_at')->nullable();
            $table->softDeletes(); // Soft delete for data recovery
            $table->timestamps();

            // Indexes for better performance
            $table->index(['user_id', 'category']);
            $table->index(['user_id', 'status']);
            $table->index('file_hash');
        });
    }

    public function down()
    {
        Schema::dropIfExists('documents');
    }
};