<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class EncryptionService
{
    /**
     * Generate a unique encryption key for document
     */
    public function generateKey(): string
    {
        return base64_encode(random_bytes(32)); // 256-bit key
    }

    /**
     * Encrypt file content with AES-256
     */
    public function encrypt(string $content, string $key): string
    {
        $cipher = 'AES-256-CBC';
        $iv = random_bytes(16);
        $decodedKey = base64_decode($key);
        
        $encrypted = openssl_encrypt($content, $cipher, $decodedKey, OPENSSL_RAW_DATA, $iv);
        
        if ($encrypted === false) {
            throw new \Exception('Encryption failed');
        }
        
        // Prepend IV to encrypted data
        return base64_encode($iv . $encrypted);
    }

    /**
     * Decrypt file content
     */
    public function decrypt(string $encryptedContent, string $key): string
    {
        $cipher = 'AES-256-CBC';
        $data = base64_decode($encryptedContent);
        $decodedKey = base64_decode($key);
        
        // Extract IV (first 16 bytes)
        $iv = substr($data, 0, 16);
        $encrypted = substr($data, 16);
        
        $decrypted = openssl_decrypt($encrypted, $cipher, $decodedKey, OPENSSL_RAW_DATA, $iv);
        
        if ($decrypted === false) {
            throw new \Exception('Decryption failed');
        }
        
        return $decrypted;
    }

    /**
     * Encrypt the encryption key itself for database storage
     */
    public function encryptKey(string $key): string
    {
        return Crypt::encryptString($key);
    }

    /**
     * Decrypt the encryption key from database
     */
    public function decryptKey(string $encryptedKey): string
    {
        return Crypt::decryptString($encryptedKey);
    }

    /**
     * Generate hash for file integrity verification
     */
    public function generateFileHash(string $content): string
    {
        return hash('sha256', $content);
    }

    /**
     * Verify file integrity
     */
    public function verifyFileHash(string $content, string $expectedHash): bool
    {
        return hash_equals($expectedHash, $this->generateFileHash($content));
    }
}