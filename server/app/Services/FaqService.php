<?php

namespace App\Services;

use App\Models\Faq;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class FaqService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        return Faq::query()
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

    public function create(array $data): Faq
    {
        return Faq::create($data);
    }

    public function update(int $id, array $data): Faq
    {
        $faq = Faq::findOrFail($id);
        $faq->update($data);

        return $faq;
    }

    public function delete(int $id): void
    {
        Faq::findOrFail($id)->delete();
    }

    public function all(): Collection
    {
        return Faq::orderBy('order', 'asc')->get();
    }
}