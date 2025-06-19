import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { EmprendimientosService, Emprendimiento } from '../../../core/services/emprendimientos.service';

@Component({
  selector: 'app-emprendimiento-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <!-- Barra Superior -->
      <header class="bg-white dark:bg-gray-800 shadow">
        <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {{ emprendimiento ? 'Editar: ' + emprendimiento.nombre : 'Cargando emprendimiento...' }}
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Actualiza la información de tu emprendimiento</p>
          </div>
          <div class="flex items-center space-x-4">
            <a routerLink="/mis-emprendimientos" class="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Volver
            </a>
          </div>
        </div>
      </header>
      
      <!-- Contenido Principal -->
      <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <!-- Estado de Carga -->
        <div *ngIf="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
        
        <!-- Error -->
        <div *ngIf="error" class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-300">{{ error }}</h3>
              <div class="mt-4">
                <button (click)="loadEmprendimiento()" class="rounded-md bg-red-50 dark:bg-red-900 px-3 py-2 text-sm font-medium text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800">
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Formulario de Edición -->
        <form *ngIf="emprendimientoForm && !loading" [formGroup]="emprendimientoForm" (ngSubmit)="onSubmit()" class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <!-- Secciones del Formulario -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-0">
            <!-- Panel de Navegación -->
            <div class="bg-gray-50 dark:bg-gray-900 p-4 border-r dark:border-gray-700">
              <nav class="space-y-1">
                <a (click)="activeSection = 'general'" 
                   [class.bg-white]="activeSection === 'general'" 
                   [class.dark:bg-gray-800]="activeSection === 'general'"
                   [class.text-orange-600]="activeSection === 'general'"
                   class="cursor-pointer group rounded-md px-3 py-2 flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:text-orange-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Información General
                </a>
                <a (click)="activeSection = 'contacto'" 
                   [class.bg-white]="activeSection === 'contacto'" 
                   [class.dark:bg-gray-800]="activeSection === 'contacto'"
                   [class.text-orange-600]="activeSection === 'contacto'"
                   class="cursor-pointer group rounded-md px-3 py-2 flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:text-orange-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contacto y Ubicación
                </a>
                <a (click)="activeSection = 'detalles'" 
                   [class.bg-white]="activeSection === 'detalles'" 
                   [class.dark:bg-gray-800]="activeSection === 'detalles'"
                   [class.text-orange-600]="activeSection === 'detalles'"
                   class="cursor-pointer group rounded-md px-3 py-2 flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:text-orange-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Detalles de Servicio
                </a>
                <a (click)="activeSection = 'imagenes'" 
                   [class.bg-white]="activeSection === 'imagenes'" 
                   [class.dark:bg-gray-800]="activeSection === 'imagenes'"
                   [class.text-orange-600]="activeSection === 'imagenes'"
                   class="cursor-pointer group rounded-md px-3 py-2 flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:text-orange-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Imágenes
                </a>
              </nav>
              
              <div class="mt-8">
                <div class="space-y-1">
                  <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Otras opciones
                  </h3>
                  <a [routerLink]="['/emprendimiento', emprendimientoId, 'servicios']" class="group rounded-md px-3 py-2 flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:text-orange-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Gestionar Servicios
                  </a>
                  <a [routerLink]="['/emprendimiento', emprendimientoId, 'administradores']" class="group rounded-md px-3 py-2 flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:text-orange-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Gestionar Administradores
                  </a>
                </div>
              </div>
            </div>
            
            <!-- Contenido del Formulario -->
            <div class="col-span-2 p-6">
              <!-- Información General -->
              <div *ngIf="activeSection === 'general'" class="space-y-6">
                <h2 class="text-lg font-medium text-gray-900 dark:text-white">Información General</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="col-span-2">
                    <label for="nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Emprendimiento *</label>
                    <input type="text" id="nombre" formControlName="nombre" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                    <div *ngIf="submitted && f['nombre'].errors" class="mt-1 text-sm text-red-600 dark:text-red-400">
                      <span *ngIf="f['nombre'].errors['required']">El nombre es requerido</span>
                    </div>
                  </div>
                
                  <div>
                    <label for="tipo_servicio" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Servicio *</label>
                    <input type="text" id="tipo_servicio" formControlName="tipo_servicio" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                    <div *ngIf="submitted && f['tipo_servicio'].errors" class="mt-1 text-sm text-red-600 dark:text-red-400">
                      <span *ngIf="f['tipo_servicio'].errors['required']">El tipo de servicio es requerido</span>
                    </div>
                  </div>
                
                  <div>
                    <label for="categoria" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría *</label>
                    <input type="text" id="categoria" formControlName="categoria" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                    <div *ngIf="submitted && f['categoria'].errors" class="mt-1 text-sm text-red-600 dark:text-red-400">
                      <span *ngIf="f['categoria'].errors['required']">La categoría es requerida</span>
                    </div>
                  </div>
                
                  <div class="col-span-2">
                    <label for="descripcion" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción *</label>
                    <textarea id="descripcion" formControlName="descripcion" rows="4" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500"></textarea>
                    <div *ngIf="submitted && f['descripcion'].errors" class="mt-1 text-sm text-red-600 dark:text-red-400">
                      <span *ngIf="f['descripcion'].errors['required']">La descripción es requerida</span>
                    </div>
                  </div>
                
                  <div class="flex items-center">
                    <input type="checkbox" id="estado" formControlName="estado" class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded">
                    <label for="estado" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">Emprendimiento activo</label>
                  </div>
                </div>
              </div>
              
              <!-- Contacto y Ubicación -->
              <div *ngIf="activeSection === 'contacto'" class="space-y-6">
                <h2 class="text-lg font-medium text-gray-900 dark:text-white">Contacto y Ubicación</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="telefono" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono *</label>
                    <input type="text" id="telefono" formControlName="telefono" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                    <div *ngIf="submitted && f['telefono'].errors" class="mt-1 text-sm text-red-600 dark:text-red-400">
                      <span *ngIf="f['telefono'].errors['required']">El teléfono es requerido</span>
                    </div>
                  </div>
                
                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
                    <input type="email" id="email" formControlName="email" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                    <div *ngIf="submitted && f['email'].errors" class="mt-1 text-sm text-red-600 dark:text-red-400">
                      <span *ngIf="f['email'].errors['required']">El email es requerido</span>
                      <span *ngIf="f['email'].errors['email']">El email debe ser válido</span>
                    </div>
                  </div>
                
                  <div>
                    <label for="pagina_web" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Página Web</label>
                    <input type="text" id="pagina_web" formControlName="pagina_web" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                  </div>
                
                  <div>
                    <label for="ubicacion" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación *</label>
                    <input type="text" id="ubicacion" formControlName="ubicacion" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                    <div *ngIf="submitted && f['ubicacion'].errors" class="mt-1 text-sm text-red-600 dark:text-red-400">
                      <span *ngIf="f['ubicacion'].errors['required']">La ubicación es requerida</span>
                    </div>
                  </div>
                
                  <div>
                    <label for="opciones_acceso" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Opciones de Acceso</label>
                    <input type="text" id="opciones_acceso" formControlName="opciones_acceso" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Ej: A pie, transporte público, taxi</p>
                  </div>
                
                  <div class="flex items-center">
                    <input type="checkbox" id="facilidades_discapacidad" formControlName="facilidades_discapacidad" class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded">
                    <label for="facilidades_discapacidad" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">Cuenta con facilidades para personas con discapacidad</label>
                  </div>
                </div>
              </div>
              
              <!-- Detalles de Servicio -->
              <div *ngIf="activeSection === 'detalles'" class="space-y-6">
                <h2 class="text-lg font-medium text-gray-900 dark:text-white">Detalles de Servicio</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="horario_atencion" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Horario de Atención</label>
                    <input type="text" id="horario_atencion" formControlName="horario_atencion" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Ej: Lunes a Domingo: 8:00 am - 8:00 pm</p>
                  </div>
                
                  <div>
                    <label for="precio_rango" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Rango de Precios</label>
                    <input type="text" id="precio_rango" formControlName="precio_rango" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Ej: S/. 15 - S/. 35</p>
                  </div>
                
                  <div>
                    <label for="capacidad_aforo" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Capacidad/Aforo</label>
                    <input type="number" id="capacidad_aforo" formControlName="capacidad_aforo" min="0" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                  </div>
                
                  <div>
                    <label for="numero_personas_atiende" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Número de Personas que Atienden</label>
                    <input type="number" id="numero_personas_atiende" formControlName="numero_personas_atiende" min="0" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                  </div>
                
                  <div>
                    <label for="metodos_pago" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Métodos de Pago</label>
                    <input type="text" id="metodos_pago" formControlName="metodos_pago" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Ej: Efectivo, Yape, Tarjetas (separados por coma)</p>
                  </div>
                
                  <div>
                    <label for="idiomas_hablados" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Idiomas Hablados</label>
                    <input type="text" id="idiomas_hablados" formControlName="idiomas_hablados" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Ej: Español, Quechua, Inglés (separados por coma)</p>
                  </div>
                
                  <div>
                    <label for="certificaciones" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Certificaciones</label>
                    <input type="text" id="certificaciones" formControlName="certificaciones" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                  </div>
                
                  <div class="col-span-2">
                    <label for="comentarios_resenas" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Comentarios y Reseñas</label>
                    <textarea id="comentarios_resenas" formControlName="comentarios_resenas" rows="3" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500"></textarea>
                  </div>
                </div>
              </div>
              
              <!-- Imágenes -->
              <div *ngIf="activeSection === 'imagenes'" class="space-y-6">
                <h2 class="text-lg font-medium text-gray-900 dark:text-white">Imágenes</h2>
                
                <div class="space-y-4">
                  <div>
                    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Imagen Principal</h3>
                    
                    <div *ngIf="emprendimiento?.sliders_principales?.length" class="mb-4">
                      <div *ngFor="let slider of emprendimiento?.sliders_principales" class="border border-gray-300 dark:border-gray-600 rounded-lg p-2 mb-2 flex items-center">
                        <img [src]="slider.url_completa" [alt]="slider.nombre" class="h-16 w-24 object-cover rounded mr-4">
                        <div class="flex-grow">
                          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ slider.nombre }}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-dashed border-gray-300 dark:border-gray-600">
                      <div class="text-center">
                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6.5 20H16a4 4 0 004-4V7a4 4 0 00-4-4H6a4 4 0 00-4 4v9a4 4 0 004 4h.5z" />
                        </svg>
                        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Próximamente: Subir y editar imágenes
                        </p>
                        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Esta función estará disponible en una próxima actualización.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Imágenes Secundarias</h3>
                    
                    <div *ngIf="emprendimiento?.sliders_secundarios?.length" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div *ngFor="let slider of emprendimiento?.sliders_secundarios" class="border border-gray-300 dark:border-gray-600 rounded-lg p-2 flex items-center">
                        <img [src]="slider.url_completa" [alt]="slider.nombre" class="h-16 w-24 object-cover rounded mr-4">
                        <div class="flex-grow">
                          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ slider.nombre }}</p>
                          <p *ngIf="slider.descripcion" class="text-xs text-gray-500 dark:text-gray-400">
                            {{ getSliderDescripcion(slider) }}
                            </p>
                        </div>
                      </div>
                    </div>
                    
                    <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-dashed border-gray-300 dark:border-gray-600">
                      <div class="text-center">
                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6.5 20H16a4 4 0 004-4V7a4 4 0 00-4-4H6a4 4 0 00-4 4v9a4 4 0 004 4h.5z" />
                        </svg>
                        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Próximamente: Subir y editar imágenes
                        </p>
                        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Esta función estará disponible en una próxima actualización.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Botones de Acción -->
              <div class="mt-8 pt-5 border-t border-gray-200 dark:border-gray-700">
                <div class="flex justify-between">
                  <button type="button" (click)="cancel()" class="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                    Cancelar
                  </button>
                  <button type="submit" [disabled]="submitting" class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                    <span *ngIf="submitting" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></span>
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class EmprendimientoDetalleComponent implements OnInit {
  private emprendimientosService = inject(EmprendimientosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  emprendimientoId: number = 0;
  emprendimiento: Emprendimiento | null = null;
  emprendimientoForm: FormGroup | null = null;
  
  loading = true;
  submitting = false;
  submitted = false;
  error = '';
  success = '';
  
  activeSection = 'general';
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.emprendimientoId = +params['id'];
      this.loadEmprendimiento();
    });
  }
  
  get f() {
    return this.emprendimientoForm?.controls || {};
  }
  
  loadEmprendimiento(): void {
    this.loading = true;
    this.error = '';
    
    this.emprendimientosService.getEmprendimiento(this.emprendimientoId).subscribe({
      next: (data) => {
        this.emprendimiento = data;
        this.initForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar emprendimiento:', err);
        this.error = err.error?.message || 'Error al cargar el emprendimiento. Inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }
  
  initForm(): void {
    if (!this.emprendimiento) return;
    
    // Preparar los valores de los arrays
    let metodosPago = this.emprendimiento.metodos_pago;
    if (typeof metodosPago === 'string' && metodosPago.startsWith('[')) {
      try {
        metodosPago = JSON.parse(metodosPago).join(', ');
      } catch (e) {
        console.error('Error parsing metodos_pago:', e);
      }
    }
    
    let idiomasHablados = this.emprendimiento.idiomas_hablados;
    if (typeof idiomasHablados === 'string' && idiomasHablados.includes(',')) {
      idiomasHablados = idiomasHablados; // Ya está en formato string separado por comas
    } else if (typeof idiomasHablados === 'string' && idiomasHablados.startsWith('[')) {
      try {
        idiomasHablados = JSON.parse(idiomasHablados).join(', ');
      } catch (e) {
        console.error('Error parsing idiomas_hablados:', e);
      }
    }
    
    this.emprendimientoForm = this.fb.group({
      nombre: [this.emprendimiento.nombre, [Validators.required]],
      tipo_servicio: [this.emprendimiento.tipo_servicio, [Validators.required]],
      descripcion: [this.emprendimiento.descripcion, [Validators.required]],
      ubicacion: [this.emprendimiento.ubicacion, [Validators.required]],
      telefono: [this.emprendimiento.telefono, [Validators.required]],
      email: [this.emprendimiento.email, [Validators.required, Validators.email]],
      pagina_web: [this.emprendimiento.pagina_web],
      horario_atencion: [this.emprendimiento.horario_atencion],
      precio_rango: [this.emprendimiento.precio_rango],
      metodos_pago: [metodosPago],
      capacidad_aforo: [this.emprendimiento.capacidad_aforo],
      numero_personas_atiende: [this.emprendimiento.numero_personas_atiende],
      comentarios_resenas: [this.emprendimiento.comentarios_resenas],
      categoria: [this.emprendimiento.categoria, [Validators.required]],
      certificaciones: [this.emprendimiento.certificaciones],
      idiomas_hablados: [idiomasHablados],
      opciones_acceso: [this.emprendimiento.opciones_acceso],
      facilidades_discapacidad: [this.emprendimiento.facilidades_discapacidad],
      estado: [this.emprendimiento.estado ?? true],
      asociacion_id: [this.emprendimiento.asociacion_id]
    });
  }
  
  onSubmit(): void {
    this.submitted = true;
    
    if (this.emprendimientoForm?.invalid) {
      // Ir a la primera sección con errores
      if (this.f['nombre'].errors || this.f['tipo_servicio'].errors || 
          this.f['categoria'].errors || this.f['descripcion'].errors) {
        this.activeSection = 'general';
      } else if (this.f['telefono'].errors || this.f['email'].errors || this.f['ubicacion'].errors) {
        this.activeSection = 'contacto';
      }
      return;
    }
    
    this.submitting = true;
    const formData = this.prepareFormData();
    
    this.emprendimientosService.updateEmprendimiento(this.emprendimientoId, formData).subscribe({
      next: (data) => {
        this.emprendimiento = data;
        this.success = 'Emprendimiento actualizado correctamente';
        this.submitting = false;
        
        // Mostrar mensaje de éxito y redirigir a la lista
        alert('Emprendimiento actualizado correctamente');
        this.router.navigate(['/mis-emprendimientos']);
      },
      error: (err) => {
        console.error('Error al actualizar emprendimiento:', err);
        this.error = err.error?.message || 'Error al actualizar el emprendimiento. Inténtalo de nuevo.';
        this.submitting = false;
      }
    });
  }
  
  prepareFormData(): any {
    if (!this.emprendimientoForm) return {};
    
    const formData = { ...this.emprendimientoForm.value };
    
    // Convertir strings separados por comas a arrays
    if (formData.metodos_pago && typeof formData.metodos_pago === 'string') {
      formData.metodos_pago = formData.metodos_pago.split(',').map((item: string) => item.trim());
    }
    
    if (formData.idiomas_hablados && typeof formData.idiomas_hablados === 'string') {
      formData.idiomas_hablados = formData.idiomas_hablados.split(',').map((item: string) => item.trim());
    }
    
    return formData;
  }
  getSliderDescripcion(slider: any): string {
    if (!slider.descripcion) return '';
    
    if (typeof slider.descripcion === 'string') {
      return slider.descripcion;
    } else {
      return slider.descripcion.descripcion || '';
    }
  }
  
  cancel(): void {
    this.router.navigate(['/mis-emprendimientos']);
  }
}