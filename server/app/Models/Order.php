<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    public const STATUS_PENDING = 'pendiente';
    public const STATUS_CONFIRMED = 'confirmado';
    public const STATUS_SHIPPED = 'enviado';
    public const STATUS_DELIVERED = 'entregado';
    public const STATUS_CANCELLED = 'cancelado';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_CONFIRMED,
        self::STATUS_SHIPPED,
        self::STATUS_DELIVERED,
        self::STATUS_CANCELLED,
    ];

    protected $fillable = [
        'order_number',
        'user_id',
        'status',
        'subtotal',
        'shipping',
        'total',
        'shipping_address',
        'shipping_city',
        'shipping_phone',
        'notes',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'shipping' => 'float',
        'total' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeFilterByStatus(Builder $query, ?string $status): Builder
    {
        if (!$status || !in_array($status, self::STATUSES, true)) {
            return $query;
        }

        return $query->where('status', $status);
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->whereRaw('LOWER(order_number) LIKE ?', ['%' . strtolower($search) . '%'])
                ->orWhereHas('user', fn ($user) => $user->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($search) . '%']));
        });
    }

    public function scopeSort(Builder $query, string $sortBy = 'id', string $sortDir = 'desc'): Builder
    {
        return $query->orderBy($sortBy, $sortDir);
    }
}