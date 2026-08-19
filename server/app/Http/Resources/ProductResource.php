<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $images = collect($this->images ?? [])->pluck('url')->values()->all();
        $firstImage = $images[0] ?? null;

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'price' => round($this->price_value, 2),
            'price_raw' => $this->price,
            'original_price' => $this->original_price_value !== null ? round($this->original_price_value, 2) : null,
            'tag' => $this->tag,
            'sku' => $this->sku,
            'stock' => $this->stock,
            'in_stock' => $this->is_active && $this->stock > 0,
            'is_active' => $this->is_active,
            'description' => $this->description,
            'long_description' => $this->long_description,
            'details' => $this->details,
            'sizes' => $this->sizes,
            'colors' => $this->colors,
            'tags' => $this->tags,
            'weight' => $this->weight,
            'warranty' => $this->warranty,
            'image' => $firstImage,
            'images' => $images,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => $this->category?->name),
            'category_slug' => $this->whenLoaded('category', fn () => $this->category?->slug),
            'rating' => round((float) ($this->reviews_avg_rating ?? 0), 1),
            'reviews_count' => (int) ($this->reviews_count ?? 0),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}