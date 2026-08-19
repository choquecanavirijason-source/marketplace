<?php

namespace App\Http\Resources\Contact;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactResource extends JsonResource
{
    
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'address' => $this->address,
            'mobile_number' => $this->mobile_number,
            'phone_number' => $this->phone_number,
            'email' => $this->email,
            'business_hours' => $this->business_hours,
            'facebook_url' => $this->facebook_url,
            'instagram_url' => $this->instagram_url,
            'tiktok_url' => $this->tiktok_url,
            'youtube_url' => $this->youtube_url,
            'whatsapp_url' => $this->whatsapp_url,
        ];
    }
}
