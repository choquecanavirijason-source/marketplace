<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\Exceptions\BusinessException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function placeOrder(User $user, array $validated): Order
    {
        $products = Product::active()
            ->whereIn('id', collect($validated['items'])->pluck('product_id'))
            ->get()
            ->keyBy('id');

        $subtotal = 0;
        $items = [];

        foreach ($validated['items'] as $item) {
            $product = $products[$item['product_id']] ?? null;
            if (!$product) {
                throw new BusinessException(
                    "El producto {$item['product_id']} no está disponible."
                );
            }

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

        $subtotal = round($subtotal, 2);
        $shipping = $subtotal >= 50 ? 0 : 5;
        $total = round($subtotal + $shipping, 2);

        $order = DB::transaction(function () use ($user, $validated, $items, $subtotal, $shipping, $total) {
            $order = Order::create([
                'order_number' => $this->generateOrderNumber(),
                'user_id' => $user->id,
                'status' => Order::STATUS_PENDING,
                'subtotal' => $subtotal,
                'shipping' => $shipping,
                'total' => $total,
                'shipping_address' => $validated['shipping_address'] ?? $user->address,
                'shipping_city' => $validated['shipping_city'] ?? null,
                'shipping_phone' => $validated['shipping_phone'] ?? $user->mobile_number,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($items as $item) {
                $order->items()->create($item);
                Product::where('id', $item['product_id'])->decrement('stock', $item['quantity']);
            }

            return $order;
        });

        return $order->load('items');
    }

    public function myOrders(User $user, array $filters): LengthAwarePaginator
    {
        return Order::with('items')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(
                $filters['limit'] ?? 10,
                ['*'],
                'page',
                $filters['page'] ?? 1
            );
    }

    public function adminOrders(array $filters): LengthAwarePaginator
    {
        return Order::query()
            ->with(['items', 'user'])
            ->filterByStatus($filters['status'] ?? null)
            ->search($filters['search'] ?? null)
            ->sort(
                $filters['sortBy']['sort'] ?? 'created_at',
                $filters['sortBy']['order'] ?? 'desc'
            )
            ->paginate(
                $filters['limit'] ?? 15,
                ['*'],
                'page',
                $filters['page'] ?? 1
            );
    }

    public function updateStatus(Order $order, string $status): Order
    {
        $order->update(['status' => $status]);

        return $order->load('items');
    }

    private function generateOrderNumber(): string
    {
        do {
            $number = 'FM-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
        } while (Order::where('order_number', $number)->exists());

        return $number;
    }
}