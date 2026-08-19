<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class CategoryService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        return Category::query()
            ->withCount('products')
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

    public function all(): Collection
    {
        return Category::withCount('products')->orderBy('name', 'asc')->get();
    }

    public function create(string $name): Category
    {
        return Category::create([
            'name' => $name,
            'slug' => Str::slug($name),
        ])->loadCount('products');
    }

    public function update(Category $category, string $name): Category
    {
        $category->update([
            'name' => $name,
            'slug' => Str::slug($name),
        ]);

        return $category->loadCount('products');
    }

    public function delete(Category $category): void
    {
        $category->delete();
    }
}