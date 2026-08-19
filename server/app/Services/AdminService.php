<?php

namespace App\Services;

use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;

class AdminService
{
    public function stats(): array
    {
        $totalProducts = Product::count();
        $totalOrders = Order::count();
        $totalClients = User::role('cliente')->count();
        $revenue = Order::where('status', '!=', Order::STATUS_CANCELLED)->sum('total');
        $averageOrder = Order::where('status', '!=', Order::STATUS_CANCELLED)->avg('total');

        $ordersByStatus = Order::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->all();

        $monthlyRaw = Order::query()
            ->where('status', '!=', Order::STATUS_CANCELLED)
            ->where('created_at', '>=', now()->subMonths(5)->startOfMonth())
            ->selectRaw("DATE_TRUNC('month', created_at) as month")
            ->selectRaw('COUNT(*) as total_orders')
            ->selectRaw('SUM(total) as revenue')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $spanishMonths = [
            1 => 'Ene', 2 => 'Feb', 3 => 'Mar', 4 => 'Abr', 5 => 'May', 6 => 'Jun',
            7 => 'Jul', 8 => 'Ago', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dic',
        ];

        $monthly = collect(range(5, 0))
            ->map(function (int $offset) use ($monthlyRaw, $spanishMonths) {
                $start = now()->startOfMonth()->subMonths($offset);
                $key = $start->format('Y-m');
                $row = $monthlyRaw->first(fn ($item) => Carbon::parse($item->month)->format('Y-m') === $key);

                return [
                    'month' => $key,
                    'label' => $spanishMonths[$start->month] . ' ' . $start->year,
                    'total_orders' => (int) ($row->total_orders ?? 0),
                    'revenue' => round((float) ($row->revenue ?? 0), 2),
                ];
            })
            ->values()
            ->all();

        $topProducts = OrderItem::query()
            ->join('orders', 'orders.id', 'order_items.order_id')
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->selectRaw('order_items.product_id, order_items.product_name, SUM(order_items.quantity) as total_sold, SUM(order_items.subtotal) as total_revenue')
            ->groupBy('order_items.product_id', 'order_items.product_name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get()
            ->map(fn ($item) => [
                'product_id' => (int) $item->product_id,
                'name' => $item->product_name,
                'total_sold' => (int) $item->total_sold,
                'total_revenue' => round((float) $item->total_revenue, 2),
            ])
            ->all();

        $recentOrders = Order::with(['items', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentProducts = Product::with('category')
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return [
            'total_products' => $totalProducts,
            'total_orders' => $totalOrders,
            'total_clients' => $totalClients,
            'revenue' => round((float) $revenue, 2),
            'average_order' => round((float) ($averageOrder ?? 0), 2),
            'orders_by_status' => $ordersByStatus,
            'orders_by_month' => $monthly,
            'top_products' => $topProducts,
            'recent_orders' => OrderResource::collection($recentOrders),
            'recent_products' => ProductResource::collection($recentProducts),
        ];
    }

    public function users(array $filters): LengthAwarePaginator
    {
        return User::query()
            ->role('cliente')
            ->search($filters['search'] ?? null)
            ->sort(
                $filters['sortBy']['sort'] ?? 'id',
                $filters['sortBy']['order'] ?? 'desc'
            )
            ->paginate(
                $filters['limit'] ?? 15,
                ['*'],
                'page',
                $filters['page'] ?? 1
            );
    }
}