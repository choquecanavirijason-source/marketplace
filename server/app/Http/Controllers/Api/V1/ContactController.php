<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contact\StoreContactRequest;
use App\Http\Requests\Contact\UpdateContactRequest;
use App\Http\Requests\Pagination\PaginationRequest;
use App\Http\Resources\Contact\ContactCollection;
use App\Http\Resources\Contact\ContactResource;
use App\Services\ContactService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

class ContactController extends Controller
{
    public function __construct(private readonly ContactService $contactService)
    {
    }

    public function index(PaginationRequest $request): JsonResponse
    {
        Gate::authorize('contacto.ver');

        $result = $this->contactService->paginate($request->all());

        return (new ContactCollection($result))
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    public function store(StoreContactRequest $request): JsonResponse
    {
        Gate::authorize('contacto.crear');

        $contact = $this->contactService->create($request->validated());

        return (new ContactResource($contact))
            ->additional([
                'success' => true,
                'message' => 'Contacto Creado Satisfactoriamente',
            ])
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(UpdateContactRequest $request, $id)
    {
        Gate::authorize('contacto.editar');

        $contact = $this->contactService->update($id, $request->validated());

        return (new ContactResource($contact))
            ->additional([
                'success' => true,
                'message' => 'Contacto actualizado Satisfactoriamente'
            ])
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    public function destroy($id): JsonResponse
    {
        Gate::authorize('contacto.eliminar');

        $this->contactService->delete($id);

        return response()->json([
            'success' => true,
            'message' => 'Contacto Eliminado Satisfactoriamente'
        ])->setStatusCode(Response::HTTP_OK);
    }

    public function getContact($id = null): JsonResponse
    {
        $contact = $id ? $this->contactService->find($id) : $this->contactService->first();

        if (!$contact) {
            return response()->json([
                'success' => false,
                'message' => 'No hay información de contacto registrada',
            ], Response::HTTP_NOT_FOUND);
        }

        return (new ContactResource($contact))
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }

    public function all(): JsonResponse
    {
        $result = $this->contactService->all();

        return (ContactResource::collection($result))
            ->response()
            ->setStatusCode(Response::HTTP_OK);
    }
}