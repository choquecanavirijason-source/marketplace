<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Faq\StoreFaqRequest;
use App\Http\Requests\Faq\UpdateFaqRequest;
use App\Http\Requests\Pagination\PaginationRequest;
use App\Http\Resources\Faq\FaqCollection;
use App\Http\Resources\Faq\FaqResource;
use App\Services\FaqService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

class FaqController extends Controller
{
    public function __construct(private readonly FaqService $faqService)
    {
    }

    public function index(PaginationRequest $request): JsonResponse
    {
        Gate::authorize('pregunta_frecuente.ver');

        $result = $this->faqService->paginate($request->all());

        return (new FaqCollection($result))
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    public function store(StoreFaqRequest $request): JsonResponse
    {
        Gate::authorize('pregunta_frecuente.crear');

        $faq = $this->faqService->create($request->validated());

        return (new FaqResource($faq))
            ->additional([
                'success' => true,
                'message' => 'Preguntas frecuentes Creados Satisfactoriamente',
            ])
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(UpdateFaqRequest $request, $id)
    {
        Gate::authorize('pregunta_frecuente.editar');

        $faq = $this->faqService->update($id, $request->validated());

        return (new FaqResource($faq))
            ->additional([
                'success' => true,
                'message' => 'preguntas frecuentes actualizado Satisfactoriamente'
            ])
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    public function destroy($id): JsonResponse
    {
        Gate::authorize('pregunta_frecuente.eliminar');

        $this->faqService->delete($id);

        return response()->json([
            'success' => true,
            'message' => 'Preguntas frecuentes Eliminados Satisfactoriamente'
        ])->setStatusCode(Response::HTTP_OK);
    }

    public function all(): JsonResponse
    {
        $result = $this->faqService->all();

        return (FaqResource::collection($result))
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }
}