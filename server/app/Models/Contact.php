<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Contact extends Model
{
    protected $fillable = [
        'address',
        'mobile_number',
        'phone_number',
        'email',
        'business_hours',
        'facebook_url',
        'instagram_url',
        'tiktok_url',
        'youtube_url',
        'whatsapp_url',
    ];

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (!$search) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->whereRaw('LOWER(address) LIKE ?', ['%' . strtolower($search) . '%'])
                ->orWhereRaw('LOWER(mobile_number) LIKE ?', ['%' . strtolower($search) . '%']);
        });
    }

    public function scopeSort(Builder $query, string $sortBy = 'id', string $sortDir = 'asc'): Builder
    {
        return $query->orderBy($sortBy, $sortDir);
    }
}
