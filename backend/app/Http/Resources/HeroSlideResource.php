<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HeroSlideResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'desc' => $this->desc,
            'cta' => $this->cta,
            'bg' => $this->bg,
            'accent' => $this->accent,
            'image' => $this->image,
        ];
    }
}
