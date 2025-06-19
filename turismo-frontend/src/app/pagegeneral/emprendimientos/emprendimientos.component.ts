import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmprendimientosService } from './emprendimientos.service';
import { 
  Emprendimiento, 
  FiltrosEmprendimientos, 
  Asociacion,
  PaginatedEmprendimientos 
} from './emprendimiento.model';

@Component({
  selector: 'app-emprendimientos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
          <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
            <!-- Hero Section -->
            <section class="relative bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-20">
              <div class="absolute inset-0 bg-black/20"></div>
              <div class="relative container mx-auto px-4 text-center">
                <h1 class="text-4xl md:text-6xl font-bold mb-6">
                  Emprendimientos Locales
                </h1>
                <p class="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                  Descubre los micronegocios que impulsan el turismo en Capachica
                </p>
                
                <!-- Barra de búsqueda principal -->
                <div class="max-w-2xl mx-auto">
                  <div class="relative">
                    <input
                      type="text"
                      [(ngModel)]="filtros.busqueda"
                      (ngModelChange)="onBusquedaChange($event)"
                      placeholder="Buscar emprendimientos, servicios o ubicaciones..."
                      class="w-full px-6 py-4 text-gray-800 rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-300 text-lg"
                    >
                    <button
                      class="absolute right-2 top-2 bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full transition-colors duration-200"
                    >
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- Sección de Asociaciones -->
            <section class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div class="container mx-auto px-4 py-8">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
                  Filtrar por Asociaciones
                </h2>
                
                <!-- Grid de Asociaciones -->
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
                  <!-- Todas las asociaciones -->
                  <button
                    (click)="seleccionarAsociacion(null)"
                    [class]="!asociacionSeleccionada() && filtros.asociacion !== 0 ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
                    class="p-4 rounded-lg transition-colors duration-200 text-center"
                  >
                    <div class="flex flex-col items-center">
                      <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      <span class="font-medium text-sm">Todos</span>
                      <span class="text-xs opacity-75">({{ emprendimientosOriginales().length }})</span>
                    </div>
                  </button>

                  <!-- Independientes -->
                  <button
                    (click)="seleccionarIndependientes()"
                    [class]="filtros.asociacion === 0 ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
                    class="p-4 rounded-lg transition-colors duration-200 text-center"
                  >
                    <div class="flex flex-col items-center">
                      <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      <span class="font-medium text-sm">Independientes</span>
                      <span class="text-xs opacity-75">({{ emprendimientosIndependientes().length }})</span>
                    </div>
                  </button>

                  <!-- Asociaciones existentes -->
                  <button
                    *ngFor="let estadistica of estadisticasAsociaciones()"
                    (click)="seleccionarAsociacion(estadistica)"
                    [class]="asociacionSeleccionada()?.id === estadistica.id ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
                    class="p-4 rounded-lg transition-colors duration-200 text-center"
                  >
                    <div class="flex flex-col items-center">
                      <img 
                        *ngIf="estadistica.imagen_url; else defaultIcon"
                        [src]="estadistica.imagen_url" 
                        [alt]="estadistica.nombre"
                        class="w-8 h-8 mb-2 rounded-full object-cover"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='block'"
                      >
                      <ng-template #defaultIcon>
                        <svg class="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                      </ng-template>
                      <span class="font-medium text-sm line-clamp-1">{{ estadistica.nombre }}</span>
                      <span class="text-xs opacity-75">({{ estadistica.cantidadEmprendimientos }})</span>
                    </div>
                  </button>
                </div>

                <!-- Información de la asociación seleccionada -->
                <div *ngIf="asociacionSeleccionada() as asociacion" class="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 mb-6">
                  <div class="flex items-start space-x-4">
                    <img 
                      *ngIf="asociacion.imagen_url"
                      [src]="asociacion.imagen_url" 
                      [alt]="asociacion.nombre"
                      class="w-16 h-16 rounded-full object-cover flex-shrink-0"
                      onerror="this.style.display='none'"
                    >
                    <div class="flex-grow">
                      <h3 class="text-lg font-bold text-emerald-800 dark:text-emerald-200 mb-1">{{ asociacion.nombre }}</h3>
                      <p class="text-emerald-700 dark:text-emerald-300 text-sm mb-2">{{ asociacion.descripcion }}</p>
                      <div class="flex items-center space-x-4 text-sm text-emerald-600 dark:text-emerald-400">
                        <div class="flex items-center">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                          </svg>
                          {{ asociacion.telefono }}
                        </div>
                        <div class="flex items-center">
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                          {{ asociacion.email }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Contenido Principal -->
            <div class="container mx-auto px-4 py-8">
              <!-- Información de resultados -->
              <div class="flex justify-between items-center mb-6">
                <div>
                  <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {{ emprendimientosFiltrados().length }} emprendimientos encontrados
                  </h2>
                  <div class="text-gray-600 dark:text-gray-400 text-sm">
                    <span *ngIf="asociacionSeleccionada() as asociacion">
                      Asociación: <span class="font-medium text-emerald-600 dark:text-emerald-400">{{ asociacion.nombre }}</span>
                    </span>
                    <span *ngIf="filtros.asociacion === 0">
                      <span class="font-medium text-emerald-600 dark:text-emerald-400">Emprendimientos Independientes</span>
                    </span>
                    <span *ngIf="filtros.busqueda" [class]="(asociacionSeleccionada() || filtros.asociacion === 0) ? 'ml-2' : ''">
                      <span *ngIf="asociacionSeleccionada() || filtros.asociacion === 0">•</span>
                      Búsqueda: <span class="font-medium text-emerald-600 dark:text-emerald-400">"{{ filtros.busqueda }}"</span>
                    </span>
                    <span *ngIf="!tieneFiltrosActivos()" class="text-gray-500 dark:text-gray-500">
                      Mostrando todos los emprendimientos disponibles
                    </span>
                  </div>
                </div>
                
                <!-- Selector de vista -->
                <div class="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    (click)="vistaGrid.set(true)"
                    [class]="vistaGrid() ? 'bg-white dark:bg-gray-600 shadow' : ''"
                    class="px-3 py-2 rounded-md transition-all duration-200"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                    </svg>
                  </button>
                  <button
                    (click)="vistaGrid.set(false)"
                    [class]="!vistaGrid() ? 'bg-white dark:bg-gray-600 shadow' : ''"
                    class="px-3 py-2 rounded-md transition-all duration-200"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Loading State -->
              <div *ngIf="cargando()" class="text-center py-12">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                <p class="mt-4 text-gray-600 dark:text-gray-400">
                  Cargando emprendimientos...
                </p>
              </div>

              <!-- Lista de Emprendimientos -->
              <div *ngIf="!cargando() && emprendimientosFiltrados().length > 0">
                <!-- Vista Grid Mejorada -->
                <div *ngIf="vistaGrid()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div *ngFor="let emprendimiento of emprendimientosFiltrados()" 
                      class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-2">
                    
                    <!-- Imagen del emprendimiento -->
                    <div class="relative h-64 overflow-hidden">
                      <img 
                        [src]="obtenerImagenPrincipal(emprendimiento)" 
                        [alt]="emprendimiento.nombre"
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onerror="this.src='/assets/general/placeholder-business.jpg'"
                      >
                      
                      <!-- Overlay gradient -->
                      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      <!-- Badges superiores -->
                      <div class="absolute top-4 left-4 flex flex-col gap-2">
                        <span class="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                          {{ emprendimiento.categoria }}
                        </span>
                        <span *ngIf="emprendimiento.facilidades_discapacidad" 
                              class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          Accesible
                        </span>
                      </div>
                      
                      <!-- Estado superior derecho -->
                      <div class="absolute top-4 right-4">
                        <span *ngIf="emprendimiento.horario_atencion as horario"
                              [class]="estaAbierto(horario) ? 'bg-green-500' : 'bg-red-500'" 
                              class="text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                          {{ estaAbierto(horario) ? 'Abierto' : 'Cerrado' }}
                        </span>
                      </div>

                      <!-- Precio y calificación en la parte inferior de la imagen -->
                      <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <div *ngIf="emprendimiento.precio_rango" class="bg-black/70 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-bold">
                          {{ emprendimiento.precio_rango }}
                        </div>
                        
                        <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1 rounded-full flex items-center shadow-lg">
                          <svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          <span class="text-sm font-bold text-gray-800 dark:text-gray-200">
                            {{ obtenerCalificacion(emprendimiento.id) }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Contenido -->
                    <div class="p-6">
                      <div class="mb-4">
                        <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 transition-colors duration-200 mb-1">
                          {{ emprendimiento.nombre }}
                        </h3>
                        <span class="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                          {{ emprendimiento.tipo_servicio }}
                        </span>
                      </div>
                      
                      <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {{ emprendimiento.descripcion }}
                      </p>
                      
                      <!-- Información en grid -->
                      <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <!-- Ubicación -->
                        <div class="flex items-center">
                          <svg class="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          </svg>
                          <span class="text-gray-600 dark:text-gray-400 line-clamp-1">{{ emprendimiento.ubicacion }}</span>
                        </div>
                        
                        <!-- Capacidad -->
                        <div class="flex items-center">
                          <svg class="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                          </svg>
                          <span class="text-gray-600 dark:text-gray-400">{{ emprendimiento.capacidad_aforo }} personas</span>
                        </div>
                        
                        <!-- Servicios -->
                        <div class="flex items-center">
                          <svg class="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                          </svg>
                          <span class="text-gray-600 dark:text-gray-400">{{ emprendimiento.servicios?.length || 0 }} servicios</span>
                        </div>
                        
                        <!-- Personal -->
                        <div class="flex items-center">
                          <svg class="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          </svg>
                          <span class="text-gray-600 dark:text-gray-400">{{ emprendimiento.numero_personas_atiende }} personal</span>
                        </div>
                      </div>
                      
                      <!-- Asociación -->
                      <div *ngIf="emprendimiento.asociacion" class="flex items-center mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">{{ emprendimiento.asociacion.nombre }}</span>
                      </div>
                      
                      <!-- Métodos de pago -->
                      <div class="mb-4">
                        <div class="flex items-center mb-2">
                          <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                          </svg>
                          <span class="text-xs text-gray-500 dark:text-gray-500 font-medium">Acepta:</span>
                        </div>
                        <div class="flex flex-wrap gap-1">
                          <span *ngFor="let metodo of procesarMetodosPago(emprendimiento.metodos_pago).slice(0, 2)" 
                                class="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded font-medium">
                            {{ metodo }}
                          </span>
                          <span *ngIf="procesarMetodosPago(emprendimiento.metodos_pago).length > 2" 
                                class="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded font-medium">
                            +{{ procesarMetodosPago(emprendimiento.metodos_pago).length - 2 }}
                          </span>
                        </div>
                      </div>

                      <!-- Botones de acción -->
                      <div class="flex gap-2">
                        <button 
                          (click)="$event.stopPropagation(); abrirModal(emprendimiento)"
                          class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium text-sm">
                          Ver Detalles
                        </button>
                        <button 
                          (click)="$event.stopPropagation(); verDetalle(emprendimiento.id)"
                          class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg transition-colors duration-200">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Vista Lista Mejorada -->
                <div *ngIf="!vistaGrid()" class="space-y-8">
                  <div *ngFor="let emprendimiento of emprendimientosFiltrados()" 
                      class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                    
                    <div class="flex flex-col lg:flex-row">
                      <!-- Imagen -->
                      <div class="lg:w-2/5 h-80 lg:h-auto relative overflow-hidden">
                        <img 
                          [src]="obtenerImagenPrincipal(emprendimiento)" 
                          [alt]="emprendimiento.nombre"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onerror="this.src='/assets/general/placeholder-business.jpg'"
                        >
                        <!-- Overlay gradient -->
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        
                        <!-- Badges superiores -->
                        <div class="absolute top-6 left-6 flex flex-col gap-3">
                          <span class="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                            {{ emprendimiento.categoria }}
                          </span>
                          <span *ngIf="emprendimiento.facilidades_discapacidad" 
                                class="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                            Accesible
                          </span>
                        </div>
                        
                        <!-- Estado superior derecho -->
                        <div class="absolute top-6 right-6">
                          <span *ngIf="emprendimiento.horario_atencion as horario"
                                [class]="estaAbierto(horario) ? 'bg-green-500' : 'bg-red-500'"
                                class="text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                            {{ estaAbierto(horario) ? 'Abierto Ahora' : 'Cerrado' }}
                          </span>
                        </div>

                        <!-- Precio y calificación en la parte inferior -->
                        <div class="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                          <div *ngIf="emprendimiento.precio_rango" class="bg-black/80 backdrop-blur text-white px-4 py-2 rounded-full font-bold">
                            {{ emprendimiento.precio_rango }}
                          </div>
                          
                          <div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur px-4 py-2 rounded-full flex items-center shadow-lg">
                            <svg class="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                            <span class="font-bold text-gray-800 dark:text-gray-200">
                              {{ obtenerCalificacion(emprendimiento.id) }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <!-- Contenido -->
                      <div class="lg:w-3/5 p-8 flex flex-col justify-between">
                        <div>
                          <div class="mb-4">
                            <h3 class="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                              {{ emprendimiento.nombre }}
                            </h3>
                            <span class="text-lg text-emerald-600 dark:text-emerald-400 font-semibold">
                              {{ emprendimiento.tipo_servicio }}
                            </span>
                          </div>
                          
                          <p class="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-lg">
                            {{ emprendimiento.descripcion }}
                          </p>
                          
                          <!-- Información detallada en grid -->
                          <div class="grid grid-cols-2 gap-4 mb-6">
                            <!-- Ubicación -->
                            <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              </svg>
                              <div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">Ubicación</div>
                                <div class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ emprendimiento.ubicacion }}</div>
                              </div>
                            </div>
                            
                            <!-- Capacidad -->
                            <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                              </svg>
                              <div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">Capacidad</div>
                                <div class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ emprendimiento.capacidad_aforo }} personas</div>
                              </div>
                            </div>
                            
                            <!-- Servicios -->
                            <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                              </svg>
                              <div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">Servicios</div>
                                <div class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ emprendimiento.servicios?.length || 0 }} disponibles</div>
                              </div>
                            </div>
                            
                            <!-- Personal -->
                            <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                              </svg>
                              <div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">Personal</div>
                                <div class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ emprendimiento.numero_personas_atiende }} personas</div>
                              </div>
                            </div>
                          </div>

                          <!-- Asociación -->
                          <div *ngIf="emprendimiento.asociacion" class="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            <div class="flex items-center">
                              <svg class="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                              </svg>
                              <div>
                                <div class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Asociación</div>
                                <div class="text-sm font-bold text-emerald-800 dark:text-emerald-200">{{ emprendimiento.asociacion.nombre }}</div>
                              </div>
                            </div>
                          </div>

                          <!-- Métodos de pago -->
                          <div class="mb-6">
                            <div class="flex items-center mb-3">
                              <svg class="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                              </svg>
                              <span class="text-gray-600 dark:text-gray-400 font-medium">Métodos de pago:</span>
                            </div>
                            <div class="flex flex-wrap gap-2">
                              <span *ngFor="let metodo of procesarMetodosPago(emprendimiento.metodos_pago)" 
                                    class="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm px-3 py-1 rounded-full font-medium">
                                {{ metodo }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <!-- Botones de acción -->
                        <div class="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button 
                            (click)="abrirModal(emprendimiento)"
                            class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-6 rounded-lg transition-colors duration-200 font-semibold">
                            Ver Detalles Completos
                          </button>
                          <button 
                            (click)="verDetalle(emprendimiento.id)"
                            class="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg transition-colors duration-200 font-semibold flex items-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                            Página Completa
                          </button>
                          <div class="text-sm text-gray-500 dark:text-gray-500 self-center">
                            <span *ngIf="emprendimiento.horario_atencion">{{ emprendimiento.horario_atencion }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Estado vacío -->
              <div *ngIf="!cargando() && emprendimientosFiltrados().length === 0" class="text-center py-12">
                <svg class="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <h3 class="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No se encontraron emprendimientos
                </h3>
                <p class="text-gray-500 dark:text-gray-500 mb-4">
                  {{ tieneFiltrosActivos() ? 'Intenta ajustar tus filtros o realizar una nueva búsqueda' : 'No hay emprendimientos disponibles en este momento' }}
                </p>
                <button
                  *ngIf="tieneFiltrosActivos()"
                  (click)="limpiarFiltros()"
                  class="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>

            <!-- Modal de Emprendimiento -->
            <div *ngIf="emprendimientoModal()" 
                class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                (click)="cerrarModal()">
              <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto shadow-2xl modal-content"
                  (click)="$event.stopPropagation()">
                
                <!-- Header del modal -->
                <div class="relative">
                  <img 
                    [src]="obtenerImagenPrincipal(emprendimientoModal()!)" 
                    [alt]="emprendimientoModal()!.nombre"
                    class="w-full h-64 object-cover rounded-t-2xl"
                    onerror="this.src='/assets/general/placeholder-business.jpg'"
                  >
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-2xl"></div>
                  
                  <!-- Botón cerrar -->
                  <button 
                    (click)="cerrarModal()"
                    class="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                  
                  <!-- Título superpuesto -->
                  <div class="absolute bottom-4 left-6 right-6">
                    <h2 class="text-3xl font-bold text-white mb-2">{{ emprendimientoModal()!.nombre }}</h2>
                    <div class="flex items-center gap-4 text-white flex-wrap">
                      <span class="bg-emerald-500 px-3 py-1 rounded-full text-sm font-medium">
                        {{ emprendimientoModal()!.categoria }}
                      </span>
                      <span class="text-lg">{{ emprendimientoModal()!.tipo_servicio }}</span>
                      <div class="flex items-center">
                        <svg class="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <span class="font-bold">{{ obtenerCalificacion(emprendimientoModal()!.id) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Contenido del modal -->
                <div class="p-6">
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    <!-- Información principal -->
                    <div>
                      <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">Descripción</h3>
                      <p class="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        {{ emprendimientoModal()!.descripcion }}
                      </p>

                      <!-- Información de contacto -->
                      <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">Contacto</h3>
                      <div class="space-y-3 mb-6">
                        <div class="flex items-center">
                          <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                          </svg>
                          <span class="text-gray-700 dark:text-gray-300">{{ emprendimientoModal()!.telefono }}</span>
                        </div>
                        <div class="flex items-center">
                          <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                          <span class="text-gray-700 dark:text-gray-300">{{ emprendimientoModal()!.email }}</span>
                        </div>
                        <div class="flex items-start">
                          <svg class="w-5 h-5 text-gray-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          </svg>
                          <span class="text-gray-700 dark:text-gray-300">{{ emprendimientoModal()!.ubicacion }}</span>
                        </div>
                      </div>

                      <!-- Horario -->
                      <div *ngIf="emprendimientoModal()!.horario_atencion">
                        <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">Horario de Atención</h3>
                        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                          <span class="text-gray-700 dark:text-gray-300">{{ emprendimientoModal()!.horario_atencion }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Información adicional -->
                    <div>
                      <!-- Detalles del negocio -->
                      <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">Detalles del Negocio</h3>
                      <div class="space-y-3 mb-6">
                        <div class="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span class="text-gray-600 dark:text-gray-400">Capacidad máxima</span>
                          <span class="font-semibold text-gray-800 dark:text-gray-200">{{ emprendimientoModal()!.capacidad_aforo }} personas</span>
                        </div>
                        <div class="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span class="text-gray-600 dark:text-gray-400">Personal que atiende</span>
                          <span class="font-semibold text-gray-800 dark:text-gray-200">{{ emprendimientoModal()!.numero_personas_atiende }} personas</span>
                        </div>
                        <div class="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span class="text-gray-600 dark:text-gray-400">Servicios disponibles</span>
                          <span class="font-semibold text-gray-800 dark:text-gray-200">{{ emprendimientoModal()!.servicios?.length || 0 }}</span>
                        </div>
                        <div class="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span class="text-gray-600 dark:text-gray-400">Accesible</span>
                          <span [class]="emprendimientoModal()!.facilidades_discapacidad ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'" 
                                class="font-semibold">
                            {{ emprendimientoModal()!.facilidades_discapacidad ? 'Sí' : 'No' }}
                          </span>
                        </div>
                      </div>

                      <!-- Precio -->
                      <div *ngIf="emprendimientoModal()!.precio_rango" class="mb-6">
                        <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">Rango de Precios</h3>
                        <div class="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg text-center">
                          <span class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {{ emprendimientoModal()!.precio_rango }}
                          </span>
                        </div>
                      </div>

                      <!-- Métodos de pago -->
                      <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">Métodos de Pago</h3>
                      <div class="flex flex-wrap gap-2 mb-6">
                        <span *ngFor="let metodo of procesarMetodosPago(emprendimientoModal()!.metodos_pago)" 
                              class="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                          {{ metodo }}
                        </span>
                      </div>

                      <!-- Asociación -->
                      <div *ngIf="emprendimientoModal()!.asociacion" class="mb-6">
                        <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">Asociación</h3>
                        <div class="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <div class="flex items-center">
                            <img *ngIf="emprendimientoModal()!.asociacion!.imagen_url" 
                                [src]="emprendimientoModal()!.asociacion!.imagen_url" 
                                [alt]="emprendimientoModal()!.asociacion!.nombre"
                                class="w-12 h-12 rounded-full object-cover mr-4"
                                onerror="this.style.display='none'">
                            <div>
                              <h4 class="font-bold text-emerald-800 dark:text-emerald-200">{{ emprendimientoModal()!.asociacion!.nombre }}</h4>
                              <p class="text-emerald-600 dark:text-emerald-400 text-sm">{{ emprendimientoModal()!.asociacion!.descripcion }}</p>
                              <div class="flex items-center mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                </svg>
                                {{ emprendimientoModal()!.asociacion!.telefono }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Reseñas -->
                      <div *ngIf="emprendimientoModal()!.comentarios_resenas">
                        <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">Reseña Destacada</h3>
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div class="flex items-start">
                            <div class="flex-shrink-0">
                              <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                              </div>
                            </div>
                            <div class="ml-3 flex-grow">
                              <p class="text-gray-600 dark:text-gray-400 italic">"{{ emprendimientoModal()!.comentarios_resenas }}"</p>
                              <div class="flex items-center mt-2">
                                <div class="flex text-yellow-400">
                                  <svg *ngFor="let star of [1,2,3,4,5]" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                  </svg>
                                </div>
                                <span class="text-sm text-gray-500 dark:text-gray-500 ml-2">Visitante verificado</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Botones de acción del modal -->
                  <div class="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <a 
                      [href]="'tel:' + emprendimientoModal()!.telefono"
                      class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg transition-colors duration-200 font-semibold text-center flex items-center justify-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      Llamar Ahora
                    </a>
                    <a 
                      [href]="'mailto:' + emprendimientoModal()!.email"
                      class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg transition-colors duration-200 font-semibold text-center flex items-center justify-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                      Enviar Email
                    </a>
                    <button 
                      (click)="verDetalle(emprendimientoModal()!.id)"
                      class="bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-6 rounded-lg transition-colors duration-200 font-semibold flex items-center justify-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                      Ver Más
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
  `,
  styles: [`
    /* Estilos CSS para el componente de Emprendimientos */

      .line-clamp-1 {
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }

      .line-clamp-2 {
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .line-clamp-3 {
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }

      /* Estilos personalizados para el componente */
      :host {
        display: block;
      }

      /* Animaciones suaves */
      .transition-all {
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Hover effects mejorados */
      .group:hover .group-hover\:scale-110 {
        transform: scale(1.1);
      }

      .group:hover .group-hover\:scale-105 {
        transform: scale(1.05);
      }

      .group:hover .group-hover\:text-emerald-600 {
        color: #059669;
      }

      /* Gradientes personalizados */
      .bg-gradient-business {
        background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
      }

      /* Sombras personalizadas mejoradas */
      .shadow-business {
        box-shadow: 0 10px 25px -3px rgba(5, 150, 105, 0.1), 0 4px 6px -2px rgba(5, 150, 105, 0.05);
      }

      .shadow-business-lg {
        box-shadow: 0 20px 25px -5px rgba(5, 150, 105, 0.1), 0 10px 10px -5px rgba(5, 150, 105, 0.04);
      }

      /* Efectos de hover personalizados para las cards */
      .emprendimiento-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }

      .emprendimiento-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }

      /* Animación del spinner de carga */
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .animate-spin {
        animation: spin 1s linear infinite;
      }

      /* Estilos para los badges mejorados */
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        white-space: nowrap;
      }

      .badge-emerald {
        background-color: rgb(16 185 129);
        color: white;
      }

      .badge-blue {
        background-color: rgb(59 130 246);
        color: white;
      }

      .badge-green {
        background-color: rgb(34 197 94);
        color: white;
      }

      .badge-red {
        background-color: rgb(239 68 68);
        color: white;
      }

      /* Estilos específicos para la sección de asociaciones */
      .asociaciones-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
      }

      .asociacion-button {
        transition: all 0.3s ease;
        border: 2px solid transparent;
        position: relative;
        overflow: hidden;
      }

      .asociacion-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .asociacion-button.active {
        border-color: #059669;
        box-shadow: 0 0 0 1px #059669;
      }

      .asociacion-info {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(13, 148, 136, 0.1) 100%);
        border: 1px solid rgba(16, 185, 129, 0.2);
      }

      /* Estilos para el modal mejorados */
      .modal-overlay {
        backdrop-filter: blur(4px);
      }

      .modal-content {
        max-height: 90vh;
        transform: scale(0.95);
        opacity: 0;
        animation: modalEnter 0.3s ease-out forwards;
      }

      @keyframes modalEnter {
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      .modal-content::-webkit-scrollbar {
        width: 6px;
      }

      .modal-content::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }

      .modal-content::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
      }

      .modal-content::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
      }

      /* Efectos de shimmer para las cards */
      .card-shimmer {
        position: relative;
        overflow: hidden;
      }

      .card-shimmer::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
          45deg,
          transparent 30%,
          rgba(255, 255, 255, 0.1) 50%,
          transparent 70%
        );
        transform: rotate(45deg);
        transition: all 0.6s ease;
        opacity: 0;
      }

      .card-shimmer:hover::before {
        opacity: 1;
        animation: shimmer 0.6s ease-in-out;
      }

      @keyframes shimmer {
        0% {
          transform: translateX(-100%) translateY(-100%) rotate(45deg);
        }
        100% {
          transform: translateX(100%) translateY(100%) rotate(45deg);
        }
      }

      /* Estilos mejorados para las cards de emprendimientos */
      .emprendimiento-card-enhanced {
        transform: translateY(0);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        backdrop-filter: blur(10px);
      }

      .emprendimiento-card-enhanced:hover {
        transform: translateY(-8px);
        box-shadow: 0 25px 50px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }

      /* Mejoras en las transiciones de imagen */
      .image-overlay {
        transition: all 0.3s ease;
      }

      .group:hover .image-overlay {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.8), rgba(59, 130, 246, 0.8));
      }

      /* Estilos para badges mejorados con backdrop blur */
      .badge-enhanced {
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }

      /* Estados de hover mejorados */
      .hover-scale {
        transition: transform 0.2s ease;
      }

      .hover-scale:hover {
        transform: scale(1.05);
      }

      /* Animaciones de entrada para elementos */
      .fade-in-up {
        animation: fadeInUp 0.6s ease-out;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Efectos de focus mejorados */
      .focus-ring:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
      }

      /* Estilos para el estado de carga mejorado */
      .loading-pulse {
        animation: pulse 1.5s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      /* Animaciones de entrada para las cards */
      .card-enter {
        animation: cardEnter 0.3s ease-out;
      }

      @keyframes cardEnter {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Estilos para indicadores de estado */
      .estado-indicator {
        position: relative;
      }

      .estado-indicator::after {
        content: '';
        position: absolute;
        top: -2px;
        right: -2px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: 2px solid white;
      }

      .estado-indicator.abierto::after {
        background-color: #10b981;
        animation: pulse-green 2s infinite;
      }

      .estado-indicator.cerrado::after {
        background-color: #ef4444;
      }

      @keyframes pulse-green {
        0% {
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
        }
      }

      /* Estilos responsivos mejorados */
      @media (max-width: 768px) {
        .grid-responsive {
          grid-template-columns: 1fr;
        }
        
        .hero-text {
          font-size: 2.5rem;
          line-height: 1.2;
        }
        
        .asociaciones-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        
        .modal-content {
          margin: 1rem;
          max-height: calc(100vh - 2rem);
        }
        
        .modal-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .hero-text {
          font-size: 2rem;
        }
        
        .hero-subtitle {
          font-size: 1.125rem;
        }
        
        .card-padding {
          padding: 1rem;
        }
        
        .emprendimiento-card-enhanced:hover {
          transform: translateY(-4px);
        }
      }

      /* Mejoras de rendimiento */
      .gpu-accelerated {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }

      /* Estilos para overflow text con ellipsis */
      .text-ellipsis {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Estilos específicos para la vista mejorada de asociaciones */
      .asociacion-card {
        position: relative;
        overflow: hidden;
      }

      .asociacion-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s ease;
      }

      .asociacion-card:hover::before {
        left: 100%;
      }

      /* Mejoras en modo oscuro */
      @media (prefers-color-scheme: dark) {
        .asociacion-info {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(13, 148, 136, 0.2) 100%);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .modal-content::-webkit-scrollbar-track {
          background: #374151;
        }
        
        .modal-content::-webkit-scrollbar-thumb {
          background: #6b7280;
        }
        
        .modal-content::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      }

      /* Estilos para tooltips simples */
      .tooltip {
        position: relative;
      }

      .tooltip::after {
        content: attr(data-tooltip);
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: #1f2937;
        color: white;
        padding: 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        z-index: 10;
      }

      .tooltip:hover::after {
        opacity: 1;
      }

      /* Efectos especiales para el backdrop del modal */
      .backdrop-blur-sm {
        backdrop-filter: blur(4px);
      }

      /* Mejoras específicas para el grid de emprendimientos */
      .emprendimientos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 2rem;
      }

      /* Estilos responsivos mejorados */
      @media (max-width: 768px) {
        .grid-responsive {
          grid-template-columns: 1fr;
        }
        
        .hero-text {
          font-size: 2.5rem;
          line-height: 1.2;
        }
        
        .asociaciones-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        
        .modal-content {
          margin: 1rem;
          max-height: calc(100vh - 2rem);
        }
        
        .modal-grid {
          grid-template-columns: 1fr;
        }
        
        .emprendimientos-grid {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        
        /* Ajustes para cards en móvil */
        .emprendimiento-card-enhanced {
          margin-bottom: 1rem;
        }
        
        /* Vista lista en móvil */
        .lg\:w-2\/5 {
          width: 100% !important;
          height: 250px !important;
        }
        
        .lg\:w-3\/5 {
          width: 100% !important;
        }
        
        /* Hero section mobile */
        .hero-section {
          padding-top: 3rem;
          padding-bottom: 3rem;
        }
        
        /* Asociaciones mobile */
        .asociacion-button {
          padding: 0.75rem;
        }
        
        .asociacion-info {
          padding: 1rem;
        }
      }

      @media (max-width: 640px) {
        .hero-text {
          font-size: 2rem;
        }
        
        .hero-subtitle {
          font-size: 1.125rem;
        }
        
        .card-padding {
          padding: 1rem;
        }
        
        .emprendimiento-card-enhanced:hover {
          transform: translateY(-4px);
        }
        
        /* Grid de asociaciones más pequeño */
        .asociaciones-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }
        
        /* Modal responsive */
        .modal-content {
          margin: 0.5rem;
          max-height: calc(100vh - 1rem);
          border-radius: 1rem;
        }
        
        /* Botones del modal en móvil */
        .modal-buttons {
          flex-direction: column;
          gap: 0.5rem;
        }
        
        /* Hero search bar mobile */
        .search-container {
          padding: 0 1rem;
        }
        
        .search-input {
          font-size: 1rem;
          padding: 0.75rem 1rem;
        }
        
        /* Cards grid mobile */
        .cards-grid {
          padding: 0 1rem;
        }
        
        /* Información de resultados mobile */
        .results-info {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .view-selector {
          align-self: flex-end;
        }
      }

      @media (max-width: 480px) {
        /* Extra small devices */
        .hero-text {
          font-size: 1.75rem;
        }
        
        .hero-subtitle {
          font-size: 1rem;
        }
        
        /* Asociaciones en móviles muy pequeños */
        .asociaciones-grid {
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }
        
        .asociacion-button {
          padding: 0.5rem;
          text-align: left;
        }
        
        .asociacion-button .flex-col {
          flex-direction: row;
          align-items: center;
          gap: 0.5rem;
        }
        
        /* Modal en dispositivos muy pequeños */
        .modal-content {
          margin: 0.25rem;
          max-height: calc(100vh - 0.5rem);
        }
        
        /* Cards más compactas */
        .card-content {
          padding: 1rem;
        }
        
        .card-image {
          height: 200px;
        }
        
        /* Información en grid más compacta */
        .info-grid {
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }
        
        /* Badges más pequeños */
        .badge-small {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }
        
        /* Botones más compactos */
        .action-buttons {
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .action-button {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }
      }

      /* Mejoras de rendimiento */
      .gpu-accelerated {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }

      /* Estilos para overflow text con ellipsis */
      .text-ellipsis {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Estilos específicos para la vista mejorada de asociaciones */
      .asociacion-card {
        position: relative;
        overflow: hidden;
      }

      .asociacion-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s ease;
      }

      .asociacion-card:hover::before {
        left: 100%;
      }

      /* Mejoras en modo oscuro */
      @media (prefers-color-scheme: dark) {
        .asociacion-info {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(13, 148, 136, 0.2) 100%);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .modal-content::-webkit-scrollbar-track {
          background: #374151;
        }
        
        .modal-content::-webkit-scrollbar-thumb {
          background: #6b7280;
        }
        
        .modal-content::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        /* Dark mode responsive adjustments */
        @media (max-width: 768px) {
          .hero-section {
            background: linear-gradient(135deg, #065f46 0%, #1e40af 100%);
          }
          
          .card-dark {
            background: #1f2937;
          }
        }
      }

      /* Estilos para tooltips simples */
      .tooltip {
        position: relative;
      }

      .tooltip::after {
        content: attr(data-tooltip);
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: #1f2937;
        color: white;
        padding: 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        z-index: 10;
      }

      .tooltip:hover::after {
        opacity: 1;
      }

      /* Efectos especiales para el backdrop del modal */
      .backdrop-blur-sm {
        backdrop-filter: blur(4px);
      }

      /* Mejoras específicas para el grid de emprendimientos */
      .emprendimientos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 2rem;
      }

      @media (max-width: 768px) {
        .emprendimientos-grid {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
      }

      /* Animaciones optimizadas para dispositivos móviles */
      @media (hover: hover) and (pointer: fine) {
        /* Solo aplicar hover effects en dispositivos con mouse */
        .emprendimiento-card-enhanced:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .asociacion-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      }

      /* Mejoras de accesibilidad para pantallas pequeñas */
      @media (max-width: 640px) {
        /* Aumentar tamaños de toque para móviles */
        .touch-target {
          min-height: 44px;
          min-width: 44px;
        }
        
        /* Mejorar legibilidad en pantallas pequeñas */
        .text-mobile {
          font-size: 1rem;
          line-height: 1.5;
        }
        
        /* Espaciado mejorado para móviles */
        .mobile-spacing {
          padding: 1rem;
          margin: 0.5rem 0;
        }
        
        /* Estados de focus más prominentes en móvil */
        .focus-mobile:focus {
          outline: 3px solid #059669;
          outline-offset: 2px;
        }
      }

      /* Optimizaciones de rendimiento para dispositivos móviles */
      @media (max-width: 768px) {
        /* Reducir complejidad de animaciones en móviles */
        .reduced-motion {
          animation-duration: 0.2s;
          transition-duration: 0.2s;
        }
        
        /* Simplificar efectos de blur en móviles */
        .mobile-blur {
          backdrop-filter: blur(2px);
        }
        
        /* Optimizar transformaciones para mejor rendimiento */
        .mobile-transform {
          transform: translate3d(0, 0, 0);
          will-change: transform;
        }
      }
  `]
})
export class EmprendimientosComponent implements OnInit {
  private emprendimientosService = inject(EmprendimientosService);
  private router = inject(Router);

  // Signals
  emprendimientos = signal<Emprendimiento[]>([]);
  emprendimientosOriginales = signal<Emprendimiento[]>([]);
  asociaciones = signal<Asociacion[]>([]);
  asociacionSeleccionada = signal<Asociacion | null>(null);
  cargando = signal<boolean>(false);
  vistaGrid = signal<boolean>(true);
  paginacionDatos = signal<PaginatedEmprendimientos | null>(null);
  emprendimientoModal = signal<Emprendimiento | null>(null);

  // Filtros simplificados
  filtros: FiltrosEmprendimientos = {};
  paginaActual = 1;
  elementosPorPagina = 12;

  // Computed
  emprendimientosFiltrados = computed(() => {
    let emprendimientosFiltrados = [...this.emprendimientos()];

    // Filtro por asociación
    if (this.filtros.asociacion !== undefined) {
      if (this.filtros.asociacion === 0) {
        // Independientes (sin asociación)
        emprendimientosFiltrados = emprendimientosFiltrados.filter(emp => !emp.asociacion_id);
      } else {
        // Asociación específica
        emprendimientosFiltrados = emprendimientosFiltrados.filter(emp => emp.asociacion_id === this.filtros.asociacion);
      }
    }

    // Filtro de búsqueda en tiempo real (frontend)
    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      emprendimientosFiltrados = emprendimientosFiltrados.filter(emp =>
        emp.nombre.toLowerCase().includes(busqueda) ||
        emp.descripcion.toLowerCase().includes(busqueda) ||
        emp.categoria.toLowerCase().includes(busqueda) ||
        emp.tipo_servicio.toLowerCase().includes(busqueda) ||
        emp.ubicacion.toLowerCase().includes(busqueda) ||
        emp.asociacion?.nombre.toLowerCase().includes(busqueda)
      );
    }

    return emprendimientosFiltrados;
  });

  calificaciones = computed(() => {
    const calificacionesMap = new Map<number, number>();
    this.emprendimientosFiltrados().forEach(emp => {
      const calificacion = this.emprendimientosService.calcularCalificacionPromedio(emp);
      calificacionesMap.set(emp.id, calificacion);
    });
    return calificacionesMap;
  });

  // Computed para estadísticas de asociaciones
  estadisticasAsociaciones = computed(() => {
    const emprendimientos = this.emprendimientosOriginales();
    const asociaciones = this.asociaciones();
    
    return asociaciones.map(asociacion => ({
      ...asociacion,
      cantidadEmprendimientos: emprendimientos.filter(emp => emp.asociacion_id === asociacion.id).length,
      emprendimientos: emprendimientos.filter(emp => emp.asociacion_id === asociacion.id)
    }));
  });

  emprendimientosIndependientes = computed(() => {
    return this.emprendimientosOriginales().filter(emp => !emp.asociacion_id);
  });

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  private async cargarDatosIniciales() {
    this.cargando.set(true);
    
    try {
      // Cargar emprendimientos, asociaciones y datos auxiliares en paralelo
      const [emprendimientosResponse, asociacionesResponse] = await Promise.all([
        this.emprendimientosService.getEmprendimientos(this.paginaActual, this.elementosPorPagina).toPromise(),
        this.emprendimientosService.getAsociaciones(1, 100).toPromise()
      ]);

      if (emprendimientosResponse) {
        this.emprendimientosOriginales.set(emprendimientosResponse.data);
        this.emprendimientos.set(emprendimientosResponse.data);
        this.paginacionDatos.set(emprendimientosResponse);
      }

      if (asociacionesResponse) {
        this.asociaciones.set(asociacionesResponse.data);
      }
      
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  onBusquedaChange(valor: string) {
    this.filtros.busqueda = valor;
    // La búsqueda se aplica automáticamente a través del computed (solo frontend)
  }

  private async cargarEmprendimientos() {
    this.cargando.set(true);
    
    try {
      const response = await this.emprendimientosService.getEmprendimientos(
        this.paginaActual, 
        this.elementosPorPagina
      ).toPromise();

      if (response) {
        this.emprendimientos.set(response.data);
        this.emprendimientosOriginales.set(response.data);
        this.paginacionDatos.set(response);
      }
    } catch (error) {
      console.error('Error al cargar emprendimientos:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  async cambiarPagina(pagina: number) {
    if (pagina < 1 || (this.paginacionDatos() && pagina > this.paginacionDatos()!.last_page)) {
      return;
    }

    this.paginaActual = pagina;
    await this.cargarEmprendimientos();
  }

  obtenerPaginasVisibles(): number[] {
    const paginacion = this.paginacionDatos();
    if (!paginacion) return [];

    const paginaActual = paginacion.current_page;
    const totalPaginas = paginacion.last_page;
    const paginas: number[] = [];

    // Mostrar hasta 5 páginas
    const inicio = Math.max(1, paginaActual - 2);
    const fin = Math.min(totalPaginas, inicio + 4);

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    return paginas;
  }

  verDetalle(emprendimientoId: number) {
    this.router.navigate(['/emprendimientos', emprendimientoId]);
  }

  // Métodos para manejo de asociaciones
  seleccionarAsociacion(asociacion: Asociacion | null) {
    this.asociacionSeleccionada.set(asociacion);
    if (asociacion) {
      this.filtros.asociacion = asociacion.id;
    } else {
      this.filtros.asociacion = undefined;
    }
  }

  seleccionarIndependientes() {
    this.asociacionSeleccionada.set(null);
    this.filtros.asociacion = 0; // 0 para independientes
  }

  limpiarFiltros() {
    this.filtros = {};
    this.asociacionSeleccionada.set(null);
    console.log('Filtros limpiados. Mostrando todos los emprendimientos.');
  }

  // Modal methods
  abrirModal(emprendimiento: Emprendimiento) {
    this.emprendimientoModal.set(emprendimiento);
  }

  cerrarModal() {
    this.emprendimientoModal.set(null);
  }

  tieneFiltrosActivos(): boolean {
    return Boolean(
      this.filtros.asociacion !== undefined || 
      this.filtros.busqueda
    );
  }

  // Métodos utilitarios
  contarEmprendimientosPorAsociacion(asociacionId: number): number {
    return this.emprendimientosOriginales().filter(emp => emp.asociacion_id === asociacionId).length;
  }

  contarEmprendimientosIndependientes(): number {
    return this.emprendimientosOriginales().filter(emp => !emp.asociacion_id).length;
  }

  obtenerNombreAsociacion(asociacionId: number): string {
    if (asociacionId === 0) return 'Independientes';
    const asociacion = this.asociaciones().find(asoc => asoc.id === asociacionId);
    return asociacion?.nombre || '';
  }

  // Método helper para obtener calificación
  obtenerCalificacion(emprendimientoId: number): number {
    return this.calificaciones().get(emprendimientoId) || 0;
  }

  // Métodos delegados al servicio
  obtenerImagenPrincipal(emprendimiento: Emprendimiento): string {
    return this.emprendimientosService.obtenerImagenPrincipal(emprendimiento);
  }

  procesarMetodosPago(metodos: any): string[] {
    return this.emprendimientosService.procesarMetodosPago(metodos);
  }

  procesarIdiomasHablados(idiomas: any): string[] {
    return this.emprendimientosService.procesarIdiomasHablados(idiomas);
  }

  estaAbierto(horario: string): boolean {
    return this.emprendimientosService.estaAbierto(horario);
  }

  formatearPrecioRango(rango: string): { min: number; max: number } | null {
    return this.emprendimientosService.formatearPrecioRango(rango);
  }
}