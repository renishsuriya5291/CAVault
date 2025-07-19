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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Document Information
            $table->string('client_name');
            $table->string('document_name');
            $table->string('original_filename');
            $table->string('file_path');
            $table->bigInteger('file_size');
            $table->string('file_type', 10); // pdf, doc, xlsx, etc.
            $table->string('mime_type');
            
            // Categorization
            $table->enum('category', [
                'Tax Returns',
                'Financial Statements', 
                'Audit Reports',
                'GST Returns',
                'Service Agreements',
                'Invoice Templates',
                'Legal Documents',
                'Other'
            ])->default('Other');
            
            $table->text('description')->nullable();
            $table->json('tags')->nullable(); // Store tags as JSON array
            
            // Security & Encryption
            $table->text('encryption_key'); // Encrypted storage key
            
            // Status & Processing
            $table->enum('status', [
                'processing',
                'completed', 
                'review',
                'failed'
            ])->default('processing');
            
            $table->timestamp('upload_date');
            $table->timestamp('processed_at')->nullable();
            
            // Additional metadata
            $table->json('metadata')->nullable(); // Store additional file metadata
            
            // Audit fields
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for performance
            $table->index(['user_id', 'category']);
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'client_name']);
            $table->index('upload_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};