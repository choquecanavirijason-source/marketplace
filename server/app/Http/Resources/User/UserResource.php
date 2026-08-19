<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'ci' => $this->ci,
            'registration_code' => $this->registration_code,
            'address' => $this->address,
            'mobile_number' => $this->mobile_number,
            'phone_number' => $this->phone_number,
            'college_affiliation_date' => $this->college_affiliation_date,
            'linkedin_url' => $this->linkedin_url,
            'portfolio_url' => $this->portfolio_url,
            'professional_summary' => $this->professional_summary,
            'travel_availability' => $this->travel_availability,
            'has_driving_license' => $this->has_driving_license,
            'driving_license_category' => $this->driving_license_category,
            'edit_profile' => $this->edit_profile,
            'role_name' => $this->roles->first()?->name,
            'profile_picture' => $this->getFullImageUrl('profile_picture'),
            'observation' => $this->observation,
            'gender' => $this->gender,
            'academic_title_short' => $this->academic_title_short,
            'academic_title_long' => $this->academic_title_long,
            'membership_start_date' => $this->membership_start_date,
            'membership_end_date' => $this->membership_end_date,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}