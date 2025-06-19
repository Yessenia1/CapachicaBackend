<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('plan_inscripciones', function (Blueprint $table) {
            $table->datetime('fecha_inscripcion')->nullable()->after('usuario_id');
            $table->datetime('fecha_inicio_plan')->nullable()->after('fecha_inscripcion');
            $table->datetime('fecha_fin_plan')->nullable()->after('fecha_inicio_plan');
            $table->text('notas_usuario')->nullable()->after('notas');
            $table->text('requerimientos_especiales')->nullable()->after('notas_usuario');
            $table->integer('numero_participantes')->default(1)->after('requerimientos_especiales');
            $table->decimal('precio_pagado', 10, 2)->nullable()->after('numero_participantes');
            $table->enum('metodo_pago', ['efectivo', 'transferencia', 'tarjeta', 'yape', 'plin'])->nullable()->after('precio_pagado');
            $table->text('comentarios_adicionales')->nullable()->after('metodo_pago');
            
            // Índices
            $table->index('fecha_inscripcion');
            $table->index(['fecha_inicio_plan', 'fecha_fin_plan']);
            $table->index(['estado', 'fecha_inscripcion']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plan_inscripciones', function (Blueprint $table) {
            $table->dropIndex(['fecha_inscripcion']);
            $table->dropIndex(['fecha_inicio_plan', 'fecha_fin_plan']);
            $table->dropIndex(['estado', 'fecha_inscripcion']);
            
            $table->dropColumn([
                'fecha_inscripcion',
                'fecha_inicio_plan',
                'fecha_fin_plan',
                'notas_usuario',
                'requerimientos_especiales',
                'numero_participantes',
                'precio_pagado',
                'metodo_pago',
                'comentarios_adicionales'
            ]);
        });
    }
};