import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmprendimientosService, Emprendimiento } from '../../../core/services/emprendimientos.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-mis-emprendimientos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen relative">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-[url('https://media-cdn.tripadvisor.com/media/photo-s/08/e7/29/52/capachica-peninsula.jpg')] bg-cover bg-center bg-no-repeat">
        <div class="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-gray-900/95 backdrop-blur-sm"></div>
      </div>

      <!-- Content -->
      <div class="relative min-h-screen">
        <!-- Barra Superior con Glassmorphism -->
        <header class="backdrop-blur-lg bg-white/10 dark:bg-gray-800/20 border-b border-white/10 dark:border-gray-700/30 sticky top-0 z-50">
          <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">Gestión de Emprendimientos</h1>
              <p class="text-sm text-gray-300 dark:text-gray-400 mt-1">Administra tus negocios y servicios</p>
            </div>
            <div class="flex items-center space-x-4">
              <a routerLink="/dashboard" class="group flex items-center px-4 py-2 rounded-full bg-white/10 dark:bg-gray-800/30 text-white hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Ir al Panel
              </a>
              <button (click)="logout()" class="group flex items-center px-4 py-2 rounded-full bg-white/10 dark:bg-gray-800/30 text-white hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
              <button
                (click)="toggleDarkMode()"
                class="ml-4 p-2 rounded-full bg-white/20 dark:bg-gray-800/40 text-gray-800 dark:text-gray-200 shadow hover:bg-white/40 dark:hover:bg-gray-700/60 transition-colors"
                [attr.aria-label]="isDarkMode ? 'Modo Día' : 'Modo Noche'">
                <ng-container *ngIf="isDarkMode; else sunIcon">
                  <!-- Luna -->
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
                  </svg>
                </ng-container>
                <ng-template #sunIcon>
                  <!-- Sol -->
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5" stroke-width="2" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 1v2m0 18v2m9-9h2M1 12H3m15.364-6.364l1.414 1.414M4.222 19.778l1.414-1.414M19.778 19.778l-1.414-1.414M4.222 4.222l1.414 1.414" />
                  </svg>
                </ng-template>
              </button>
            </div>
          </div>
        </header>
        
        <!-- Contenido Principal -->
        <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <!-- Estado de Carga -->
          <div *ngIf="loading" class="flex justify-center py-12">
            <div class="relative">
              <div class="w-16 h-16 border-4 border-orange-200/30 dark:border-orange-800/30 rounded-full"></div>
              <div class="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
          </div>
          
          <!-- Error -->
          <div *ngIf="error" class="backdrop-blur-lg bg-red-500/10 dark:bg-red-900/20 border border-red-500/20 dark:border-red-800/30 rounded-2xl p-6 mb-6 shadow-2xl">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-red-200">Error al cargar tus emprendimientos</h3>
                <div class="mt-2 text-sm text-red-300">
                  <p>{{ error }}</p>
                </div>
                <div class="mt-4">
                  <button (click)="loadEmprendimientos()" class="inline-flex items-center px-4 py-2 rounded-full bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Sin Emprendimientos -->
          <div *ngIf="!loading && !error && emprendimientos.length === 0" class="backdrop-blur-lg bg-white/10 dark:bg-gray-800/20 rounded-2xl p-12 text-center shadow-2xl border border-white/10 dark:border-gray-700/30">
            <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-400/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-2">No tienes emprendimientos</h3>
            <p class="text-gray-300">No hay emprendimientos asociados a tu cuenta.</p>
          </div>
          
          <!-- Lista de Emprendimientos -->
          <div *ngIf="!loading && !error && emprendimientos.length > 0" class="flex flex-col md:flex-row justify-between gap-10 items-stretch">
            <ng-container *ngFor="let emprendimiento of emprendimientos | slice:0:2; let i = index">
              <div class="group relative max-w-3xl w-full md:w-1/2 h-auto rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row bg-transparent animate-fade-in">
                <!-- Mitad Izquierda: Imagen -->
                <div class="relative md:w-1/2 w-full h-48 md:h-full">
                  <ng-container *ngIf="emprendimiento.sliders_principales as sliders">
                    <img *ngIf="sliders.length > 0 && sliders[0]?.url_completa" [src]="sliders[0].url_completa" [alt]="emprendimiento.nombre" class="absolute inset-0 w-full h-full object-cover" />
                    <div *ngIf="sliders.length === 0 || !sliders[0]?.url_completa" class="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800/60 to-gray-900/80 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </ng-container>
                  <!-- Overlay degradado para el texto -->
                  <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
                  <!-- Título sobre la imagen -->
                  <div class="absolute bottom-0 left-0 w-full p-6">
                    <h3 class="text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg mb-1">{{ emprendimiento.nombre }}</h3>
                    <p class="text-lg font-semibold text-orange-300 drop-shadow">{{ emprendimiento.tipo_servicio }}</p>
                  </div>
                </div>
                <!-- Mitad Derecha: Contenido -->
                <div class="md:w-1/2 w-full h-full flex flex-col justify-between bg-white/10 dark:bg-gray-900/40 backdrop-blur-2xl p-7 md:rounded-r-3xl md:rounded-l-none rounded-b-3xl md:rounded-b-none shadow-lg">
                  <div>
                    <div class="flex flex-col gap-3 text-base mb-4">
                      <div class="flex items-center gap-3">
                        <span class="w-9 h-9 flex items-center justify-center rounded-full bg-orange-400/20 text-orange-300 shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </span>
                        <span class="text-gray-200">{{ emprendimiento.ubicacion }}</span>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="w-9 h-9 flex items-center justify-center rounded-full bg-orange-400/20 text-orange-300 shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </span>
                        <span class="text-gray-200">{{ emprendimiento.email }}</span>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="w-9 h-9 flex items-center justify-center rounded-full bg-orange-400/20 text-orange-300 shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </span>
                        <span class="text-gray-200">{{ emprendimiento.telefono }}</span>
                      </div>
                    </div>
                    <!-- Badges -->
                    <div class="flex flex-wrap gap-2 mb-4">
                      <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/80 to-blue-400/80 text-white shadow-md">{{ emprendimiento.categoria }}</span>
                      <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500/80 to-green-400/80 text-white shadow-md">{{ emprendimiento.servicios?.length || 0 }} servicios</span>
                      <span class="px-3 py-1 rounded-full text-xs font-semibold" [ngClass]="emprendimiento.estado ? 'bg-gradient-to-r from-green-500/80 to-green-400/80 text-white shadow-md' : 'bg-gradient-to-r from-red-500/80 to-red-400/80 text-white shadow-md'">{{ emprendimiento.estado ? 'Activo' : 'Inactivo' }}</span>
                    </div>
                  </div>
                  <!-- Botones -->
                  <div class="grid grid-cols-2 gap-4 mt-2">
                    <a [routerLink]="['/emprendimiento', emprendimiento.id]" class="flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold shadow-lg hover:from-orange-600 hover:to-orange-500 transition-all duration-300 active:scale-95">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Editar
                    </a>
                    <a [routerLink]="['/emprendimiento', emprendimiento.id, 'servicios']" class="flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-400 text-white font-bold shadow-lg hover:from-blue-600 hover:to-blue-500 transition-all duration-300 active:scale-95">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Servicios
                    </a>
                  </div>
                  <div class="mt-4">
                    <a [routerLink]="['/emprendimiento', emprendimiento.id, 'administradores']" class="flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-700 to-gray-600 text-white font-bold shadow-lg hover:from-gray-800 hover:to-gray-700 transition-all duration-300 active:scale-95">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Administradores ({{ emprendimiento.administradores?.length || 0 }})
                    </a>
                  </div>
                </div>
              </div>
            </ng-container>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MisEmprendimientosComponent implements OnInit {
  private emprendimientosService = inject(EmprendimientosService);
  private authService = inject(AuthService);
  
  emprendimientos: Emprendimiento[] = [];
  loading = true;
  error = '';
  isDarkMode = false;
  
  ngOnInit(): void {
    this.loadEmprendimientos();
  }
  
  loadEmprendimientos(): void {
    this.loading = true;
    this.error = '';
    
    this.emprendimientosService.getMisEmprendimientos().subscribe({
      next: (data) => {
        this.emprendimientos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar emprendimientos:', err);
        this.error = err.error?.message || 'Error al cargar los emprendimientos. Inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }
  
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // La redirección la maneja el servicio de auth
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
      }
    });
  }
  
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}