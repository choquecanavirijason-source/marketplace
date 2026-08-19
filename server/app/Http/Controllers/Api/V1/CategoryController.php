<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CategoryController extends Controller
{
    public function __construct(private readonly CategoryService $categoryService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->categoryService->paginate($request->all());

        return CategoryResource::collection($result)->response();
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category = $this->categoryService->create($request->name);

        return (new CategoryResource($category))
            ->additional([
                'success' => true,
                'message' => 'Categoría creada satisfactoriamente',
            ])
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Category $category): JsonResponse
    {
        return (new CategoryResource($category->loadCount('products')))
            ->additional(['success' => true])
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $this->categoryService->update($category, $request->name);

        return (new CategoryResource($category))
            ->additional([
                'success' => true,
                'message' => 'Categoría actualizada satisfactoriamente',
            ])
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    public function destroy(Category $category): JsonResponse
    {
        $this->categoryService->delete($category);

        return response()->json([
            'success' => true,
            'message' => 'Categoría eliminada satisfactoriamente',
        ], Response::HTTP_OK);
    }

    public function all(): JsonResponse
    {
        $result = $this->categoryService->all();

        return CategoryResource::collection($result)->response();
    }
}