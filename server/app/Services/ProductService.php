<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductService
{
    public function catalog(array $filters): LengthAwarePaginator
    {
        return Product::query()
            ->with('category')
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->active()
            ->search($filters['search'] ?? null)
            ->filterByTag($filters['tag'] ?? null)
            ->filterByCategory($filters['category'] ?? null)
            ->sort(
                $filters['sortBy']['sort'] ?? 'id',
                $filters['sortBy']['order'] ?? 'asc'
            )
            ->paginate(
                $filters['limit'] ?? 12,
                ['*'],
                'page',
                $filters['page'] ?? 1
            );
    }

    public function adminCatalog(array $filters): LengthAwarePaginator
    {
        return Product::query()
            ->with('category')
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->search($filters['search'] ?? null)
            ->filterByCategory($filters['category'] ?? null)
            ->when(
                isset($filters['is_active']) && $filters['is_active'] !== '',
                fn ($query) => $query->where(
                    'is_active',
                    filter_var($filters['is_active'], FILTER_VALIDATE_BOOL)
                )
            )
            ->sort(
                $filters['sortBy']['sort'] ?? 'id',
                $filters['sortBy']['order'] ?? 'desc'
            )
            ->paginate(
                $filters['limit'] ?? 10,
                ['*'],
                'page',
                $filters['page'] ?? 1
            );
    }

    public function all(): Collection
    {
        return Product::with('category')
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->active()
            ->orderBy('name', 'asc')
            ->get();
    }

    public function findBySlugOrId($slug): ?Product
    {
        return Product::with('category')
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->where(is_numeric($slug) ? 'id' : 'slug', $slug)
            ->first();
    }

    public function create(array $data): Product
    {
        $data['slug'] = $this->uniqueSlug($data['name']);
        $product = Product::create($data);

        $images = $this->resolveImages($data);
        if ($images !== null) {
            $product->update(['images' => $images]);
        }

        return $product;
    }

    public function update(Product $product, array $data): Product
    {
        $data['slug'] = $this->uniqueSlug($data['name'], $product->slug);
        $product->update($data);

        $images = $this->resolveImages($data);
        if ($images !== null) {
            $product->update(['images' => $images]);
        }

        return $product;
    }

    public function delete(Product $product): void
    {
        $this->deleteImageFiles($product->images ?? []);
        $product->delete();
    }

    public function toggleActive(Product $product, bool $isActive): Product
    {
        $product->update(['is_active' => $isActive]);

        return $product;
    }

    private function deleteImageFiles(array $images): void
    {
        foreach ($images as $image) {
            $url = $image['url'] ?? null;
            if (!$url || !str_contains($url, '/storage/')) {
                continue;
            }

            $relative = Str::after($url, '/storage/');
            if (Storage::disk('public')->exists($relative)) {
                Storage::disk('public')->delete($relative);
            }
        }
    }

    private function resolveImages(array $data): ?array
    {
        $images = [];

        foreach ($data['existing_images'] ?? [] as $image) {
            if (is_array($image) && !empty($image['url'])) {
                $images[] = [
                    'url' => $image['url'],
                    'alt' => $image['alt'] ?? '',
                ];
            }
        }

        $rawImages = $data['images'] ?? [];
        $hasUploadedFiles = is_array($rawImages)
            && isset($rawImages[0])
            && $rawImages[0] instanceof UploadedFile;

        if (!$hasUploadedFiles && is_array($rawImages)) {
            foreach ($rawImages as $image) {
                if (is_array($image) && !empty($image['url'])) {
                    $images[] = [
                        'url' => $image['url'],
                        'alt' => $image['alt'] ?? '',
                    ];
                }
            }
        }

        $alts = $data['image_alts'] ?? [];
        if ($hasUploadedFiles) {
            foreach ($rawImages as $index => $file) {
                $path = $file->store('products', 'public');
                $images[] = [
                    'url' => asset(Storage::url($path)),
                    'alt' => $alts[$index] ?? '',
                ];
            }
        }

        return $images;
    }

    private function uniqueSlug(string $name, ?string $currentSlug = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $counter = 1;

        $query = Product::where('slug', $slug);
        if ($currentSlug) {
            $query->where('slug', '!=', $currentSlug);
        }

        while ($query->exists()) {
            $slug = $base . '-' . $counter++;
            $query = Product::where('slug', $slug);
            if ($currentSlug) {
                $query->where('slug', '!=', $currentSlug);
            }
        }

        return $slug;
    }
}