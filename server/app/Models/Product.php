<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'category_id',
        'price',
        'original_price',
        'tag',
        'sku',
        'stock',
        'description',
        'long_description',
        'details',
        'sizes',
        'colors',
        'tags',
        'weight',
        'warranty',
        'images',
        'is_active',
    ];

    protected $casts = [
        'details' => 'array',
        'sizes' => 'array',
        'colors' => 'array',
        'tags' => 'array',
        'images' => 'array',
        'stock' => 'integer',
        'is_active' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    protected function priceValue(): Attribute
    {
        return Attribute::make(
            get: fn (mixed $value, array $attributes) => (float) str_replace(',', '.', (string) $attributes['price']),
        );
    }

    protected function originalPriceValue(): Attribute
    {
        return Attribute::make(
            get: function (mixed $value, array $attributes) {
                if (empty($attributes['original_price'])) {
                    return null;
                }

                return (float) str_replace(',', '.', (string) $attributes['original_price']);
            },
        );
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($search) . '%'])
                ->orWhereRaw('LOWER(description) LIKE ?', ['%' . strtolower($search) . '%']);
        });
    }

    public function scopeFilterByTag(Builder $query, ?string $tag): Builder
    {
        if (!$tag) {
            return $query;
        }

        return $query->where('tag', $tag);
    }

    public function scopeFilterByCategory(Builder $query, ?string $category): Builder
    {
        if (!$category) {
            return $query;
        }

        return $query->whereHas('category', fn ($q) => $q->where('slug', $category));
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeSort(Builder $query, string $sortBy = 'id', string $sortDir = 'asc'): Builder
    {
        return $query->orderBy($sortBy, $sortDir);
    }
}