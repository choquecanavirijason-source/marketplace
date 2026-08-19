<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\HeroSlide\StoreHeroSlideRequest;
use App\Http\Resources\HeroSlideResource;
use App\Models\HeroSlide;

class HeroSlideController extends Controller
{
    public function index()
    {
        return HeroSlideResource::collection(HeroSlide::ordered()->get());
    }

    public function store(StoreHeroSlideRequest $request)
    {
        $slide = HeroSlide::create($request->validated());

        return new HeroSlideResource($slide);
    }
}
