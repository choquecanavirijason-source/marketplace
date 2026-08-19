<?php

namespace Database\Seeders;

use App\Models\Contact;
use App\Models\Faq;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class MarketplaceSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $this->seedRoles();
        $this->seedUsers();
        $this->seedTestimonials();
        $this->seedContact();
        $this->seedFaqs();

        $this->command->info('Marketplace content seeded successfully!');
    }

    private function seedRoles(): void
    {
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);
        Role::firstOrCreate(['name' => 'cliente', 'guard_name' => 'api']);
    }

    private function seedUsers(): void
    {
        $users = [
            [
                'name' => 'Cliente Demo',
                'email' => 'cliente@ferromax.com',
                'mobile_number' => '71234567',
                'address' => 'Av. Heroínas 123, Cochabamba',
            ],
            [
                'name' => 'María López',
                'email' => 'maria.lopez@ferromax.com',
                'mobile_number' => '72345678',
                'address' => 'Calle 25 de Mayo 456, La Paz',
            ],
            [
                'name' => 'Carlos Ruiz',
                'email' => 'carlos.ruiz@ferromax.com',
                'mobile_number' => '73456789',
                'address' => 'Av. Banzer 789, Santa Cruz',
            ],
            [
                'name' => 'José García',
                'email' => 'jose.garcia@ferromax.com',
                'mobile_number' => '74567890',
                'address' => 'Calle Junín 321, Sucre',
            ],
        ];

        foreach ($users as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'first_name' => Str::before($data['name'], ' '),
                    'last_name' => Str::after($data['name'], ' '),
                    'password' => Hash::make('password'),
                    'mobile_number' => $data['mobile_number'],
                    'address' => $data['address'],
                    'email_verified_at' => now(),
                ]
            );
            $user->syncRoles('cliente');
        }
    }

    private function seedTestimonials(): void
    {
        $testimonials = [
            [
                'quote' => 'Compré el taladro y la amoladora y llegaron en tiempo récord. La calidad supera mis expectativas.',
                'author' => 'Carlos, constructor',
                'rating' => 5,
                'is_active' => true,
            ],
            [
                'quote' => 'La atención es excelente y los precios son los mejores de la ciudad. Totalmente recomendados.',
                'author' => 'María, arquitecta',
                'rating' => 5,
                'is_active' => true,
            ],
            [
                'quote' => 'El calefactor que compré funciona perfecto. Gracias por el asesoramiento en la elección.',
                'author' => 'José, cliente frecuente',
                'rating' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($testimonials as $testimonial) {
            Testimonial::firstOrCreate(
                ['author' => $testimonial['author']],
                $testimonial
            );
        }
    }

    private function seedContact(): void
    {
        Contact::updateOrCreate(
            ['address' => 'Av. Heroínas 123, Cochabamba, Bolivia'],
            [
                'mobile_number' => '+591 71234567',
                'phone_number' => '+591 71234567',
                'email' => 'hola@ferromax.com',
                'business_hours' => 'Lunes a Sábado: 8:00 - 19:00',
                'facebook_url' => 'https://facebook.com/ferromax.bolivia',
                'instagram_url' => 'https://instagram.com/ferromax.bolivia',
                'tiktok_url' => 'https://tiktok.com/@ferromax.bolivia',
                'youtube_url' => null,
                'whatsapp_url' => 'https://wa.me/59171234567',
            ]
        );
    }

    private function seedFaqs(): void
    {
        $faqs = [
            [
                'question' => '¿Cuánto tardan los envíos?',
                'answer' => 'Los envíos se realizan en 2-4 días hábiles a todo el país. Recibirás un número de seguimiento para que puedas rastrear tu pedido. El envío es gratis en compras superiores a $50.',
                'order' => 1,
            ],
            [
                'question' => '¿Cómo hago una devolución?',
                'answer' => 'Tenés 30 días para devolver cualquier producto en su estado original. Escribinos por WhatsApp y coordinamos el retiro sin costo.',
                'order' => 2,
            ],
            [
                'question' => '¿Qué garantía tienen los productos?',
                'answer' => 'Todos nuestros productos tienen garantía del fabricante, entre 6 y 24 meses según el artículo. La garantía se detalla en cada ficha de producto.',
                'order' => 3,
            ],
            [
                'question' => '¿Tienen tienda física?',
                'answer' => 'Sí, tenemos una sucursal en Av. Heroínas 123, Cochabamba, con atención de lunes a sábado de 8:00 a 19:00.',
                'order' => 4,
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::firstOrCreate(
                ['question' => $faq['question']],
                $faq
            );
        }
    }
}