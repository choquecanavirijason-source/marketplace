<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name'),
        'message' => 'FerroMax API. Ver /api/v1 para los endpoints del marketplace.',
    ]);
});
