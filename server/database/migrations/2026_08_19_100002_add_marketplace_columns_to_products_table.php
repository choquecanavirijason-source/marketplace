<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('original_price')->nullable()->after('price');
            $table->string('sku')->nullable()->after('tag');
            $table->unsignedInteger('stock')->default(10)->after('sku');
            $table->json('tags')->nullable()->after('colors');
            $table->string('weight')->nullable()->after('tags');
            $table->string('warranty')->nullable()->after('weight');
            $table->boolean('is_active')->default(true)->after('warranty');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'original_price',
                'sku',
                'stock',
                'tags',
                'weight',
                'warranty',
                'is_active',
            ]);
        });
    }
};