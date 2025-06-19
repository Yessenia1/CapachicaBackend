import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TurismoService, PaginatedResponse, Servicio, Categoria, Emprendedor } from '../../../core/services/turismo.service';
import { UbicacionMapComponent } from '../../../shared/components/ubicacion-map/ubicacion-map.component';


// Interfaces específicas para servicios
export interface ServicioDetalle {
  id: number;
  nombre: string;
  descripcion?: string;
  precio_referencial?: number;
  emprendedor_id: number;
  estado?: boolean;
  capacidad?: string;
  latitud?: number;
  longitud?: number;
  ubicacion_referencia?: string;
  emprendedor?: {
    id: number;
    nombre: string;
    tipo_servicio: string;
    telefono: string;
    email: string;
    ubicacion: string;
    precio_rango?: string;
    categoria: string;
  };
  categorias?: Array<{
    id: number;
    nombre: string;
    descripcion?: string;
    icono_url?: string;
  }>;
  horarios?: Array<{
    id: number;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    activo: boolean;
  }>;
  sliders?: Array<{
    id: number;
    url: string;
    url_completa: string;
    nombre: string;
    orden: number;
  }>;
}

export interface CategoriaServicio {
  id: number;
  nombre: string;
  descripcion?: string;
  icono_url?: string;
}

export interface EmprendedorBasico {
  id: number;
  nombre: string;
  tipo_servicio: string;
  categoria: string;
}

interface FiltrosServicios {
  categoria?: number;
  emprendedor?: number;
  ubicacion?: {
    latitud: number;
    longitud: number;
    distancia: number;
  };
  busqueda?: string;
}

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, UbicacionMapComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <!-- Hero Section -->
      <section class="relative bg-gradient-to-r from-blue-600 to-amber-600 text-white py-20">
        <div class="absolute inset-0 bg-black/20"></div>
        <div class="relative container mx-auto px-4 text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            Servicios Turísticos
          </h1>
          <p class="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Descubre la auténtica experiencia de Capachica con nuestros servicios locales
          </p>
          
          <!-- Barra de búsqueda principal -->
          <div class="max-w-2xl mx-auto">
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="filtros.busqueda"
                (ngModelChange)="onBusquedaChange($event)"
                placeholder="Buscar servicios, emprendedores o actividades..."
                class="w-full px-6 py-4 text-gray-800 rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-300 text-lg"
              >
              <button
                (click)="buscarServicios()"
                class="absolute right-2 top-2 bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-full transition-colors duration-200"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
              <!-- Indicador de búsqueda activa -->
              <div *ngIf="filtros.busqueda" class="absolute right-14 top-1/2 transform -translate-y-1/2">
                <span class="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs px-2 py-1 rounded-full">
                  {{ serviciosFiltrados().length }} resultados
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Filtros y Contenido -->
      <div class="container mx-auto px-4 py-8">
        <div class="flex flex-col lg:flex-row gap-8">
          
          <!-- Panel de Filtros -->
          <aside class="lg:w-1/4">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-4">
              <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">Filtros</h3>
              
              <!-- Filtro por Categorías -->
              <div class="mb-6">
                <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                  Categorías
                </h4>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      type="radio"
                      name="categoria"
                      [value]="null"
                      [(ngModel)]="filtros.categoria"
                      class="mr-2 text-amber-600 focus:ring-amber-500"
                    >
                    <span class="text-gray-600 dark:text-gray-400">Todas las categorías</span>
                  </label>
                  <label *ngFor="let categoria of categorias()" class="flex items-center">
                    <input
                      type="radio"
                      name="categoria"
                      [value]="categoria.id"
                      [(ngModel)]="filtros.categoria"
                      class="mr-2 text-amber-600 focus:ring-amber-500"
                    >
                    <span class="text-gray-600 dark:text-gray-400">{{ categoria.nombre }}</span>
                    <span class="ml-auto text-sm text-gray-400">({{ contarServiciosPorCategoria(categoria.id) }})</span>
                  </label>
                </div>
              </div>

              <!-- Filtro por Emprendedores -->
              <div class="mb-6">
                <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  Emprendedores
                </h4>
                <select
                  [(ngModel)]="filtros.emprendedor"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  <option [value]="null">Todos los emprendedores</option>
                  <option *ngFor="let emprendedor of emprendedores()" [value]="emprendedor.id">
                    {{ emprendedor.nombre }}
                  </option>
                </select>
              </div>

              <!-- Filtro por Ubicación -->
              <div class="mb-6">
                <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Filtrar por Ubicación
                </h4>
                
                <div class="space-y-3">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      [(ngModel)]="mostrarFiltroUbicacion"
                      class="mr-2 text-amber-600 focus:ring-amber-500"
                    >
                    <span class="text-sm text-gray-600 dark:text-gray-400">Activar filtro por ubicación</span>
                  </label>
                  
                  <div *ngIf="mostrarFiltroUbicacion" class="space-y-3">
                    <div>
                      <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Radio de búsqueda (km)
                      </label>
                      <select
                        [(ngModel)]="radioDistancia"
                        (change)="actualizarFiltroUbicacion()"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      >
                        <option value="1">1 km</option>
                        <option value="5">5 km</option>
                        <option value="10">10 km</option>
                        <option value="20">20 km</option>
                        <option value="50">50 km</option>
                      </select>
                    </div>
                    
                    <div class="text-sm">
                      <app-ubicacion-map
                        [latitud]="ubicacionSeleccionada()?.latitud"
                        [longitud]="ubicacionSeleccionada()?.longitud"
                        (ubicacionChange)="onUbicacionSeleccionada($event)"
                      ></app-ubicacion-map>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Botones de acción -->
              <div class="space-y-3">
                <!-- Botón Aplicar Filtros -->
                <button
                  (click)="aplicarFiltros()"
                  [disabled]="aplicandoFiltros() || (!tieneFiltosPorAplicar())"
                  class="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center"
                >
                  <span *ngIf="!aplicandoFiltros()">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"></path>
                    </svg>
                    Aplicar Filtros
                  </span>
                  <span *ngIf="aplicandoFiltros()" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Aplicando...
                  </span>
                </button>

                <!-- Botón para limpiar filtros -->
                <button
                  (click)="limpiarFiltros()"
                  [disabled]="!tieneFiltrosActivos()"
                  class="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </aside>

          <!-- Contenido Principal -->
          <main class="lg:w-3/4">
            <!-- Información de resultados -->
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {{ serviciosFiltrados().length }} servicios encontrados
                </h2>
                <div class="text-gray-600 dark:text-gray-400 text-sm">
                  <span *ngIf="filtros.categoria">
                    Categoría: <span class="font-medium text-amber-600 dark:text-amber-400">{{ obtenerNombreCategoria(filtros.categoria) }}</span>
                  </span>
                  <span *ngIf="filtros.emprendedor" [class]="filtros.categoria ? 'ml-2' : ''">
                    <span *ngIf="filtros.categoria">•</span>
                    Emprendedor: <span class="font-medium text-amber-600 dark:text-amber-400">{{ obtenerNombreEmprendedor(filtros.emprendedor) }}</span>
                  </span>
                  <span *ngIf="filtros.ubicacion" [class]="(filtros.categoria || filtros.emprendedor) ? 'ml-2' : ''">
                    <span *ngIf="filtros.categoria || filtros.emprendedor">•</span>
                    Radio: <span class="font-medium text-amber-600 dark:text-amber-400">{{ filtros.ubicacion.distancia }}km</span>
                  </span>
                  <span *ngIf="filtros.busqueda" [class]="(filtros.categoria || filtros.emprendedor || filtros.ubicacion) ? 'ml-2' : ''">
                    <span *ngIf="filtros.categoria || filtros.emprendedor || filtros.ubicacion">•</span>
                    Búsqueda: <span class="font-medium text-amber-600 dark:text-amber-400">"{{ filtros.busqueda }}"</span>
                  </span>
                  <span *ngIf="!tieneFiltrosActivos()" class="text-gray-500 dark:text-gray-500">
                    Mostrando todos los servicios disponibles
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
            <div *ngIf="cargando() || aplicandoFiltros()" class="text-center py-12">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
              <p class="mt-4 text-gray-600 dark:text-gray-400">
                {{ cargando() ? 'Cargando servicios...' : 'Aplicando filtros...' }}
              </p>
            </div>

            <!-- Lista de Servicios -->
            <div *ngIf="!cargando() && !aplicandoFiltros() && serviciosFiltrados().length > 0">
              <!-- Vista Grid -->
              <div *ngIf="vistaGrid()" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div *ngFor="let servicio of serviciosFiltrados()" 
                     class="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                     (click)="verDetalle(servicio.id)">
                  
                  <!-- Imagen del servicio -->
                  <div class="relative h-48 overflow-hidden">
                    <img 
                      [src]="obtenerImagenPrincipal(servicio)" 
                      [alt]="servicio.nombre"
                      class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onerror="this.src='/assets/general/placeholder-service.jpg'"
                    >
                    <div class="absolute top-3 left-3">
                      <span class="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {{ servicio.categorias?.[0]?.nombre || 'Servicio' }}
                      </span>
                    </div>
                    <div *ngIf="servicio.precio_referencial" class="absolute top-3 right-3">
                      <span class="bg-black/70 text-white px-2 py-1 rounded-full text-sm font-semibold">
                        S/. {{ servicio.precio_referencial }}
                      </span>
                    </div>
                  </div>

                  <!-- Contenido -->
                  <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-amber-600 transition-colors duration-200">
                      {{ servicio.nombre }}
                    </h3>
                    
                    <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {{ servicio.descripcion || 'Servicio turístico disponible' }}
                    </p>
                    
                    <!-- Información del emprendedor -->
                    <div class="flex items-center mb-3">
                      <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      <span class="text-sm text-gray-600 dark:text-gray-400">{{ servicio.emprendedor?.nombre }}</span>
                    </div>
                    
                    <!-- Ubicación -->
                    <div *ngIf="servicio.ubicacion_referencia" class="flex items-center mb-4">
                      <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      </svg>
                      <span class="text-xs text-gray-500 dark:text-gray-500 line-clamp-1">{{ servicio.ubicacion_referencia }}</span>
                    </div>
                    
                    <!-- Horarios disponibles -->
                    <div *ngIf="servicio.horarios && servicio.horarios.length > 0" class="mb-4">
                      <div class="flex items-center mb-1">
                        <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="text-xs text-gray-500 dark:text-gray-500">Disponible:</span>
                      </div>
                      <div class="flex flex-wrap gap-1">
                        <span *ngFor="let horario of obtenerHorariosUnicos(servicio.horarios).slice(0, 3)" 
                              class="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded">
                          {{ formatearDia(horario.dia_semana) }}
                        </span>
                        <span *ngIf="obtenerHorariosUnicos(servicio.horarios).length > 3" 
                              class="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded">
                          +{{ obtenerHorariosUnicos(servicio.horarios).length - 3 }}
                        </span>
                      </div>
                    </div>

                    <!-- Botón de acción -->
                    <button class="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>

              <!-- Vista Lista -->
              <div *ngIf="!vistaGrid()" class="space-y-4">
                <div *ngFor="let servicio of serviciosFiltrados()" 
                     class="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                     (click)="verDetalle(servicio.id)">
                  
                  <div class="flex flex-col md:flex-row">
                    <!-- Imagen -->
                    <div class="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                      <img 
                        [src]="obtenerImagenPrincipal(servicio)" 
                        [alt]="servicio.nombre"
                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onerror="this.src='/assets/general/placeholder-service.jpg'"
                      >
                      <div class="absolute top-3 left-3">
                        <span class="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {{ servicio.categorias?.[0]?.nombre || 'Servicio' }}
                        </span>
                      </div>
                    </div>

                    <!-- Contenido -->
                    <div class="md:w-2/3 p-6 flex flex-col justify-between">
                      <div>
                        <div class="flex justify-between items-start mb-2">
                          <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-amber-600 transition-colors duration-200">
                            {{ servicio.nombre }}
                          </h3>
                          <span *ngIf="servicio.precio_referencial" class="text-2xl font-bold text-amber-600">
                            S/. {{ servicio.precio_referencial }}
                          </span>
                        </div>
                        
                        <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {{ servicio.descripcion || 'Servicio turístico disponible' }}
                        </p>
                        
                        <!-- Información del emprendedor -->
                        <div class="flex items-center mb-3">
                          <svg class="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                          </svg>
                          <span class="text-gray-600 dark:text-gray-400">{{ servicio.emprendedor?.nombre }}</span>
                          <span class="mx-2 text-gray-400">•</span>
                          <span class="text-sm text-gray-500 dark:text-gray-500">{{ servicio.emprendedor?.tipo_servicio }}</span>
                        </div>
                        
                        <!-- Ubicación -->
                        <div *ngIf="servicio.ubicacion_referencia" class="flex items-center mb-4">
                          <svg class="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          </svg>
                          <span class="text-gray-500 dark:text-gray-500">{{ servicio.ubicacion_referencia }}</span>
                        </div>
                      </div>

                      <div class="flex justify-between items-center">
                        <!-- Horarios -->
                        <div *ngIf="servicio.horarios && servicio.horarios.length > 0" class="flex items-center">
                          <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <div class="flex flex-wrap gap-1">
                            <span *ngFor="let horario of obtenerHorariosUnicos(servicio.horarios).slice(0, 4)" 
                                  class="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded">
                              {{ formatearDia(horario.dia_semana) }}
                            </span>
                          </div>
                        </div>

                        <!-- Botón de acción -->
                        <button class="bg-amber-500 hover:bg-amber-600 text-white py-2 px-6 rounded-lg transition-colors duration-200 font-medium">
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Estado vacío -->
            <div *ngIf="!cargando() && !aplicandoFiltros() && serviciosFiltrados().length === 0" class="text-center py-12">
              <svg class="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.785-6.172-2.109M17.5 6.5L6.5 17.5"></path>
              </svg>
              <h3 class="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No se encontraron servicios
              </h3>
              <p class="text-gray-500 dark:text-gray-500 mb-4">
                Intenta ajustar tus filtros o realizar una nueva búsqueda
              </p>
              <button
                (click)="limpiarFiltros()"
                class="bg-amber-500 hover:bg-amber-600 text-white py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Limpiar Filtros
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
    
    /* Estilos personalizados para el componente */
    :host {
      display: block;
    }
    
    /* Animaciones suaves */
    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Hover effects */
    .group:hover .group-hover\:scale-110 {
      transform: scale(1.1);
    }
    
    .group:hover .group-hover\:text-amber-600 {
      color: #d97706;
    }
  `]
})
export class ServiciosComponent implements OnInit {
  private turismoService = inject(TurismoService);
  private router = inject(Router);

  // Signals
  servicios = signal<ServicioDetalle[]>([]);
  serviciosOriginales = signal<ServicioDetalle[]>([]); // Para mantener la lista original
  categorias = signal<CategoriaServicio[]>([]);
  emprendedores = signal<EmprendedorBasico[]>([]);
  cargando = signal<boolean>(false);
  vistaGrid = signal<boolean>(true);
  mostrarFiltroUbicacion = signal<boolean>(false);
  ubicacionSeleccionada = signal<{latitud: number, longitud: number} | null>(null);
  aplicandoFiltros = signal<boolean>(false);

  // Filtros
  filtros: FiltrosServicios = {};
  radioDistancia = 10;

  // Computed - Solo para filtros frontend (búsqueda por texto)
  serviciosFiltrados = computed(() => {
    let serviciosFiltrados = [...this.servicios()];

    // Solo filtro por búsqueda en frontend (en tiempo real)
    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      serviciosFiltrados = serviciosFiltrados.filter(servicio =>
        servicio.nombre.toLowerCase().includes(busqueda) ||
        servicio.descripcion?.toLowerCase().includes(busqueda) ||
        servicio.emprendedor?.nombre.toLowerCase().includes(busqueda) ||
        servicio.categorias?.some(cat => cat.nombre.toLowerCase().includes(busqueda))
      );
    }

    return serviciosFiltrados;
  });

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  private async cargarDatosIniciales() {
    this.cargando.set(true);
    
    try {
      // Cargar servicios, categorías y emprendedores en paralelo
      const [serviciosResponse, categoriasResponse, emprendedoresResponse] = await Promise.all([
        this.turismoService.getServicios(1, 100).toPromise(), // Aumentamos el límite
        this.turismoService.getCategorias().toPromise(),
        this.turismoService.getEmprendedores(1, 100).toPromise()
      ]);

      if (serviciosResponse) {
        const serviciosTransformados = serviciosResponse.data.map(servicio => this.transformarServicio(servicio));
        this.serviciosOriginales.set(serviciosTransformados); // Guardar originales
        this.servicios.set(serviciosTransformados);
      }

      if (categoriasResponse) {
        const categoriasTransformadas = categoriasResponse.map(cat => ({
          id: cat.id || 0,
          nombre: cat.nombre,
          descripcion: cat.descripcion,
          icono_url: cat.icono_url
        }));
        this.categorias.set(categoriasTransformadas);
      }

      if (emprendedoresResponse) {
        // Extraer emprendedores únicos
        const emprendedoresUnicos = emprendedoresResponse.data.map(emp => ({
          id: emp.id || 0,
          nombre: emp.nombre,
          tipo_servicio: emp.tipo_servicio,
          categoria: emp.categoria
        }));
        this.emprendedores.set(emprendedoresUnicos);
      }
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  private transformarServicio(servicio: Servicio): ServicioDetalle {
    return {
      id: servicio.id || 0,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio_referencial: servicio.precio_referencial ? parseFloat(servicio.precio_referencial.toString()) : undefined,
      emprendedor_id: servicio.emprendedor_id,
      estado: servicio.estado,
      capacidad: servicio.capacidad,
      latitud: servicio.latitud ? parseFloat(servicio.latitud.toString()) : undefined,
      longitud: servicio.longitud ? parseFloat(servicio.longitud.toString()) : undefined,
      ubicacion_referencia: servicio.ubicacion_referencia,
      emprendedor: servicio.emprendedor ? {
        id: servicio.emprendedor.id || 0,
        nombre: servicio.emprendedor.nombre,
        tipo_servicio: servicio.emprendedor.tipo_servicio,
        telefono: servicio.emprendedor.telefono,
        email: servicio.emprendedor.email,
        ubicacion: servicio.emprendedor.ubicacion,
        precio_rango: servicio.emprendedor.precio_rango,
        categoria: servicio.emprendedor.categoria
      } : undefined,
      categorias: servicio.categorias?.map(cat => ({
        id: cat.id || 0,
        nombre: cat.nombre,
        descripcion: cat.descripcion,
        icono_url: cat.icono_url
      })),
      horarios: servicio.horarios?.map(horario => ({
        id: horario.id || 0,
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
        activo: horario.activo || false
      })),
      sliders: servicio.sliders?.map(slider => ({
        id: slider.id || 0,
        url: slider.url || '',
        url_completa: slider.url_completa || '',
        nombre: slider.nombre,
        orden: slider.orden
      }))
    };
  }

  buscarServicios() {
    // Solo actualiza la búsqueda en tiempo real (frontend)
    // El computed serviciosFiltrados se encarga del filtrado
  }

  onBusquedaChange(valor: string) {
    this.filtros.busqueda = valor;
    // La búsqueda se aplica automáticamente a través del computed
  }

  async aplicarFiltros() {
    // Si solo hay filtro de búsqueda, no hacer petición HTTP
    if (this.soloTieneFiltrosBusqueda()) {
      console.log('Solo filtro de búsqueda, aplicando en frontend');
      return;
    }

    this.aplicandoFiltros.set(true);
    
    try {
      let serviciosResultado: ServicioDetalle[] = [];

      // Si tiene filtros de categoría o emprendedor, hacer petición específica
      if (this.filtros.categoria) {
        console.log('Aplicando filtro por categoría:', this.filtros.categoria);
        const serviciosCategoria = await this.turismoService.getServiciosByCategoria(this.filtros.categoria).toPromise();
        if (serviciosCategoria) {
          serviciosResultado = serviciosCategoria.map(servicio => this.transformarServicio(servicio));
        }
      } else if (this.filtros.emprendedor) {
        console.log('Aplicando filtro por emprendedor:', this.filtros.emprendedor);
        const serviciosEmprendedor = await this.turismoService.getServiciosByEmprendedor(this.filtros.emprendedor).toPromise();
        if (serviciosEmprendedor) {
          serviciosResultado = serviciosEmprendedor.map(servicio => this.transformarServicio(servicio));
        }
      } else if (this.filtros.ubicacion) {
        console.log('Aplicando filtro por ubicación');
        await this.aplicarFiltroUbicacion();
        return;
      } else {
        // Si no hay filtros específicos, cargar todos
        serviciosResultado = [...this.serviciosOriginales()];
      }

      this.servicios.set(serviciosResultado);
      console.log('Filtros aplicados. Servicios encontrados:', serviciosResultado.length);
      
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
      // En caso de error, mostrar servicios originales
      this.servicios.set([...this.serviciosOriginales()]);
    } finally {
      this.aplicandoFiltros.set(false);
    }
  }

  private soloTieneFiltrosBusqueda(): boolean {
    return Boolean(this.filtros.busqueda) && 
           !this.filtros.categoria && 
           !this.filtros.emprendedor && 
           !this.filtros.ubicacion;
  }

  async aplicarFiltroUbicacion() {
    if (!this.filtros.ubicacion) return;

    this.cargando.set(true);
    
    try {
      const serviciosCercanos = await this.turismoService.getServiciosByUbicacion(
        this.filtros.ubicacion.latitud,
        this.filtros.ubicacion.longitud,
        this.filtros.ubicacion.distancia
      ).toPromise();

      if (serviciosCercanos) {
        const serviciosTransformados = serviciosCercanos.map(servicio => this.transformarServicio(servicio));
        this.servicios.set(serviciosTransformados);
      }
    } catch (error) {
      console.error('Error al buscar servicios por ubicación:', error);
      // En caso de error, mantener los servicios actuales
      console.log('Manteniendo servicios actuales debido al error');
    } finally {
      this.cargando.set(false);
    }
  }

  onUbicacionSeleccionada(ubicacion: {lat: number, lng: number}) {
    this.ubicacionSeleccionada.set({
      latitud: ubicacion.lat,
      longitud: ubicacion.lng
    });
    
    this.filtros.ubicacion = {
      latitud: ubicacion.lat,
      longitud: ubicacion.lng,
      distancia: this.radioDistancia
    };
    
    this.aplicarFiltroUbicacion();
  }

  actualizarFiltroUbicacion() {
    if (this.ubicacionSeleccionada()) {
      this.filtros.ubicacion = {
        latitud: this.ubicacionSeleccionada()!.latitud,
        longitud: this.ubicacionSeleccionada()!.longitud,
        distancia: this.radioDistancia
      };
      this.aplicarFiltroUbicacion();
    }
  }

  limpiarFiltros() {
    this.filtros = {};
    this.mostrarFiltroUbicacion.set(false);
    this.ubicacionSeleccionada.set(null);
    this.radioDistancia = 10;
    
    // Restaurar servicios originales
    this.servicios.set([...this.serviciosOriginales()]);
    console.log('Filtros limpiados. Mostrando todos los servicios.');
  }

  verDetalle(servicioId: number) {
    this.router.navigate(['/servicios', servicioId]);
  }

  // Métodos utilitarios
  contarServiciosPorCategoria(categoriaId: number): number {
    return this.serviciosOriginales().filter(servicio =>
      servicio.categorias?.some(cat => cat.id === categoriaId)
    ).length;
  }

  obtenerNombreCategoria(categoriaId: number): string {
    const categoria = this.categorias().find(cat => cat.id === categoriaId);
    return categoria?.nombre || '';
  }

  obtenerNombreEmprendedor(emprendedorId: number): string {
    const emprendedor = this.emprendedores().find(emp => emp.id === emprendedorId);
    return emprendedor?.nombre || '';
  }

  obtenerImagenPrincipal(servicio: ServicioDetalle): string {
    if (servicio.sliders && servicio.sliders.length > 0) {
      return servicio.sliders[0].url_completa || '/assets/general/placeholder-service.jpg';
    }
    return '/assets/general/placeholder-service.jpg';
  }

  obtenerHorariosUnicos(horarios: any[]): any[] {
    const diasUnicos = new Set();
    return horarios.filter(horario => {
      if (horario.activo && !diasUnicos.has(horario.dia_semana)) {
        diasUnicos.add(horario.dia_semana);
        return true;
      }
      return false;
    });
  }

  // Métodos auxiliares para botones
  tieneFiltosPorAplicar(): boolean {
    return Boolean(this.filtros.categoria || this.filtros.emprendedor || this.filtros.ubicacion);
  }

  tieneFiltrosActivos(): boolean {
    return Boolean(this.filtros.categoria || this.filtros.emprendedor || this.filtros.ubicacion || this.filtros.busqueda);
  }

  formatearDia(dia: string): string {
    const dias: {[key: string]: string} = {
      'lunes': 'Lun',
      'martes': 'Mar',
      'miercoles': 'Mié',
      'jueves': 'Jue',
      'viernes': 'Vie',
      'sabado': 'Sáb',
      'domingo': 'Dom'
    };
    return dias[dia.toLowerCase()] || dia;
  }

  }