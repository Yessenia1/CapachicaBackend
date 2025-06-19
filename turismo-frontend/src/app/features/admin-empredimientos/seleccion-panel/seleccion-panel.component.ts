// src/app/features/admin-empredimientos/seleccion-panel/seleccion-panel.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-seleccion-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <!-- Fondo hero con imagen y overlay -->
      <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center">
        <div class="absolute inset-0 bg-gradient-to-br from-violet-900/80 via-blue-900/70 to-blue-800/80 backdrop-blur-md"></div>
        <!-- Detalles decorativos -->
        <div class="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-violet-400/30 to-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div class="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-violet-400/10 rounded-full blur-2xl translate-x-1/3 translate-y-1/3"></div>
      </div>
      <!-- Tarjeta central -->
      <div class="relative w-full max-w-4xl mx-auto rounded-3xl shadow-2xl border border-gradient-to-r from-violet-400/40 to-blue-400/40 bg-white/10 dark:bg-gray-900/30 backdrop-blur-2xl animate-fade-in">
        <div class="p-8 sm:p-12">
          <div class="text-center mb-10">
            <h2 class="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg animate-slide-in">Bienvenido, {{ userName }}</h2>
            <p class="text-lg text-gray-200 mt-2 animate-fade-in">Selecciona dónde quieres ir</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Opción Panel de Administración -->
            <div 
              class="group bg-white/10 dark:bg-gray-800/30 border border-gradient-to-r from-violet-400/40 to-blue-400/40 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center animate-fade-in"
              (click)="navigateTo('/dashboard')">
              <div class="flex justify-center mb-6">
                <div class="w-20 h-20 bg-gradient-to-br from-violet-200/60 to-blue-200/60 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-violet-600 dark:text-violet-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
              </div>
              <h3 class="text-xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent text-center mb-2">Panel de Administración</h3>
              <p class="text-gray-200 text-center mb-4">Accede a las funciones completas de administración con todas las herramientas del sistema.</p>
              <button class="mt-auto px-6 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold shadow-lg hover:from-violet-600 hover:to-blue-600 transition-all duration-300 active:scale-95 animate-pulse-once">Ir al Panel</button>
            </div>
            <!-- Opción Gestión de Emprendimientos -->
            <div 
              class="group bg-white/10 dark:bg-gray-800/30 border border-gradient-to-r from-blue-400/40 to-violet-400/40 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center animate-fade-in"
              (click)="navigateTo('/mis-emprendimientos')">
              <div class="flex justify-center mb-6">
                <div class="w-20 h-20 bg-gradient-to-br from-blue-200/60 to-violet-200/60 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-blue-600 dark:text-blue-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <h3 class="text-xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent text-center mb-2">Gestión de Emprendimientos</h3>
              <p class="text-gray-200 text-center mb-4">Administra tus emprendimientos, servicios y reservas de forma fácil y eficiente.</p>
              <button class="mt-auto px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold shadow-lg hover:from-blue-600 hover:to-violet-600 transition-all duration-300 active:scale-95 animate-pulse-once">Ir a Emprendimientos</button>
            </div>
          </div>
          <div class="mt-10 text-center animate-fade-in">
            <p class="text-sm text-gray-300">Puedes cambiar entre paneles en cualquier momento desde el menú lateral</p>
          </div>
        </div>
      </div>
      <!-- Botón Día/Noche -->
      <button
        (click)="toggleDarkMode()"
        class="fixed top-6 right-6 z-50 p-3 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 shadow-lg text-white hover:scale-110 transition-all duration-300"
        [attr.aria-label]="isDarkMode ? 'Modo Día' : 'Modo Noche'">
        <ng-container *ngIf="isDarkMode; else sunIcon">
          <!-- Luna -->
          <svg class="h-6 w-6 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
          </svg>
        </ng-container>
        <ng-template #sunIcon>
          <!-- Sol -->
          <svg class="h-6 w-6 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5" stroke-width="2" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 1v2m0 18v2m9-9h2M1 12H3m15.364-6.364l1.414 1.414M4.222 19.778l1.414-1.414M19.778 19.778l-1.414-1.414M4.222 4.222l1.414 1.414" />
          </svg>
        </ng-template>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SeleccionPanelComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  
  get userName(): string {
    return this.authService.currentUser()?.name || 'Usuario';
  }
  
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  isDarkMode = false;

  constructor() {
    // Mantener modo al recargar
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}