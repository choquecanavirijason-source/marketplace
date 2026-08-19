<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Services\ReviewService;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(ReviewService $reviewService): void
    {
        $sampleReviews = [
            ['name' => 'Sarah M.', 'rating' => 5, 'text' => '¡Excelente producto! La calidad superó mis expectativas y funciona muy bien. Sin dudas vuelvo a comprar.', 'helpful' => 14],
            ['name' => 'James T.', 'rating' => 4, 'text' => 'Buen producto, llegó bien embalado y funciona perfecto. Cumple muy bien lo que promete.', 'helpful' => 7],
            ['name' => 'Priya K.', 'rating' => 5, 'text' => 'El mejor que compré en mucho tiempo. Se nota la diferencia en calidad comparado con otras marcas.', 'helpful' => 21],
        ];

        Product::query()->inRandomOrder()->limit(10)->get()->each(function (Product $product) use ($sampleReviews, $reviewService) {
            foreach ($sampleReviews as $review) {
                $reviewService->add($product, $review);
            }
        });
    }
}
