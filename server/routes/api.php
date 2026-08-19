<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ContactController;
use App\Http\Controllers\Api\V1\FaqController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\TestimonialController;
use Illuminate\Support\Facades\Route;

Route::prefix('/v1')
    ->name('v1.')
    ->group(function () {

        // ---- Público ----
        Route::post('login', [AuthController::class, 'login']);
        Route::post('register', [AuthController::class, 'register']);

        Route::get('products', [ProductController::class, 'index']);
        Route::get('products/{slug}', [ProductController::class, 'showBySlug']);
        Route::get('products/{product}/reviews', [ReviewController::class, 'byProduct']);

        Route::get('categories', [CategoryController::class, 'all']);
        Route::get('categories/{category:slug}', [CategoryController::class, 'show']);

        Route::get('testimonials/all', [TestimonialController::class, 'all']);
        Route::get('contacts/all', [ContactController::class, 'all']);
        Route::get('faqs/all', [FaqController::class, 'all']);

        // ---- Autenticados (cliente y admin) ----
        Route::middleware(['auth:api'])->group(function () {
            Route::post('me', [AuthController::class, 'me']);
            Route::put('me', [AuthController::class, 'updateProfile']);
            Route::post('logout', [AuthController::class, 'logout']);

            Route::post('orders', [OrderController::class, 'store']);
            Route::get('orders', [OrderController::class, 'index']);
            Route::get('orders/{order}', [OrderController::class, 'show']);

            Route::post('products/{product}/reviews', [ReviewController::class, 'store']);

            Route::get('cart', [CartController::class, 'index']);
            Route::post('cart/items', [CartController::class, 'store']);
            Route::patch('cart/items/{cartItem}', [CartController::class, 'update']);
            Route::delete('cart/items/{cartItem}', [CartController::class, 'destroy']);
            Route::delete('cart', [CartController::class, 'clear']);
        });

        // ---- Solo administrador ----
        Route::middleware(['auth:api', 'permission:producto.crear'])->post('products', [ProductController::class, 'store']);
        Route::middleware(['auth:api', 'permission:producto.editar'])->put('products/{product}', [ProductController::class, 'update']);
        Route::middleware(['auth:api', 'permission:producto.editar'])->patch('admin/products/{product}/status', [ProductController::class, 'toggleActive']);
        Route::middleware(['auth:api', 'permission:producto.eliminar'])->delete('products/{product}', [ProductController::class, 'destroy']);
        Route::middleware(['auth:api', 'permission:producto.ver'])->get('admin/products', [ProductController::class, 'adminIndex']);

        Route::middleware(['auth:api', 'permission:categoria.crear'])->post('categories', [CategoryController::class, 'store']);
        Route::middleware(['auth:api', 'permission:categoria.editar'])->put('categories/{category}', [CategoryController::class, 'update']);
        Route::middleware(['auth:api', 'permission:categoria.eliminar'])->delete('categories/{category}', [CategoryController::class, 'destroy']);
        Route::middleware(['auth:api', 'permission:categoria.ver'])->get('admin/categories', [CategoryController::class, 'index']);

        Route::middleware(['auth:api', 'permission:testimonio.crear'])->post('testimonials', [TestimonialController::class, 'store']);
        Route::middleware(['auth:api', 'permission:testimonio.editar'])->put('testimonials/{testimonial}', [TestimonialController::class, 'update']);
        Route::middleware(['auth:api', 'permission:testimonio.eliminar'])->delete('testimonials/{testimonial}', [TestimonialController::class, 'destroy']);

        Route::middleware(['auth:api', 'permission:contacto.crear'])->post('contacts', [ContactController::class, 'store']);
        Route::middleware(['auth:api', 'permission:contacto.editar'])->put('contacts/{contact}', [ContactController::class, 'update']);
        Route::middleware(['auth:api', 'permission:contacto.eliminar'])->delete('contacts/{contact}', [ContactController::class, 'destroy']);
        Route::middleware(['auth:api', 'permission:contacto.ver'])->get('contacts', [ContactController::class, 'index']);
        Route::middleware(['auth:api', 'permission:contacto.ver'])->get('contacts/{contact}', [ContactController::class, 'getContact']);

        Route::middleware(['auth:api', 'permission:pregunta_frecuente.crear'])->post('faqs', [FaqController::class, 'store']);
        Route::middleware(['auth:api', 'permission:pregunta_frecuente.editar'])->put('faqs/{faq}', [FaqController::class, 'update']);
        Route::middleware(['auth:api', 'permission:pregunta_frecuente.eliminar'])->delete('faqs/{faq}', [FaqController::class, 'destroy']);
        Route::middleware(['auth:api', 'permission:pregunta_frecuente.ver'])->get('faqs', [FaqController::class, 'index']);

        Route::middleware(['auth:api', 'permission:resena.eliminar'])->delete('reviews/{review}', [ReviewController::class, 'destroy']);

        Route::middleware(['auth:api', 'permission:pedido.ver'])->group(function () {
            Route::get('admin/orders', [OrderController::class, 'adminIndex']);
            Route::get('admin/orders/{order}', [OrderController::class, 'show']);
            Route::get('admin/stats', [AdminController::class, 'stats']);
            Route::get('admin/users', [AdminController::class, 'users']);
        });

        Route::middleware(['auth:api', 'permission:pedido.editar'])->patch('admin/orders/{order}/status', [OrderController::class, 'updateStatus']);
    });