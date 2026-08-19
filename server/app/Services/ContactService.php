<?php

namespace App\Services;

use App\Models\Contact;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ContactService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        return Contact::query()
            ->search($filters['search'] ?? null)
            ->sort(
                $filters['sortBy']['sort'] ?? 'id',
                $filters['sortBy']['order'] ?? 'asc'
            )
            ->paginate(
                $filters['limit'] ?? 10,
                ['*'],
                'page',
                $filters['page'] ?? 1
            );
    }

    public function create(array $data): Contact
    {
        return Contact::create($data);
    }

    public function update(int $id, array $data): Contact
    {
        $contact = Contact::findOrFail($id);
        $contact->update($data);

        return $contact;
    }

    public function delete(int $id): void
    {
        Contact::findOrFail($id)->delete();
    }

    public function find(int $id): ?Contact
    {
        return Contact::find($id);
    }

    public function first(): ?Contact
    {
        return Contact::first();
    }

    public function all(): Collection
    {
        return Contact::all();
    }
}