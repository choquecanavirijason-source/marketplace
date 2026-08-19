<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public static array $categories = [
        ['name' => 'Herramientas Eléctricas', 'icon' => 'Zap', 'color' => '#fff8e1'],
        ['name' => 'Herramientas Manuales', 'icon' => 'Hammer', 'color' => '#efebe9'],
        ['name' => 'Pinturas', 'icon' => 'Paintbrush', 'color' => '#fce4ec'],
        ['name' => 'Plomería', 'icon' => 'Droplets', 'color' => '#e1f5fe'],
        ['name' => 'Electricidad', 'icon' => 'Lightbulb', 'color' => '#fffde7'],
        ['name' => 'Accesorios y Repuestos', 'icon' => 'Package', 'color' => '#f3e5f5'],
        ['name' => 'Calefacción', 'icon' => 'Flame', 'color' => '#fff3e0'],
        ['name' => 'Climatización', 'icon' => 'Snowflake', 'color' => '#e3f2fd'],
    ];

    public function run(): void
    {
        foreach (self::$categories as $category) {
            Category::updateOrCreate(
                ['slug' => Str::slug($category['name'])],
                $category
            );
        }
    }
}
