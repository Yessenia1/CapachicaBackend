import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarritoService } from '../../../../core/services/carrito.service';
import { ReservaServicio } from '../../../../core/services/turismo.service';

@Component({
  selector: 'app-mini-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative inline-block">
      <!-- Botón del carrito -->
      <button 
        (click)="toggleDropdown()"
        class="relative p-2 rounded-full text-gray-800 dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
        [title]="'Mi carrito de planes (' + carritoService.getTotalItems() + ')'"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0v0M17 21v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6"></path>
        </svg>
        
        <!-- Badge con número de items -->
        <span *ngIf="carritoService.getTotalItems() > 0" 
          class="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse"
        >
          {{ carritoService.getTotalItems() }}
        </span>
      </button>

      <!-- Dropdown del carrito -->
      <div 
        *ngIf="isOpen()"
        class="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden"
      >
        <!-- Header del dropdown -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Mi Carrito
            </h3>
            <button 
              (click)="closeDropdown()"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Contenido del carrito -->
        <div class="max-h-64 overflow-y-auto">
          <!-- Carrito vacío -->
          <div *ngIf="!carritoService.tieneItems()" class="p-6 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0v0M17 21v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6"></path>
            </svg>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              Tu carrito está vacío
            </p>
          </div>

          <!-- Items del carrito -->
          <div *ngIf="carritoService.tieneItems()" class="divide-y divide-gray-200 dark:divide-gray-700">
            <div 
              *ngFor="let item of carritoService.carritoItems().slice(0, 3); trackBy: trackByItemId"
              class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
            >
              <div class="flex items-start gap-3">
                <!-- Icono del servicio -->
                <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>

                <!-- Información del item -->
                <div class="flex-grow min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {{ item.servicio?.nombre || 'Servicio' }}
                  </h4>
                  <p class="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {{ item.emprendedor?.nombre }}
                  </p>
                  <div class="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{{ formatearFecha(item.fecha_inicio) }}</span>
                    <span>•</span>
                    <span>{{ item.hora_inicio }}</span>
                  </div>
                </div>

                <!-- Botón eliminar -->
                <button 
                  (click)="eliminarItem(item.id!)"
                  class="text-red-400 hover:text-red-600 p-1"
                  title="Eliminar del carrito"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Mostrar más items si hay -->
            <div *ngIf="carritoService.carritoItems().length > 3" class="p-4 text-center">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Y {{ carritoService.carritoItems().length - 3 }} más...
              </p>
            </div>
          </div>
        </div>

        <!-- Footer del dropdown -->
        <div *ngIf="carritoService.tieneItems()" class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div class="flex flex-col gap-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">Total de servicios:</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ carritoService.getTotalItems() }}</span>
            </div>
            
            <div class="flex gap-2 mt-2">
              <button 
                routerLink="/carrito"
                (click)="closeDropdown()"
                class="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Ver carrito
              </button>
              <button 
                (click)="confirmarReserva()"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>

        <!-- Footer si está vacío -->
        <div *ngIf="!carritoService.tieneItems()" class="p-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            routerLink="/servicios"
            (click)="closeDropdown()"
            class="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Explorar servicios
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay para cerrar dropdown -->
    <div 
      *ngIf="isOpen()"
      class="fixed inset-0 z-40"
      (click)="closeDropdown()"
    ></div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }
  `]
})
export class MiniCarritoComponent {
  carritoService = inject(CarritoService);
  private elementRef = inject(ElementRef);

  private readonly _isOpen = signal(false);
  readonly isOpen = this._isOpen.asReadonly();

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  toggleDropdown() {
    this._isOpen.update(value => !value);
    
    // Cargar carrito si se abre y no está cargado
    if (this._isOpen() && !this.carritoService.tieneItems()) {
      this.carritoService.obtenerCarrito().subscribe({
        error: (error) => {
          console.log('Error al cargar carrito en mini-carrito:', error);
        }
      });
    }
  }

  closeDropdown() {
    this._isOpen.set(false);
  }

  eliminarItem(itemId: number) {
    if (!itemId) return;

    this.carritoService.eliminarDelCarrito(itemId).subscribe({
      next: () => {
        // El carrito se actualiza automáticamente
      },
      error: (error) => {
        console.error('Error al eliminar item del carrito:', error);
      }
    });
  }

  confirmarReserva() {
    this.carritoService.confirmarReserva().subscribe({
      next: () => {
        this.closeDropdown();
        // Redirigir al dashboard
        window.location.href = '/dashboard?tab=reservas';
      },
      error: (error) => {
        console.error('Error al confirmar reserva:', error);
        // Abrir carrito completo para ver el error
        window.location.href = '/carrito';
      }
    });
  }

  trackByItemId(index: number, item: ReservaServicio): number {
    return item.id || index;
  }

  formatearFecha(fecha: string): string {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit'
      });
    } catch (error) {
      return fecha;
    }
  }
}