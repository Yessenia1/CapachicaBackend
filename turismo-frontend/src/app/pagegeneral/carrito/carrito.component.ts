import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarritoService } from '../../core/services/carrito.service';
import { AuthService } from '../../core/services/auth.service';
import { Reserva, ReservaServicio } from '../../core/models/user.model';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div class="container mx-auto px-4 py-8">
        <!-- Header del carrito -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mi Carrito de Planes Turísticos
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Revisa y confirma tus planes de turismo seleccionados
          </p>
        </div>

        <!-- Loading state -->
        <div *ngIf="carritoService.isLoading()" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Cargando carrito...</p>
        </div>

        <!-- Carrito vacío -->
        <div *ngIf="!carritoService.isLoading() && !carritoService.tieneItems()" 
             class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <svg class="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0v0M17 21v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6"></path>
          </svg>
          <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Tu carrito está vacío
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Explora nuestros servicios turísticos y agrega planes a tu carrito
          </p>
          <button routerLink="/servicios" 
                  class="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
            Explorar Servicios
          </button>
        </div>

        <!-- Contenido del carrito -->
        <div *ngIf="!carritoService.isLoading() && carritoService.tieneItems()" class="grid lg:grid-cols-3 gap-8">
          <!-- Lista de servicios -->
          <div class="lg:col-span-2">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                  Servicios seleccionados ({{ carritoService.totalServicios() }})
                </h2>
              </div>
              
              <div class="divide-y divide-gray-200 dark:divide-gray-700">
                <div *ngFor="let item of carritoService.carritoItems(); trackBy: trackByItemId" 
                     class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  
                  <!-- Información del servicio -->
                  <div class="flex flex-col md:flex-row md:items-start gap-4">
                    <!-- Imagen del servicio (si está disponible) -->
                    <div class="flex-shrink-0">
                      <div class="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>
                    </div>
                    
                    <!-- Detalles del servicio -->
                    <div class="flex-grow">
                      <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div class="flex-grow">
                          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            {{ item.servicio?.nombre || 'Servicio' }}
                          </h3>
                          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {{ item.emprendedor?.nombre }}
                          </p>
                          
                          <!-- Información de fecha y hora -->
                          <div class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div class="flex items-center gap-1">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                              </svg>
                              <span>{{ formatearFecha(item.fecha_inicio) }}</span>
                            </div>
                            <div class="flex items-center gap-1">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              <span>{{ item.hora_inicio }} - {{ item.hora_fin }}</span>
                            </div>
                            <div class="flex items-center gap-1">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                              </svg>
                              <span>{{ item.duracion_minutos }} minutos</span>
                            </div>
                          </div>
                          
                          <!-- Notas del cliente -->
                          <div *ngIf="item.notas_cliente" class="mt-2">
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                              <span class="font-medium">Notas:</span> {{ item.notas_cliente }}
                            </p>
                          </div>
                        </div>
                        
                        <!-- Acciones -->
                        <div class="flex items-center gap-2">
                          <button (click)="eliminarDelCarrito(item.id!)" 
                                  [disabled]="isRemoving()"
                                  class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Resumen del carrito -->
          <div class="lg:col-span-1">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm sticky top-24">
              <div class="p-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Resumen de Reserva
                </h3>
                
                <!-- Estadísticas -->
                <div class="space-y-3 mb-6">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600 dark:text-gray-400">Total de servicios:</span>
                    <span class="font-medium text-gray-900 dark:text-white">{{ carritoService.totalServicios() }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600 dark:text-gray-400">Estado:</span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Pendiente
                    </span>
                  </div>
                </div>
                
                <!-- Botones de acción -->
                <div class="space-y-3">
                  <button (click)="confirmarReserva()" 
                          [disabled]="isConfirming() || carritoService.isLoading()"
                          class="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed">
                    <span *ngIf="!isConfirming()">Confirmar Reserva</span>
                    <span *ngIf="isConfirming()" class="flex items-center justify-center gap-2">
                      <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Confirmando...
                    </span>
                  </button>
                  
                  <button (click)="vaciarCarrito()" 
                          [disabled]="isClearing() || carritoService.isLoading()"
                          class="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50">
                    <span *ngIf="!isClearing()">Vaciar Carrito</span>
                    <span *ngIf="isClearing()">Vaciando...</span>
                  </button>
                </div>
                
                <!-- Continuar comprando -->
                <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button routerLink="/servicios" 
                          class="w-full text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium transition-colors duration-200">
                    ← Continuar agregando servicios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Mensaje de error -->
        <div *ngIf="errorMessage()" 
             class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div class="flex">
            <svg class="flex-shrink-0 h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <div class="ml-3">
              <p class="text-sm text-red-800 dark:text-red-200">{{ errorMessage() }}</p>
            </div>
          </div>
        </div>
        
        <!-- Mensaje de éxito -->
        <div *ngIf="successMessage()" 
             class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div class="flex">
            <svg class="flex-shrink-0 h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="ml-3">
              <p class="text-sm text-green-800 dark:text-green-200">{{ successMessage() }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
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
    
    .sticky {
      position: sticky;
    }
  `]
})
export class CarritoComponent implements OnInit {
  carritoService = inject(CarritoService);
  private authService = inject(AuthService);
  
  // Signals para el estado del componente
  private readonly _isConfirming = signal(false);
  private readonly _isClearing = signal(false);
  private readonly _isRemoving = signal(false);
  private readonly _errorMessage = signal<string>('');
  private readonly _successMessage = signal<string>('');
  
  // Signals públicos readonly
  readonly isConfirming = this._isConfirming.asReadonly();
  readonly isClearing = this._isClearing.asReadonly();
  readonly isRemoving = this._isRemoving.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly successMessage = this._successMessage.asReadonly();

  ngOnInit() {
    // Verificar autenticación
    if (!this.authService.isLoggedIn()) {
      // Redirigir al login si no está autenticado
      window.location.href = '/login?redirect=/carrito';
      return;
    }

    // Cargar el carrito
    this.cargarCarrito();
  }

  private cargarCarrito() {
    this.carritoService.obtenerCarrito().subscribe({
      next: (carrito) => {
        console.log('Carrito cargado:', carrito);
      },
      error: (error) => {
        console.error('Error al cargar carrito:', error);
        this._errorMessage.set(error.message || 'Error al cargar el carrito');
      }
    });
  }

  eliminarDelCarrito(itemId: number) {
    if (!itemId) {
      this._errorMessage.set('ID de servicio no válido');
      return;
    }

    this._isRemoving.set(true);
    this._errorMessage.set('');
    this._successMessage.set('');

    this.carritoService.eliminarDelCarrito(itemId).subscribe({
      next: (response) => {
        this._successMessage.set('Servicio eliminado del carrito');
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => this._successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Error al eliminar del carrito:', error);
        this._errorMessage.set(error.message || 'Error al eliminar el servicio');
      },
      complete: () => {
        this._isRemoving.set(false);
      }
    });
  }

  confirmarReserva() {
    this._isConfirming.set(true);
    this._errorMessage.set('');
    this._successMessage.set('');

    this.carritoService.confirmarReserva().subscribe({
      next: (response) => {
        this._successMessage.set('¡Reserva confirmada exitosamente!');
        // Redirigir al dashboard después de 2 segundos
        setTimeout(() => {
          window.location.href = '/dashboard?tab=reservas';
        }, 2000);
      },
      error: (error) => {
        console.error('Error al confirmar reserva:', error);
        this._errorMessage.set(error.message || 'Error al confirmar la reserva');
      },
      complete: () => {
        this._isConfirming.set(false);
      }
    });
  }

  vaciarCarrito() {
    if (!confirm('¿Estás seguro de que quieres vaciar todo el carrito? Esta acción no se puede deshacer.')) {
      return;
    }

    this._isClearing.set(true);
    this._errorMessage.set('');
    this._successMessage.set('');

    this.carritoService.vaciarCarrito().subscribe({
      next: (response) => {
        this._successMessage.set('Carrito vaciado exitosamente');
      },
      error: (error) => {
        console.error('Error al vaciar carrito:', error);
        this._errorMessage.set(error.message || 'Error al vaciar el carrito');
      },
      complete: () => {
        this._isClearing.set(false);
      }
    });
  }

  // Función para trackear items en ngFor
  trackByItemId(index: number, item: ReservaServicio): number {
    return item.id || index;
  }

  // Función para formatear fechas
  formatearFecha(fecha: string): string {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return fecha;
    }
  }

  // Limpiar mensajes cuando se navega
  private limpiarMensajes() {
    this._errorMessage.set('');
    this._successMessage.set('');
  }
}