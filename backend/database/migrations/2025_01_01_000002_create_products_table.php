<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('original_price', 10, 2)->nullable();
            $table->string('image');
            $table->json('images')->nullable();
            $table->string('badge')->nullable();
            $table->string('weight')->nullable();
            $table->boolean('in_stock')->default(true);
            $table->string('sku')->unique()->nullable();
            $table->json('tags')->nullable();
            $table->string('warranty')->nullable();
            $table->decimal('rating', 2, 1)->default(0);
            $table->unsignedInteger('reviews_count')->default(0);
            $table->timestamps();

            $table->index(['in_stock']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
