<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\TestimonialService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

class TestimonialController extends Controller
{
    public function __construct(private readonly TestimonialService $testimonialService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('testimonio.ver');

        $result = $this->testimonialService->paginate($request->all());

        return response()->json([
            'success' => true,
            'data' => $result,
        ], Response::HTTP_OK);
    }

    public function store(Request $request): JsonResponse
    {
        Gate::authorize('testimonio.crear');

        $request->validate([
            'quote' => 'required|string',
            'author' => 'required|string|max:255',
            'rating' => 'nullable|integer|min:1|max:5',
            'is_active' => 'nullable|boolean',
        ]);

        $testimonial = $this->testimonialService->create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Testimonio creado satisfactoriamente',
            'data' => $testimonial,
        ], Response::HTTP_CREATED);
    }

    public function show($id): JsonResponse
    {
        Gate::authorize('testimonio.ver');

        $testimonial = $this->testimonialService->show($id);

        return response()->json([
            'success' => true,
            'data' => $testimonial,
        ], Response::HTTP_OK);
    }

    public function update(Request $request, $id): JsonResponse
    {
        Gate::authorize('testimonio.editar');

        $request->validate([
            'quote' => 'required|string',
            'author' => 'required|string|max:255',
            'rating' => 'nullable|integer|min:1|max:5',
            'is_active' => 'nullable|boolean',
        ]);

        $testimonial = $this->testimonialService->update($id, $request->all());

        return response()->json([
            'success' => true,
            'message' => 'Testimonio actualizado satisfactoriamente',
            'data' => $testimonial,
        ], Response::HTTP_OK);
    }

    public function destroy($id): JsonResponse
    {
        Gate::authorize('testimonio.eliminar');

        $this->testimonialService->delete($id);

        return response()->json([
            'success' => true,
            'message' => 'Testimonio eliminado satisfactoriamente',
        ], Response::HTTP_OK);
    }

    public function all(): JsonResponse
    {
        $result = $this->testimonialService->all();

        return response()->json([
            'success' => true,
            'data' => $result,
        ], Response::HTTP_OK);
    }
}