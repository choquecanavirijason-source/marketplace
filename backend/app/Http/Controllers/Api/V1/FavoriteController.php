<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Favorite\ToggleFavoriteRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\FavoriteService;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function __construct(private FavoriteService $favoriteService)
    {
    }

    public function index(Request $request)
    {
        return ProductResource::collection($this->favoriteService->items($request->user()));
    }

    public function toggle(ToggleFavoriteRequest $request)
    {
        $product = Product::findOrFail($request->validated('product_id'));

        return ProductResource::collection($this->favoriteService->toggle($request->user(), $product));
    }

    public function destroy(Request $request, Product $product)
    {
        return ProductResource::collection($this->favoriteService->remove($request->user(), $product->id));
    }
}
