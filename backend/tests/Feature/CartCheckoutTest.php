<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_add_a_product_to_the_cart_and_checkout(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['price' => 25, 'in_stock' => true]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/cart', ['product_id' => $product->id])
            ->assertOk()
            ->assertJsonCount(1);

        $checkout = $this->actingAs($user, 'sanctum')->postJson('/api/v1/orders');

        $checkout->assertOk()->assertJsonPath('total', 25.0);
        $this->assertDatabaseHas('orders', ['user_id' => $user->id, 'total' => 25]);
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_checkout_fails_when_cart_is_empty(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/orders')
            ->assertUnprocessable();
    }

    public function test_checkout_fails_when_a_product_is_out_of_stock(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['in_stock' => true]);

        $this->actingAs($user, 'sanctum')->postJson('/api/v1/cart', ['product_id' => $product->id]);

        $product->update(['in_stock' => false]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/orders')
            ->assertStatus(409);
    }
}
