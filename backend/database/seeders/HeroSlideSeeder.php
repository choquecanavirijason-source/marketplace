<?php

namespace Database\Seeders;

use App\Models\HeroSlide;
use Illuminate\Database\Seeder;

class HeroSlideSeeder extends Seeder
{
    public function run(): void
    {
        $slides = [
            [
                'title' => "Todo para\ntu Obra",
                'subtitle' => 'Herramientas Eléctricas',
                'desc' => 'Hasta 30% off en taladros, amoladoras y atornilladores esta semana. Entrega rápida a todo el país.',
                'cta' => 'Ver Herramientas',
                'bg' => 'from-orange-50 to-amber-100',
                'accent' => '#e65100',
                'image' => 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=700&h=500&fit=crop&auto=format',
                'sort_order' => 1,
            ],
            [
                'title' => "Pinturas y\nTerminaciones",
                'subtitle' => 'Renová tus Ambientes',
                'desc' => 'Látex, esmaltes y todos los accesorios para pintar como un profesional, al mejor precio.',
                'cta' => 'Ver Pinturas',
                'bg' => 'from-pink-50 to-rose-100',
                'accent' => '#ad1457',
                'image' => 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=700&h=500&fit=crop&auto=format',
                'sort_order' => 2,
            ],
            [
                'title' => "Calor para\ntu Hogar",
                'subtitle' => 'Calefacción',
                'desc' => 'Calefactores, radiadores y estufas para pasar el invierno sin frío. Envío rápido a todo el país.',
                'cta' => 'Ver Calefacción',
                'bg' => 'from-teal-50 to-cyan-100',
                'accent' => '#00695c',
                'image' => 'https://images.unsplash.com/photo-1622308023558-2130696ec5cd?w=700&h=500&fit=crop&auto=format',
                'sort_order' => 3,
            ],
        ];

        foreach ($slides as $slide) {
            HeroSlide::updateOrCreate(['title' => $slide['title']], $slide);
        }
    }
}
