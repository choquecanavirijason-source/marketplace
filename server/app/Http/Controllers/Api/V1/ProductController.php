<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ProductController extends Controller
{
    public function __construct(private readonly ProductService $productService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->productService->catalog($request->all());

        return ProductResource::collection($result)->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateProduct($request);

        $product = $this->productService->create($data);

        return (new ProductResource($product->load('category')))
            ->additional([
                'success' => true,
                'message' => 'Producto creado satisfactoriamente',
            ])
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $this->validateProduct($request);

        $this->productService->update($product, $data);

        return (new ProductResource($product->fresh()->load('category')))
            ->additional([
                'success' => true,
                'message' => 'Producto actualizado satisfactoriamente',
            ])
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->productService->delete($product);

        return response()->json([
            'success' => true,
            'message' => 'Producto eliminado satisfactoriamente',
        ], Response::HTTP_OK);
    }

    public function all(): JsonResponse
    {
        $result = $this->productService->all();

        return ProductResource::collection($result)->response();
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $result = $this->productService->adminCatalog($request->all());

        return ProductResource::collection($result)->response();
    }

    public function toggleActive(Product $product): JsonResponse
    {
        request()->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $this->productService->toggleActive($product, (bool) request('is_active'));

        return (new ProductResource($product->fresh()->load('category')))
            ->additional([
                'success' => true,
                'message' => 'Estado del producto actualizado',
            ])
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    public function showBySlug($slug): JsonResponse
    {
        $product = $this->productService->findBySlugOrId($slug);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado',
            ], Response::HTTP_NOT_FOUND);
        }

        return (new ProductResource($product))
            ->additional(['success' => true])
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    private function validateProduct(Request $request): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|string|max:255',
            'original_price' => 'nullable|string|max:255',
            'tag' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:255',
            'stock' => 'nullable|integer|min:0',
            'weight' => 'nullable|string|max:255',
            'warranty' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'description' => 'required|string',
            'long_description' => 'nullable|string',
            'details' => 'nullable|array',
            'details.*' => 'string',
            'sizes' => 'nullable|array',
            'sizes.*' => 'string',
            'colors' => 'nullable|array',
            'colors.*' => 'string',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'existing_images' => 'nullable|array',
            'existing_images.*.url' => 'required_with:existing_images|string',
            'existing_images.*.alt' => 'nullable|string',
            'image_alts' => 'nullable|array',
            'image_alts.*' => 'nullable|string|max:255',
        ];

        if ($request->hasFile('images')) {
            $rules['images'] = 'nullable|array';
            $rules['images.*'] = 'image|mimes:jpeg,png,jpg,webp|max:5120';
        } else {
            $rules['images'] = 'nullable|array';
            $rules['images.*.url'] = 'required_with:images|string';
            $rules['images.*.alt'] = 'nullable|string';
        }

        $request->validate($rules);

        return $request->all();
    }
}