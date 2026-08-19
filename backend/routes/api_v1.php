<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\FavoriteController;
use App\Http\Controllers\Api\V1\HeroSlideController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ReviewController;
use Illuminate\Support\Facades\Route;

// --- Público: catálogo, categorías, banners, reseñas ---
Route::get('products', [ProductController::class, 'index']);
Route::get('products/flash-deals', [ProductController::class, 'flashDeals']);
Route::get('products/{product}', [ProductController::class, 'show']);
Route::get('products/{product}/related', [ProductController::class, 'related']);
Route::get('products/{product}/reviews', [ReviewController::class, 'index']);
Route::get('products/{product}/reviews/summary', [ReviewController::class, 'summary']);
Route::post('products/{product}/reviews', [ReviewController::class, 'store']);

Route::get('categories', [CategoryController::class, 'index']);
Route::get('hero-slides', [HeroSlideController::class, 'index']);

// --- Autenticación ---
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);

    // --- Carrito (por usuario autenticado) ---
    Route::get('cart', [CartController::class, 'index']);
    Route::get('cart/summary', [CartController::class, 'summary']);
    Route::post('cart', [CartController::class, 'store']);
    Route::patch('cart/{product}', [CartController::class, 'update']);
    Route::delete('cart/{product}', [CartController::class, 'destroy']);
    Route::delete('cart', [CartController::class, 'clear']);

    // --- Favoritos ---
    Route::get('favorites', [FavoriteController::class, 'index']);
    Route::post('favorites/toggle', [FavoriteController::class, 'toggle']);
    Route::delete('favorites/{product}', [FavoriteController::class, 'destroy']);

    // --- Pedidos / checkout ---
    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{order}', [OrderController::class, 'show']);
    Route::post('orders', [OrderController::class, 'store']);

    // --- Panel administrador (requiere role=admin) ---
    Route::middleware('admin')->group(function () {
        Route::post('products', [ProductController::class, 'store']);
        Route::put('products/{product}', [ProductController::class, 'update']);
        Route::patch('products/{product}', [ProductController::class, 'update']);
        Route::delete('products/{product}', [ProductController::class, 'destroy']);
        Route::post('hero-slides', [HeroSlideController::class, 'store']);
    });
});
