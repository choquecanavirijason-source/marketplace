<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'price' => (float) $this->price,
            'originalPrice' => $this->original_price !== null ? (float) $this->original_price : null,
            'rating' => (float) $this->rating,
            'reviews' => $this->reviews_count,
            'image' => $this->image,
            'images' => $this->images ?? [],
            'category' => $this->whenLoaded('category', fn () => $this->category->name, $this->category_id),
            'badge' => $this->badge,
            'weight' => $this->weight,
            'inStock' => (bool) $this->in_stock,
            'sku' => $this->sku,
            'tags' => $this->tags ?? [],
            'description' => $this->description,
            'warranty' => $this->warranty,
        ];
    }
}
