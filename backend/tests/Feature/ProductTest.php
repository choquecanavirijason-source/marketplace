<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_anyone_can_list_products(): void
    {
        Product::factory()->count(3)->create();

        $this->getJson('/api/v1/products')->assertOk()->assertJsonCount(3);
    }

    public function test_products_can_be_filtered_by_category(): void
    {
        $category = Category::factory()->create(['name' => 'Pinturas']);
        Product::factory()->create(['category_id' => $category->id]);
        Product::factory()->create();

        $response = $this->getJson('/api/v1/products?category=pinturas');

        $response->assertOk()->assertJsonCount(1);
    }

    public function test_a_customer_cannot_create_a_product(): void
    {
        $customer = User::factory()->create();
        $category = Category::factory()->create();

        $response = $this->actingAs($customer, 'sanctum')->postJson('/api/v1/products', [
            'category_id' => $category->id,
            'name' => 'Producto de prueba',
            'price' => 10,
            'image' => 'https://example.com/image.jpg',
        ]);

        $response->assertForbidden();
    }

    public function test_an_admin_can_create_a_product(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/products', [
            'category_id' => $category->id,
            'name' => 'Producto de prueba',
            'price' => 10,
            'image' => 'https://example.com/image.jpg',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('products', ['name' => 'Producto de prueba']);
    }
}
