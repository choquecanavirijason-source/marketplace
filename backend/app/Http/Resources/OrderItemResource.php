<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'productId' => $this->product_id,
            'name' => $this->product_name,
            'image' => $this->product_image,
            'price' => (float) $this->unit_price,
            'qty' => $this->qty,
            'subtotal' => (float) $this->subtotal,
        ];
    }
}
