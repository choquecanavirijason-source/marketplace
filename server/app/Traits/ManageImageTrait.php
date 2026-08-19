<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Collection;

trait ManageImageTrait
{
    public function saveImage($file, string $field, string $path = 'images'): ?string
    {
        if ($file instanceof UploadedFile) {
            $this->deleteFileFromDisk($field);
            $imagePath = $file->store($path, 'public');
            $this->update([$field => $imagePath]);
            return $imagePath;
        }

        if (empty($file)) {
            $this->deleteImage($field);
            return null;
        }

        return $this->{$field};
    }

    public function deleteImage(string $field): void
    {
        $this->deleteFileFromDisk($field);
        $this->update([$field => null]);
    }

    public function saveMultipleFiles(array $files = [], string $path = 'media', int $maxFiles = 10): array
    {
        $currentFiles = $this->media_files ?? [];
        $savedFiles = [];

        foreach ($files as $file) {
            if (count($currentFiles) + count($savedFiles) >= $maxFiles) {
                break;
            }

            if ($file instanceof UploadedFile) {
                $storedPath = $file->store($path, 'public');
                
                $savedFiles[] = [
                    'id' => uniqid(),
                    'name' => $file->getClientOriginalName(),
                    'path' => $storedPath,
                    'type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'url' => Storage::url($storedPath),
                ];
            }
        }

        $allFiles = array_merge($currentFiles, $savedFiles);
        $this->update(['media_files' => $allFiles]);
        
        return $savedFiles;
    }

    public function deleteMediaFile(string $fileId): bool
    {
        $currentFiles = $this->media_files ?? [];
        
        foreach ($currentFiles as $key => $file) {
            if ($file['id'] === $fileId) {
                if (isset($file['path']) && Storage::disk('public')->exists($file['path'])) {
                    Storage::disk('public')->delete($file['path']);
                }
                
                unset($currentFiles[$key]);
                $this->update(['media_files' => array_values($currentFiles)]);
                return true;
            }
        }
        
        return false;
    }

    public function deleteMediaFiles(array $fileIds): int
    {
        $deletedCount = 0;
        
        foreach ($fileIds as $fileId) {
            if ($this->deleteMediaFile($fileId)) {
                $deletedCount++;
            }
        }
        
        return $deletedCount;
    }

    public function deleteAllMediaFiles(): void
    {
        $currentFiles = $this->media_files ?? [];
        
        foreach ($currentFiles as $file) {
            if (isset($file['path']) && Storage::disk('public')->exists($file['path'])) {
                Storage::disk('public')->delete($file['path']);
            }
        }
        
        $this->update(['media_files' => []]);
    }

    public function updateMediaFiles(array $files): void
    {
        $oldFiles = $this->media_files ?? [];
        foreach ($oldFiles as $oldFile) {
            if (isset($oldFile['path']) && Storage::disk('public')->exists($oldFile['path'])) {
                Storage::disk('public')->delete($oldFile['path']);
            }
        }
        
        $this->update(['media_files' => $files]);
    }

    public function getImagesFromMedia(): array
    {
        $files = $this->media_files ?? [];
        
        return array_filter($files, function($file) {
            return str_starts_with($file['type'] ?? '', 'image/');
        });
    }

    public function getVideosFromMedia(): array
    {
        $files = $this->media_files ?? [];
        
        return array_filter($files, function($file) {
            return str_starts_with($file['type'] ?? '', 'video/');
        });
    }

    public function getMediaFileUrl(string $fileId): ?string
    {
        $files = $this->media_files ?? [];
        
        foreach ($files as $file) {
            if ($file['id'] === $fileId && isset($file['path'])) {
                return asset(Storage::url($file['path']));
            }
        }
        
        return null;
    }

    public function getAllMediaUrls(): array
    {
        $files = $this->media_files ?? [];
        $urls = [];
        
        foreach ($files as $file) {
            if (isset($file['path'])) {
                $urls[] = [
                    'id' => $file['id'],
                    'url' => asset(Storage::url($file['path'])),
                    'type' => $file['type'] ?? 'unknown',
                    'name' => $file['name'] ?? 'file',
                ];
            }
        }
        
        return $urls;
    }

    public function getThumbnailFromMedia(): ?string
    {
        $images = $this->getImagesFromMedia();
        
        if (empty($images)) {
            return null;
        }
        
        $firstImage = reset($images);
        return isset($firstImage['path']) ? asset(Storage::url($firstImage['path'])) : null;
    }

    public function cleanMissingMediaFiles(): int
    {
        $currentFiles = $this->media_files ?? [];
        $cleaned = [];
        $removedCount = 0;
        
        foreach ($currentFiles as $file) {
            if (isset($file['path']) && Storage::disk('public')->exists($file['path'])) {
                $cleaned[] = $file;
            } else {
                $removedCount++;
            }
        }
        
        if ($removedCount > 0) {
            $this->update(['media_files' => $cleaned]);
        }
        
        return $removedCount;
    }


    private function deleteFileFromDisk(string $field): void
    {
        $imagePath = $this->{$field};

        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }
    }

    public function downloadFile($path)
    {
        $file = Storage::disk('public')->get($path);
        return $file;
    }


    public function getFullImageUrl(string $field = 'image'): ?string
    {
        if (!$this->{$field}) {
            return null;
        }

        return asset(Storage::url($this->{$field}));
    }
}