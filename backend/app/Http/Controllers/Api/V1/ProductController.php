<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::query()
            ->with('category')
            ->inCategory($request->query('category'))
            ->latest()
            ->get();

        return ProductResource::collection($products);
    }

    public function flashDeals()
    {
        $products = Product::query()->with('category')->flashDeals()->get();

        return ProductResource::collection($products);
    }

    public function related(Product $product)
    {
        $related = Product::query()
            ->with('category')
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->limit(8)
            ->get();

        return ProductResource::collection($related);
    }

    public function show(Product $product)
    {
        return new ProductResource($product->load('category'));
    }

    public function store(StoreProductRequest $request)
    {
        $product = Product::create($request->validated());

        return new ProductResource($product->load('category'));
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $product->update($request->validated());

        return new ProductResource($product->load('category'));
    }

    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);

        $product->delete();

        return response()->json(status: 204);
    }
}
