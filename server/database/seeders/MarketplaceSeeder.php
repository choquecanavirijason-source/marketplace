<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Contact;
use App\Models\Faq;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
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
        $this->seedCategoriesAndProducts();
        $this->seedOrders();
        $this->seedReviews();
        $this->seedTestimonials();
        $this->seedContact();
        $this->seedFaqs();

        $this->command->info('FerroMax marketplace data seeded successfully!');
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

    private function seedCategoriesAndProducts(): void
    {
        $categories = [
            ['name' => 'Herramientas Eléctricas', 'slug' => 'herramientas-electricas'],
            ['name' => 'Herramientas Manuales', 'slug' => 'herramientas-manuales'],
            ['name' => 'Pinturas', 'slug' => 'pinturas'],
            ['name' => 'Plomería', 'slug' => 'plomeria'],
            ['name' => 'Electricidad', 'slug' => 'electricidad'],
            ['name' => 'Accesorios y Repuestos', 'slug' => 'accesorios-y-repuestos'],
            ['name' => 'Calefacción', 'slug' => 'calefaccion'],
            ['name' => 'Climatización', 'slug' => 'climatizacion'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['slug' => $category['slug']], ['name' => $category['name']]);
        }

        $categoryBySlug = Category::pluck('id', 'slug');

        $products = [
            // Herramientas Eléctricas
            [
                'slug' => 'taladro-percutor-electrico-750w',
                'name' => 'Taladro Percutor Eléctrico 750W',
                'category_slug' => 'herramientas-electricas',
                'price' => '79.99',
                'original_price' => '99.99',
                'tag' => 'Oferta',
                'sku' => 'HEL-001',
                'stock' => 25,
                'weight' => '2.1kg',
                'warranty' => '12 meses de garantía del fabricante',
                'tags' => ['taladro', 'percutor', 'eléctrico', 'mampostería'],
                'description' => 'Taladro percutor de 750W con mandril de 13mm, dos velocidades y función de percusión para mampostería. Incluye maletín y set básico de brocas.',
                'long_description' => 'Taladro percutor de 750W con mandril de 13mm, dos velocidades y función de percusión para mampostería. Incluye maletín y set básico de brocas. Ideal para trabajos de construcción, instalaciones y bricolaje en casa.',
                'details' => ['Mandril de 13mm', 'Dos velocidades', 'Función de percusión', 'Incluye maletín y brocas'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=600&fit=crop&auto=format', 'alt' => 'Taladro percutor eléctrico']],
            ],
            [
                'slug' => 'amoladora-angular-115mm-850w',
                'name' => 'Amoladora Angular 115mm 850W',
                'category_slug' => 'herramientas-electricas',
                'price' => '54.99',
                'tag' => null,
                'sku' => 'HEL-002',
                'stock' => 30,
                'weight' => '1.9kg',
                'warranty' => '12 meses de garantía del fabricante',
                'tags' => ['amoladora', 'angular', 'corte', 'desbaste'],
                'description' => 'Amoladora angular de 850W para disco de 115mm, con protector de seguridad ajustable y empuñadura antivibración. Ideal para corte y desbaste de metal.',
                'long_description' => 'Amoladora angular de 850W para disco de 115mm, con protector de seguridad ajustable y empuñadura antivibración. Ideal para corte y desbaste de metal, cerámica y hormigón.',
                'details' => ['Disco de 115mm', 'Protector ajustable', 'Empuñadura antivibración'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1502343019212-cc6a09783255?w=600&h=600&fit=crop&auto=format', 'alt' => 'Amoladora angular']],
            ],
            [
                'slug' => 'sierra-circular-1200w',
                'name' => 'Sierra Circular 1200W',
                'category_slug' => 'herramientas-electricas',
                'price' => '89.99',
                'original_price' => '109.99',
                'tag' => 'Nuevo',
                'sku' => 'HEL-003',
                'stock' => 15,
                'weight' => '3.4kg',
                'warranty' => '12 meses de garantía del fabricante',
                'tags' => ['sierra', 'circular', 'corte', 'madera'],
                'description' => 'Sierra circular de 1200W con disco de 185mm, guía láser y ajuste de profundidad e inclinación. Corte limpio y preciso en madera y derivados.',
                'long_description' => 'Sierra circular de 1200W con disco de 185mm, guía láser y ajuste de profundidad e inclinación. Corte limpio y preciso en madera y derivados para proyectos de carpintería y construcción.',
                'details' => ['Guía láser', 'Ajuste de profundidad', 'Ajuste de inclinación'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1505855796860-aa05646cbf1f?w=600&h=600&fit=crop&auto=format', 'alt' => 'Sierra circular']],
            ],
            [
                'slug' => 'atornillador-inalambrico-20v',
                'name' => 'Atornillador Inalámbrico 20V',
                'category_slug' => 'herramientas-electricas',
                'price' => '64.99',
                'tag' => 'Popular',
                'sku' => 'HEL-004',
                'stock' => 20,
                'weight' => '1.2kg',
                'warranty' => '18 meses de garantía del fabricante',
                'tags' => ['atornillador', 'inalámbrico', 'batería', '20v'],
                'description' => 'Atornillador/taladro inalámbrico de 20V con batería de litio, cargador rápido y 20 posiciones de torque. Incluye maletín y puntas surtidas.',
                'long_description' => 'Atornillador/taladro inalámbrico de 20V con batería de litio, cargador rápido y 20 posiciones de torque. Incluye maletín y puntas surtidas para todo tipo de ensamblajes.',
                'details' => ['Batería de litio 20V', 'Cargador rápido', '20 posiciones de torque', 'Incluye maletín'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1596496182209-5193de4ed72d?w=600&h=600&fit=crop&auto=format', 'alt' => 'Atornillador inalámbrico']],
            ],
            // Herramientas Manuales
            [
                'slug' => 'set-destornilladores-profesional-6-piezas',
                'name' => 'Set de Destornilladores Profesional 6 Piezas',
                'category_slug' => 'herramientas-manuales',
                'price' => '18.99',
                'original_price' => '26.99',
                'tag' => 'Oferta',
                'sku' => 'HMA-001',
                'stock' => 40,
                'weight' => '500g',
                'warranty' => '24 meses de garantía del fabricante',
                'tags' => ['destornillador', 'set', 'plano', 'phillips'],
                'description' => 'Set de 6 destornilladores profesionales con puntas plana y Phillips en distintas medidas, mango ergonómico bimaterial y punta magnetizada.',
                'long_description' => 'Set de 6 destornilladores profesionales con puntas plana y Phillips en distintas medidas, mango ergonómico bimaterial y punta magnetizada.',
                'details' => ['6 piezas', 'Puntas magnetizadas', 'Mango ergonómico'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&h=600&fit=crop&auto=format', 'alt' => 'Set de destornilladores']],
            ],
            [
                'slug' => 'martillo-de-carpintero-16oz',
                'name' => 'Martillo de Carpintero 16oz',
                'category_slug' => 'herramientas-manuales',
                'price' => '14.99',
                'tag' => null,
                'sku' => 'HMA-002',
                'stock' => 35,
                'weight' => '650g',
                'warranty' => '12 meses de garantía del fabricante',
                'tags' => ['martillo', 'carpintero', '16oz', 'mango fibra'],
                'description' => 'Martillo de carpintero de 16oz con cabeza de acero forjado y mango de fibra de vidrio antivibración. Uña para extracción de clavos.',
                'long_description' => 'Martillo de carpintero de 16oz con cabeza de acero forjado y mango de fibra de vidrio antivibración. Uña para extracción de clavos.',
                'details' => ['Acero forjado', 'Mango antivibración', 'Uña extractora'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1571505280193-4b4e29712a77?w=600&h=600&fit=crop&auto=format', 'alt' => 'Martillo de carpintero']],
            ],
            [
                'slug' => 'cinta-metrica-5m',
                'name' => 'Cinta Métrica 5m',
                'category_slug' => 'herramientas-manuales',
                'price' => '8.99',
                'tag' => null,
                'sku' => 'HMA-003',
                'stock' => 60,
                'weight' => '200g',
                'warranty' => '12 meses de garantía del fabricante',
                'tags' => ['cinta métrica', 'medición', '5 metros'],
                'description' => 'Cinta métrica de 5 metros con carcasa antigolpe, traba automática y cinta reforzada con recubrimiento resistente al desgaste.',
                'long_description' => 'Cinta métrica de 5 metros con carcasa antigolpe, traba automática y cinta reforzada con recubrimiento resistente al desgaste.',
                'details' => ['Carcasa antigolpe', 'Traba automática', '5 metros'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1633009824205-51c01df4b577?w=600&h=600&fit=crop&auto=format', 'alt' => 'Cinta métrica']],
            ],
            [
                'slug' => 'alicate-universal-8',
                'name' => 'Alicate Universal 8"',
                'category_slug' => 'herramientas-manuales',
                'price' => '11.99',
                'original_price' => '16.99',
                'tag' => 'Oferta',
                'sku' => 'HMA-004',
                'stock' => 45,
                'weight' => '350g',
                'warranty' => '12 meses de garantía del fabricante',
                'tags' => ['alicate', 'universal', 'pinza', '8 pulgadas'],
                'description' => 'Alicate universal de 8 pulgadas con mordazas templadas, corte para cable y mangos ergonómicos antideslizantes.',
                'long_description' => 'Alicate universal de 8 pulgadas con mordazas templadas, corte para cable y mangos ergonómicos antideslizantes.',
                'details' => ['Mordazas templadas', 'Corte para cable', 'Mango antideslizante'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1645449781249-27c94448f6f7?w=600&h=600&fit=crop&auto=format', 'alt' => 'Alicate universal']],
            ],
            // Pinturas
            [
                'slug' => 'pintura-latex-interior-20l-blanco',
                'name' => 'Pintura Látex Interior 20L Blanco',
                'category_slug' => 'pinturas',
                'price' => '64.99',
                'tag' => null,
                'sku' => 'PIN-001',
                'stock' => 18,
                'weight' => '22kg',
                'warranty' => 'Vida útil 24 meses sin abrir',
                'tags' => ['pintura', 'látex', 'interior', 'blanco'],
                'description' => 'Pintura látex para interiores, alto poder cubritivo y secado rápido. Balde de 20 litros, rendimiento aproximado de 40m² por mano.',
                'long_description' => 'Pintura látex para interiores, alto poder cubritivo y secado rápido. Balde de 20 litros, rendimiento aproximado de 40m² por mano.',
                'details' => ['20 litros', 'Alto poder cubritivo', 'Rendimiento 40m² por mano'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1550002233-59d811d29b95?w=600&h=600&fit=crop&auto=format', 'alt' => 'Pintura látex']],
            ],
            [
                'slug' => 'esmalte-sintetico-brillante-4l',
                'name' => 'Esmalte Sintético Brillante 4L',
                'category_slug' => 'pinturas',
                'price' => '32.99',
                'original_price' => '42.99',
                'tag' => 'Oferta',
                'sku' => 'PIN-002',
                'stock' => 22,
                'weight' => '4.5kg',
                'warranty' => 'Vida útil 24 meses sin abrir',
                'tags' => ['esmalte', 'sintético', 'brillante', 'madera y metal'],
                'description' => 'Esmalte sintético brillante de 4 litros, ideal para madera y metal. Alta resistencia a la intemperie y terminación brillante duradera.',
                'long_description' => 'Esmalte sintético brillante de 4 litros, ideal para madera y metal. Alta resistencia a la intemperie y terminación brillante duradera.',
                'details' => ['4 litros', 'Resistente a la intemperie', 'Terminación brillante'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1670940094923-6f75e4dc5c3a?w=600&h=600&fit=crop&auto=format', 'alt' => 'Esmalte sintético']],
            ],
            [
                'slug' => 'rodillo-y-bandeja-para-pintar-kit',
                'name' => 'Rodillo y Bandeja para Pintar Kit',
                'category_slug' => 'pinturas',
                'price' => '12.99',
                'tag' => null,
                'sku' => 'PIN-003',
                'stock' => 50,
                'weight' => '600g',
                'warranty' => '6 meses de garantía del fabricante',
                'tags' => ['rodillo', 'bandeja', 'kit', 'pintar'],
                'description' => 'Kit de rodillo antigota con mango extensible y bandeja plástica. Ideal para pintar paredes y techos de forma pareja y rápida.',
                'long_description' => 'Kit de rodillo antigota con mango extensible y bandeja plástica. Ideal para pintar paredes y techos de forma pareja y rápida.',
                'details' => ['Rodillo antigota', 'Mango extensible', 'Bandeja plástica'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=600&h=600&fit=crop&auto=format', 'alt' => 'Kit de rodillo']],
            ],
            // Plomería
            [
                'slug' => 'cano-pvc-3-4-x-3m',
                'name' => 'Caño de PVC 3/4" x 3m',
                'category_slug' => 'plomeria',
                'price' => '7.99',
                'tag' => null,
                'sku' => 'PLO-001',
                'stock' => 80,
                'weight' => '1.1kg',
                'warranty' => '12 meses de garantía del fabricante',
                'tags' => ['caño', 'pvc', 'plomería', '3/4 pulgada'],
                'description' => 'Caño de PVC de 3/4 pulgada x 3 metros para instalaciones de agua fría. Alta resistencia a la presión y fácil de cortar y unir.',
                'long_description' => 'Caño de PVC de 3/4 pulgada x 3 metros para instalaciones de agua fría. Alta resistencia a la presión y fácil de cortar y unir.',
                'details' => ['3 metros', 'Alta resistencia', 'Fácil instalación'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1599082642130-d7fc84cddb44?w=600&h=600&fit=crop&auto=format', 'alt' => 'Caño de PVC']],
            ],
            [
                'slug' => 'llave-de-paso-esferica-1-2',
                'name' => 'Llave de Paso Esférica 1/2"',
                'category_slug' => 'plomeria',
                'price' => '9.99',
                'tag' => null,
                'sku' => 'PLO-002',
                'stock' => 55,
                'weight' => '300g',
                'warranty' => '12 meses de garantía del fabricante',
                'tags' => ['llave de paso', 'esférica', '1/2 pulgada'],
                'description' => 'Llave de paso esférica de 1/2 pulgada en bronce, ideal para corte de suministro de agua en instalaciones domiciliarias.',
                'long_description' => 'Llave de paso esférica de 1/2 pulgada en bronce, ideal para corte de suministro de agua en instalaciones domiciliarias.',
                'details' => ['Bronce', '1/2 pulgada', 'Corte de suministro'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1669920282672-4e81ba388788?w=600&h=600&fit=crop&auto=format', 'alt' => 'Llave de paso']],
            ],
            [
                'slug' => 'sifon-flexible-para-pileta',
                'name' => 'Sifón Flexible para Pileta',
                'category_slug' => 'plomeria',
                'price' => '11.99',
                'tag' => null,
                'sku' => 'PLO-003',
                'stock' => 48,
                'weight' => '400g',
                'warranty' => '6 meses de garantía del fabricante',
                'tags' => ['sifón', 'flexible', 'pileta', 'desagüe'],
                'description' => 'Sifón flexible universal para pileta de cocina o baño, fácil instalación sin herramientas especiales.',
                'long_description' => 'Sifón flexible universal para pileta de cocina o baño, fácil instalación sin herramientas especiales.',
                'details' => ['Universal', 'Fácil instalación'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1599082642130-d7fc84cddb44?w=600&h=600&fit=crop&auto=format', 'alt' => 'Sifón flexible']],
            ],
            // Electricidad
            [
                'slug' => 'cable-unipolar-2-5mm-x-100m',
                'name' => 'Cable Unipolar 2.5mm x 100m',
                'category_slug' => 'electricidad',
                'price' => '54.99',
                'tag' => null,
                'sku' => 'ELC-001',
                'stock' => 30,
                'weight' => '3.2kg',
                'warranty' => '12 meses de garantía del fabricante',
                'tags' => ['cable', 'unipolar', '2.5mm', 'electricidad'],
                'description' => 'Rollo de cable unipolar de 2.5mm x 100 metros, normalizado para instalaciones domiciliarias de tomacorrientes.',
                'long_description' => 'Rollo de cable unipolar de 2.5mm x 100 metros, normalizado para instalaciones domiciliarias de tomacorrientes.',
                'details' => ['100 metros', '2.5mm', 'Normalizado'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1597766370173-a14200ec0b42?w=600&h=600&fit=crop&auto=format', 'alt' => 'Cable unipolar']],
            ],
            [
                'slug' => 'llave-termica-disyuntor-25a',
                'name' => 'Llave Térmica Disyuntor 25A',
                'category_slug' => 'electricidad',
                'price' => '14.99',
                'original_price' => '19.99',
                'tag' => 'Oferta',
                'sku' => 'ELC-002',
                'stock' => 70,
                'weight' => '150g',
                'warranty' => '24 meses de garantía del fabricante',
                'tags' => ['llave térmica', 'disyuntor', '25a', 'tablero'],
                'description' => 'Llave térmica de 25A para tablero eléctrico, protección contra sobrecargas y cortocircuitos en instalaciones domiciliarias.',
                'long_description' => 'Llave térmica de 25A para tablero eléctrico, protección contra sobrecargas y cortocircuitos en instalaciones domiciliarias.',
                'details' => ['25A', 'Protección de sobrecargas'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1521905219644-65e6d65124cf?w=600&h=600&fit=crop&auto=format', 'alt' => 'Llave térmica']],
            ],
            [
                'slug' => 'lampara-led-12w-rosca-e27',
                'name' => 'Lámpara LED 12W Rosca E27',
                'category_slug' => 'electricidad',
                'price' => '3.99',
                'tag' => 'Popular',
                'sku' => 'ELC-004',
                'stock' => 120,
                'weight' => '80g',
                'warranty' => '12 meses de garantía del fabricante',
                'tags' => ['lámpara', 'led', '12w', 'rosca e27'],
                'description' => 'Lámpara LED de 12W con rosca E27, luz cálida, bajo consumo y vida útil de hasta 25.000 horas.',
                'long_description' => 'Lámpara LED de 12W con rosca E27, luz cálida, bajo consumo y vida útil de hasta 25.000 horas.',
                'details' => ['12W', 'Luz cálida', '25.000 horas'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1481127303226-3f47f8af862d?w=600&h=600&fit=crop&auto=format', 'alt' => 'Lámpara LED']],
            ],
            // Accesorios y Repuestos
            [
                'slug' => 'caja-de-herramientas-3-gavetas',
                'name' => 'Caja de Herramientas 3 Gavetas',
                'category_slug' => 'accesorios-y-repuestos',
                'price' => '39.99',
                'original_price' => '49.99',
                'tag' => 'Oferta',
                'sku' => 'ACC-001',
                'stock' => 16,
                'weight' => '2.8kg',
                'warranty' => '12 meses de garantía del fabricante',
                'tags' => ['caja', 'herramientas', 'gavetas', 'organizador'],
                'description' => 'Caja de herramientas con 3 gavetas, bandeja superior desmontable y candado de seguridad. Organiza y transporta tus herramientas con facilidad.',
                'long_description' => 'Caja de herramientas con 3 gavetas, bandeja superior desmontable y candado de seguridad. Organiza y transporta tus herramientas con facilidad.',
                'details' => ['3 gavetas', 'Bandeja desmontable', 'Candado de seguridad'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=600&h=600&fit=crop&auto=format', 'alt' => 'Caja de herramientas']],
            ],
            // Calefacción
            [
                'slug' => 'calefactor-electrico-2000w',
                'name' => 'Calefactor Eléctrico 2000W',
                'category_slug' => 'calefaccion',
                'price' => '74.99',
                'original_price' => '89.99',
                'tag' => 'Nuevo',
                'sku' => 'CAL-001',
                'stock' => 12,
                'weight' => '3.1kg',
                'warranty' => '18 meses de garantía del fabricante',
                'tags' => ['calefactor', 'eléctrico', '2000w', 'hogar'],
                'description' => 'Calefactor eléctrico de 2000W con termostato ajustable, protección contra sobrecalentamiento y 3 niveles de potencia.',
                'long_description' => 'Calefactor eléctrico de 2000W con termostato ajustable, protección contra sobrecalentamiento y 3 niveles de potencia. Calienta ambientes de hasta 25m² de forma rápida y segura.',
                'details' => ['2000W', 'Termostato ajustable', 'Protección anti-vuelco'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1607201076154-6f8b247ed4d2?w=600&h=600&fit=crop&auto=format', 'alt' => 'Calefactor eléctrico']],
            ],
            // Climatización
            [
                'slug' => 'ventilador-de-pie-16-pulgadas',
                'name' => 'Ventilador de Pie 16 Pulgadas',
                'category_slug' => 'climatizacion',
                'price' => '44.99',
                'tag' => null,
                'sku' => 'CLI-001',
                'stock' => 14,
                'weight' => '4.2kg',
                'warranty' => '12 meses de garantía del fabricante',
                'tags' => ['ventilador', 'pie', '16 pulgadas', 'oscilación'],
                'description' => 'Ventilador de pie de 16 pulgadas con oscilación, 3 velocidades y control de altura. Frescura inmediata para tu hogar u oficina.',
                'long_description' => 'Ventilador de pie de 16 pulgadas con oscilación, 3 velocidades y control de altura. Frescura inmediata para tu hogar u oficina.',
                'details' => ['16 pulgadas', 'Oscilación', '3 velocidades'],
                'images' => [['url' => 'https://images.unsplash.com/photo-1607201076154-6f8b247ed4d2?w=600&h=600&fit=crop&auto=format', 'alt' => 'Ventilador de pie']],
            ],
        ];

        foreach ($products as $product) {
            $categoryId = $categoryBySlug[$product['category_slug']] ?? null;
            if (!$categoryId) {
                continue;
            }

            unset($product['category_slug']);

            Product::updateOrCreate(
                ['slug' => $product['slug']],
                array_merge($product, ['category_id' => $categoryId])
            );
        }
    }

    private function seedOrders(): void
    {
        $products = Product::pluck('id', 'slug');
        $users = User::role('cliente')->pluck('id', 'email');

        $orders = [
            [
                'user' => 'cliente@ferromax.com',
                'status' => Order::STATUS_DELIVERED,
                'shipping_address' => 'Av. Heroínas 123, Cochabamba',
                'items' => [
                    ['product' => 'taladro-percutor-electrico-750w', 'quantity' => 1],
                    ['product' => 'cinta-metrica-5m', 'quantity' => 2],
                ],
                'created_at' => now()->subDays(18),
            ],
            [
                'user' => 'maria.lopez@ferromax.com',
                'status' => Order::STATUS_SHIPPED,
                'shipping_address' => 'Calle 25 de Mayo 456, La Paz',
                'items' => [
                    ['product' => 'pintura-latex-interior-20l-blanco', 'quantity' => 1],
                    ['product' => 'rodillo-y-bandeja-para-pintar-kit', 'quantity' => 1],
                ],
                'created_at' => now()->subDays(6),
            ],
            [
                'user' => 'cliente@ferromax.com',
                'status' => Order::STATUS_CONFIRMED,
                'shipping_address' => 'Av. Heroínas 123, Cochabamba',
                'items' => [
                    ['product' => 'atornillador-inalambrico-20v', 'quantity' => 1],
                    ['product' => 'alicate-universal-8', 'quantity' => 1],
                ],
                'created_at' => now()->subDays(3),
            ],
            [
                'user' => 'carlos.ruiz@ferromax.com',
                'status' => Order::STATUS_PENDING,
                'shipping_address' => 'Av. Banzer 789, Santa Cruz',
                'items' => [
                    ['product' => 'calefactor-electrico-2000w', 'quantity' => 2],
                ],
                'created_at' => now()->subHours(5),
            ],
            [
                'user' => 'cliente@ferromax.com',
                'status' => Order::STATUS_CANCELLED,
                'shipping_address' => 'Av. Heroínas 123, Cochabamba',
                'items' => [
                    ['product' => 'esmalte-sintetico-brillante-4l', 'quantity' => 1],
                ],
                'created_at' => now()->subDays(10),
            ],
        ];

        foreach ($orders as $orderData) {
            $userId = $users[$orderData['user']] ?? null;
            if (!$userId) {
                continue;
            }

            $subtotal = 0;
            $items = [];

            foreach ($orderData['items'] as $item) {
                $productId = $products[$item['product']] ?? null;
                if (!$productId) {
                    continue;
                }

                $product = Product::find($productId);
                $lineTotal = round($product->price_value * $item['quantity'], 2);
                $subtotal += $lineTotal;

                $items[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_price' => round($product->price_value, 2),
                    'product_image' => collect($product->images ?? [])->first()['url'] ?? null,
                    'quantity' => $item['quantity'],
                    'subtotal' => $lineTotal,
                ];
            }

            if (empty($items)) {
                continue;
            }

            $shipping = $subtotal >= 50 ? 0 : 5;

            $order = Order::firstOrCreate(
                ['order_number' => 'FM-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6))],
                [
                    'user_id' => $userId,
                    'status' => $orderData['status'],
                    'subtotal' => round($subtotal, 2),
                    'shipping' => $shipping,
                    'total' => round($subtotal + $shipping, 2),
                    'shipping_address' => $orderData['shipping_address'],
                    'created_at' => $orderData['created_at'],
                ]
            );

            foreach ($items as $item) {
                $order->items()->firstOrCreate(
                    ['product_id' => $item['product_id']],
                    $item
                );
            }
        }
    }

    private function seedReviews(): void
    {
        $products = Product::pluck('id', 'slug');
        $users = User::role('cliente')->pluck('id', 'email');

        $reviews = [
            [
                'user' => 'cliente@ferromax.com',
                'product' => 'taladro-percutor-electrico-750w',
                'rating' => 5,
                'comment' => 'Excelente taladro, potente y con buen acabado. Lo uso para trabajos en casa y no defrauda.',
            ],
            [
                'user' => 'cliente@ferromax.com',
                'product' => 'atornillador-inalambrico-20v',
                'rating' => 5,
                'comment' => 'Muy cómodo y con buena duración de batería. Ideal para muebles y ensamblajes.',
            ],
            [
                'user' => 'maria.lopez@ferromax.com',
                'product' => 'pintura-latex-interior-20l-blanco',
                'rating' => 4,
                'comment' => 'Buen poder cubritivo, el rendimiento fue un poco menor al indicado pero el resultado es muy bueno.',
            ],
            [
                'user' => 'maria.lopez@ferromax.com',
                'product' => 'rodillo-y-bandeja-para-pintar-kit',
                'rating' => 5,
                'comment' => 'El rodillo deja un acabado parejo y la bandeja es resistente. Muy buena relación calidad-precio.',
            ],
            [
                'user' => 'carlos.ruiz@ferromax.com',
                'product' => 'calefactor-electrico-2000w',
                'rating' => 5,
                'comment' => 'Calienta rápido el ambiente y es silencioso. La protección antivuelco da mucha tranquilidad.',
            ],
            [
                'user' => 'jose.garcia@ferromax.com',
                'product' => 'cinta-metrica-5m',
                'rating' => 4,
                'comment' => 'Buena cinta, resistente y con traba automática que funciona muy bien.',
            ],
        ];

        foreach ($reviews as $review) {
            $productId = $products[$review['product']] ?? null;
            $userId = $users[$review['user']] ?? null;
            if (!$productId || !$userId) {
                continue;
            }

            Review::firstOrCreate(
                [
                    'product_id' => $productId,
                    'user_id' => $userId,
                ],
                [
                    'rating' => $review['rating'],
                    'comment' => $review['comment'],
                    'is_approved' => true,
                ]
            );
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