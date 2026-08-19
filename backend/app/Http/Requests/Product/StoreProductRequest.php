<?php

namespace App\Http\Requests\Product;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Product::class);
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:190'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'original_price' => ['nullable', 'numeric', 'min:0', 'gt:price'],
            'image' => ['required', 'string', 'max:2048'],
            'images' => ['nullable', 'array'],
            'images.*' => ['string', 'max:2048'],
            'badge' => ['nullable', 'string', 'max:50'],
            'weight' => ['nullable', 'string', 'max:50'],
            'in_stock' => ['boolean'],
            'sku' => ['nullable', 'string', 'max:100', 'unique:products,sku'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'warranty' => ['nullable', 'string', 'max:100'],
        ];
    }
}
