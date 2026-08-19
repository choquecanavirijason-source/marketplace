<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return array_merge(
            (new ProductResource($this->product))->toArray($request),
            [
                'qty' => $this->qty,
            ]
        );
    }
}
