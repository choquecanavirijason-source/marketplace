<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;

Route::get('/{any?}', function ($any = null) {
    // 1. Ruta raíz -> servir index.html
    if (empty($any)) {
        $indexPath = public_path('index.html');
        if (File::exists($indexPath)) {
            return Response::file($indexPath, [
                'Content-Type' => 'text/html; charset=UTF-8',
            ]);
        }
        return response('Frontend no encontrado. Ejecuta `npm run build:laravel` en client/', 404);
    }

    // 2. Si coincide con un archivo HTML exportado directamente (ej: /buscar -> buscar.html)
    $directHtml = public_path($any . '.html');
    if (File::exists($directHtml)) {
        return Response::file($directHtml, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }

    // 3. Si coincide con una carpeta con index.html (ej: /admin/index.html)
    $nestedHtml = public_path($any . '/index.html');
    if (File::exists($nestedHtml)) {
        return Response::file($nestedHtml, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }

    // 4. Si coincide con un archivo estático existente (imágenes, js, css, etc.)
    $exactFile = public_path($any);
    if (File::isFile($exactFile)) {
        return Response::file($exactFile);
    }

    // 5. Fallback para SPA de Next.js (rutas dinámicas como /product/123, /categorias/slug, etc.)
    $fallbackIndex = public_path('index.html');
    if (File::exists($fallbackIndex)) {
        return Response::file($fallbackIndex, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }

    return response('Página no encontrada', 404);
})->where('any', '.*');