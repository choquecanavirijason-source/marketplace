<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'productId' => $this->product_id,
            'name' => $this->name,
            'date' => $this->created_at->toDateString(),
            'rating' => $this->rating,
            'text' => $this->text,
            'helpful' => $this->helpful,
        ];
    }
}
