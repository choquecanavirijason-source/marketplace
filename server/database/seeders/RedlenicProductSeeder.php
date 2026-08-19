<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RedlenicProductSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->command->info('RedLénic: limpiando datos previos...');

        DB::table('cart_items')->delete();
        DB::table('reviews')->delete();
        DB::table('order_items')->delete();
        DB::table('orders')->delete();
        DB::table('products')->delete();
        DB::table('categories')->delete();

        $path = database_path('seeders/data/redlenic_products.json');
        $entries = json_decode(file_get_contents($path), true);

        if (!is_array($entries)) {
            $this->command->error("No se pudo decodificar el JSON en {$path}");

            return;
        }

        $categoryNames = [];
        foreach ($entries as $item) {
            $categoryNames[$this->normalizeText($item['category'])] = true;
        }

        $categoryIds = [];
        $usedSlugs = [];
        foreach (array_keys($categoryNames) as $name) {
            $slug = Str::slug($name);
            $base = $slug;
            $i = 1;
            while (in_array($slug, $usedSlugs, true)) {
                $slug = $base . '-' . (++$i);
            }
            $usedSlugs[] = $slug;
            $categoryIds[$name] = Category::create(['name' => $name, 'slug' => $slug])->id;
        }

        foreach ($entries as $item) {
            $name = $this->normalizeText($item['name']);
            $category = $this->normalizeText($item['category']);

            $images = [['url' => $item['image'], 'alt' => $name]];
            foreach ($item['additional_images'] ?? [] as $extra) {
                $images[] = ['url' => $this->absoluteUrl($extra), 'alt' => $name];
            }

            $details = [];
            if (!empty($item['quantity_per_package'])) {
                $details[] = 'Cantidad por paquete: ' . $item['quantity_per_package'];
            }

            $slug = Str::slug($name . '-' . $item['id']);
            if ($slug === '') {
                $slug = 'producto-' . $item['id'];
            }

            Product::create([
                'slug' => $slug,
                'name' => $name,
                'category_id' => $categoryIds[$category],
                'price' => number_format((float) $item['price'], 2, '.', ''),
                'original_price' => null,
                'tag' => !empty($item['is_new']) ? 'Nuevo' : null,
                'sku' => (string) $item['id'],
                'stock' => 10,
                'description' => $name,
                'long_description' => $name,
                'details' => $details,
                'sizes' => [],
                'colors' => [],
                'tags' => [],
                'images' => $images,
                'is_active' => true,
            ]);
        }

        $this->command->info('RedLénic: ' . count($categoryIds) . ' categorías y ' . count($entries) . ' productos sembrados.');
    }

    private function normalizeText(string $value): string
    {
        $value = trim($value);
        $value = strtr($value, [
            'Ã³' => 'ó',
            'Ã©' => 'é',
            'Ã¡' => 'á',
            'Ãº' => 'ú',
            'Ã±' => 'ñ',
            'Ã¼' => 'ü',
            'Ã¢' => 'â',
            'Ã´' => 'ô',
            'Ãª' => 'ê',
            'Ã¬' => 'ì',
            'Ã§' => 'ç',
            'Ã' => 'À',
            'Â' => '',
        ]);

        return trim($value);
    }

    private function absoluteUrl(string $url): string
    {
        $url = trim($url);
        if ($url === '' || str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return $url;
        }

        return 'https://www.redlenic.uno/' . ltrim($url, '/');
    }
}