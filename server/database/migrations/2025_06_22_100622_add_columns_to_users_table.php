<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('name');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('ci')->nullable()->after('last_name');
            $table->string('registration_code')->unique()->nullable()->after('ci');
            $table->text('address')->nullable()->after('registration_code');
            $table->string('mobile_number')->nullable()->after('address');
            $table->string('phone_number')->nullable()->after('mobile_number');
            $table->date('college_affiliation_date')->nullable()->after('phone_number');
            $table->string('linkedin_url')->nullable()->after('college_affiliation_date');
            $table->string('portfolio_url')->nullable()->after('linkedin_url');
            $table->text('professional_summary')->nullable()->after('portfolio_url');
            $table->boolean('travel_availability')->default(false)->after('professional_summary');
            $table->boolean('has_driving_license')->default(false)->after('travel_availability');
            $table->string('driving_license_category')->nullable()->after('has_driving_license');
            $table->boolean('edit_profile')->default(false)->after('driving_license_category');
        });
    }

    
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'last_name',
                'ci',
                'registration_code',
                'address',
                'mobile_number',
                'phone_number',
                'college_affiliation_date',
                'linkedin_url',
                'portfolio_url',
                'professional_summary',
                'travel_availability',
                'has_driving_license',
                'driving_license_category',
                'edit_profile',
            ]);
        });
    }
};
