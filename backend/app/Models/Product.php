<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'original_price',
        'image',
        'images',
        'badge',
        'weight',
        'in_stock',
        'sku',
        'tags',
        'warranty',
        'rating',
        'reviews_count',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'original_price' => 'decimal:2',
            'rating' => 'decimal:1',
            'reviews_count' => 'integer',
            'in_stock' => 'boolean',
            'images' => 'array',
            'tags' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Product $product) {
            $product->slug ??= Str::slug($product->name).'-'.Str::random(6);
        });
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function favoritedBy()
    {
        return $this->hasMany(Favorite::class);
    }

    public function scopeInCategory($query, ?string $category)
    {
        if (! $category) {
            return $query;
        }

        $needle = Str::lower($category);

        return $query->whereHas('category', function ($q) use ($needle) {
            $q->whereRaw('LOWER(slug) = ?', [$needle])
                ->orWhereRaw('LOWER(name) = ?', [$needle]);
        });
    }

    public function scopeFlashDeals($query)
    {
        return $query->whereNotNull('original_price')->whereColumn('original_price', '>', 'price');
    }
}
