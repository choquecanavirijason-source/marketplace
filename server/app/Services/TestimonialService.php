<?php

namespace App\Services;

use App\Models\Testimonial;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class TestimonialService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        return Testimonial::query()
            ->search($filters['search'] ?? null)
            ->sort(
                $filters['sortBy']['sort'] ?? 'id',
                $filters['sortBy']['order'] ?? 'desc'
            )
            ->paginate(
                $filters['limit'] ?? 10,
                ['*'],
                'page',
                $filters['page'] ?? 1
            );
    }

    public function create(array $data): Testimonial
    {
        return Testimonial::create([
            'quote' => $data['quote'],
            'author' => $data['author'],
            'rating' => $data['rating'] ?? 5,
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);
    }

    public function show(int $id): Testimonial
    {
        return Testimonial::findOrFail($id);
    }

    public function update(int $id, array $data): Testimonial
    {
        $testimonial = Testimonial::findOrFail($id);
        $testimonial->update([
            'quote' => $data['quote'],
            'author' => $data['author'],
            'rating' => $data['rating'] ?? $testimonial->rating,
            'is_active' => (bool) ($data['is_active'] ?? $testimonial->is_active),
        ]);

        return $testimonial;
    }

    public function delete(int $id): void
    {
        Testimonial::findOrFail($id)->delete();
    }

    public function all(): Collection
    {
        return Testimonial::where('is_active', true)
            ->orderBy('id', 'desc')
            ->get();
    }
}