<?php

namespace App\Http\Requests\HeroSlide;

use Illuminate\Foundation\Http\FormRequest;

class StoreHeroSlideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->isAdmin();
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'subtitle' => ['required', 'string', 'max:150'],
            'desc' => ['required', 'string', 'max:500'],
            'cta' => ['required', 'string', 'max:80'],
            'bg' => ['required', 'string', 'max:100'],
            'accent' => ['required', 'string', 'max:100'],
            'image' => ['required', 'string', 'max:2048'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
