<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        $price = fake()->randomFloat(2, 5, 500);

        return [
            'category_id' => Category::factory(),
            'name' => ucfirst(fake()->words(3, true)),
            'description' => fake()->paragraph(),
            'price' => $price,
            'original_price' => fake()->boolean(30) ? $price + fake()->randomFloat(2, 5, 50) : null,
            'image' => fake()->imageUrl(600, 600, 'tools'),
            'images' => [fake()->imageUrl(600, 600, 'tools')],
            'badge' => fake()->boolean(20) ? fake()->randomElement(['Nuevo', 'Oferta', 'Popular']) : null,
            'weight' => fake()->randomFloat(1, 0.1, 30).'kg',
            'in_stock' => fake()->boolean(90),
            'sku' => strtoupper(fake()->unique()->bothify('SKU-####')),
            'tags' => fake()->words(3),
            'warranty' => '12 meses de garantía del fabricante',
            'rating' => fake()->randomFloat(1, 3.5, 5),
            'reviews_count' => fake()->numberBetween(0, 300),
        ];
    }
}
