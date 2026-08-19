<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('created_id')->nullable();
            $table->unsignedBigInteger('updated_id')->nullable();
            $table->unsignedBigInteger('restored_id')->nullable();
            $table->unsignedBigInteger('deleted_id')->nullable();

            $table->timestamp('restored_at')->nullable();
            $table->softDeletes();

            $table->foreign('created_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('restored_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('deleted_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['created_id']);
            $table->dropForeign(['updated_id']);
            $table->dropForeign(['restored_id']);
            $table->dropForeign(['deleted_id']);

            $table->dropColumn(['created_id', 'updated_id', 'restored_id', 'deleted_id', 'restored_at', 'deleted_at']);
        });
    }
};
