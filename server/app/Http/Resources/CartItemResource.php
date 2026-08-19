<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $images = collect($this->product?->images ?? [])->pluck('url')->values()->all();

        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'quantity' => $this->quantity,
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product->id,
                'slug' => $this->product->slug,
                'name' => $this->product->name,
                'price' => round((float) $this->product->price_value, 2),
                'original_price' => $this->product->original_price_value !== null ? round((float) $this->product->original_price_value, 2) : null,
                'image' => $images[0] ?? null,
                'images' => $images,
                'stock' => $this->product->stock,
                'in_stock' => $this->product->is_active && $this->product->stock > 0,
                'category' => $this->whenLoaded('product.category', fn () => $this->product->category?->name),
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}