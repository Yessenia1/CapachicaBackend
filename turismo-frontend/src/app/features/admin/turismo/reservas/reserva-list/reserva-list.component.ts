import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TurismoService, Reserva, PaginatedResponse } from '../../../../../core/services/turismo.service';
import { ThemeService } from '../../../../../core/services/theme.service';
import { AdminHeaderComponent } from '../../../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-reserva-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminHeaderComponent],
  template: `
    <app-admin-header 
      title="Gestionar Reservas" 
      subtitle="Panel general de administración de reservas"
    ></app-admin-header>

    <div class="container mx-auto px-2 sm:px-4 py-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Gestión de Reservas</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200" *ngIf="emprendedorId">
            Reservas para el emprendedor #{{ emprendedorId }}
          </p>
        </div>
        <div class="mt-4 sm:mt-0">
          <a
            routerLink="/admin/reservas/create"
            class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nueva Reserva
          </a>
        </div>
      </div>

      <!-- Filtros -->
      <div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm dark:shadow-gray-900 transition-colors duration-200">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label for="codigo" class="block text-sm font-medium text-gray-700 dark:text-gray-100">Código de Reserva</label>
            <div class="mt-1">
              <input
                type="text"
                id="codigo"
                [(ngModel)]="codigoReserva"
                placeholder="Código de reserva"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200"
              >
            </div>
          </div>

          <div>
            <label for="estado" class="block text-sm font-medium text-gray-700">Estado</label>
            <div class="mt-1">
              <select
                id="estado"
                [(ngModel)]="estadoReserva"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200"
              >
                <option [ngValue]="null">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
                <option value="completada">Completada</option>
              </select>
            </div>
          </div>

          <div>
            <label for="fecha" class="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
            <div class="mt-1">
              <input
                type="date"
                id="fecha"
                [(ngModel)]="fechaInicio"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-200"
              >
            </div>
          </div>

          <div class="flex items-end">
            <button
              type="button"
              (click)="applyFilters()"
              class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
              </svg>
              Filtrar
            </button>
          </div>
        </div>
      </div>

      <!-- Vista Calendario -->
      <div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm dark:shadow-gray-900 transition-colors duration-200">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">Reservas</h2>
          <a
            routerLink="/admin/reservas/calendario"
            class="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800"
          >
            <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Ver Calendario
          </a>
        </div>
      </div>

      <!-- Tabla de reservas -->
      <div class="rounded-lg bg-white shadow-sm overflow-hidden">
        @if (loading) {
          <div class="flex justify-center items-center p-8">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
            <span class="ml-4 dark:text-white transition-colors duration-200">Cargando reservas...</span>
          </div>
        } @else if (!pagination || pagination.data.length === 0) {
          <div class="p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">No se encontraron reservas</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">Comience creando una nueva reserva.</p>
            <div class="mt-6">
              <a routerLink="/admin/reservas/create" class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Nueva Reserva
              </a>
            </div>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
              <thead class="bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">Código</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">Cliente</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">Fecha Inicio</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">Fecha Fin</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">Servicios</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">Estado</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
                @for (reserva of pagination.data; track reserva.id) {
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">{{ reserva.codigo_reserva }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white transition-colors duration-200">
                        @if (reserva.usuario) {
                          {{ reserva.usuario.name }}
                        } @else {
                          <span class="text-gray-500">Desconocido</span>
                        }
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                        @if (reserva.usuario) {
                          {{ reserva.usuario.email }}
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white transition-colors duration-200">{{ formatDate(reserva.fecha_inicio) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white transition-colors duration-200">{{ formatDate(reserva.fecha_fin) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white transition-colors duration-200">{{ reserva.total_servicios || 0 }} servicios</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                            [ngClass]="{
                              'bg-yellow-100 text-yellow-800': reserva.estado === 'pendiente',
                              'bg-green-100 text-green-800': reserva.estado === 'confirmada',
                              'bg-red-100 text-red-800': reserva.estado === 'cancelada',
                              'bg-blue-100 text-blue-800': reserva.estado === 'completada'
                            }">
                        {{ getEstadoLabel(reserva.estado) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end space-x-2">
                        <a
                          [routerLink]="['/admin/reservas/detail', reserva.id]"
                          class="text-primary-600 hover:text-primary-900"
                          title="Ver detalles"
                        >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                        </a>

                        <a
                          [routerLink]="['/admin/reservas/edit', reserva.id]"
                          class="text-primary-600 hover:text-primary-900"
                          title="Editar"
                        >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </a>

                        <!-- Botón para cambiar estado -->
                        <div class="relative inline-block text-left">
                          <button
                            (click)="toggleReservaEstadoMenu(reserva)"
                            class="text-blue-600 hover:text-blue-900"
                            title="Cambiar estado"
                          >
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                            </svg>
                          </button>

                          <!-- Menú desplegable para cambiar estado -->
                          @if (reservaEstadoMenuOpen && activeReservaId === reserva.id) {
                            <div class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none z-10 transition-colors duration-200">
                              <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                <button
                                  class="text-gray-700 dark:text-gray-300 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors duration-200"
                                  role="menuitem"
                                  (click)="cambiarEstadoReserva(reserva, 'pendiente')"
                                  [disabled]="reserva.estado === 'pendiente'"
                                  [ngClass]="{'opacity-50 cursor-not-allowed': reserva.estado === 'pendiente'}"
                                >
                                  Pendiente
                                </button>
                                <button
                                  class="text-gray-700 dark:text-gray-300 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors duration-200"
                                  role="menuitem"
                                  (click)="cambiarEstadoReserva(reserva, 'confirmada')"
                                  [disabled]="reserva.estado === 'confirmada'"
                                  [ngClass]="{'opacity-50 cursor-not-allowed': reserva.estado === 'confirmada'}"
                                >
                                  Confirmada
                                </button>
                                <button
                                  class="text-gray-700 dark:text-gray-300 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors duration-200"
                                  role="menuitem"
                                  (click)="cambiarEstadoReserva(reserva, 'cancelada')"
                                  [disabled]="reserva.estado === 'cancelada'"
                                  [ngClass]="{'opacity-50 cursor-not-allowed': reserva.estado === 'cancelada'}"
                                >
                                  Cancelada
                                </button>
                                <button
                                  class="text-gray-700 dark:text-gray-300 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors duration-200"
                                  role="menuitem"
                                  (click)="cambiarEstadoReserva(reserva, 'completada')"
                                  [disabled]="reserva.estado === 'completada'"
                                  [ngClass]="{'opacity-50 cursor-not-allowed': reserva.estado === 'completada'}"
                                >
                                  Completada
                                </button>
                              </div>
                            </div>
                          }
                        </div>

                        <button
                          (click)="deleteReserva(reserva)"
                          class="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          @if (pagination) {
            <div class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 transition-colors duration-200">
              <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">
                    Mostrando <span class="font-medium">{{ pagination.from || 0 }}</span> a <span class="font-medium">{{ pagination.to || 0 }}</span> de <span class="font-medium">{{ pagination.total }}</span> resultados
                  </p>
                </div>
                <div>
                  <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      (click)="goToPage(currentPage - 1)"
                      [disabled]="!pagination.prev_page_url"
                      class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                      [class.opacity-50]="!pagination.prev_page_url"
                      [class.cursor-not-allowed]="!pagination.prev_page_url"
                    >
                      <span class="sr-only">Anterior</span>
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                      </svg>
                    </button>

                    @for (link of pagination.links; track $index) {
                      @if (link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;') {
                        <button
                          (click)="goToPage(+link.label)"
                          class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium transition-colors duration-200"
                          [class.bg-primary-50]="link.active"
                          [class.text-primary-600]="link.active"
                          [class.text-gray-700]="!link.active"
                          [class.hover:bg-gray-50]="!link.active"
                          [disabled]="link.active"
                        >
                          {{ link.label }}
                        </button>
                      }
                    }

                    <button
                      (click)="goToPage(currentPage + 1)"
                      [disabled]="!pagination.next_page_url"
                      class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      [class.opacity-50]="!pagination.next_page_url"
                      [class.cursor-not-allowed]="!pagination.next_page_url"
                    >
                      <span class="sr-only">Siguiente</span>
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class ReservaListComponent implements OnInit {
  private turismoService = inject(TurismoService);
  private route = inject(ActivatedRoute);
  private themeService = inject(ThemeService);

  pagination: PaginatedResponse<Reserva> | null = null;
  loading = true;

  // Filtros
  codigoReserva = '';
  estadoReserva: string | null = null;
  fechaInicio: string | null = null;

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;

  // Para filtrar por emprendedor
  emprendedorId: number | null = null;

  // Para menú de cambio de estado
  reservaEstadoMenuOpen = false;
  activeReservaId: number | null = null;

  isDarkMode(): boolean {
  return this.themeService.isDarkMode();
  }

  ngOnInit() {
    // Comprobar si estamos filtrando por emprendedor desde la URL
    const emprendedorIdParam = this.route.snapshot.paramMap.get('id');
    if (emprendedorIdParam) {
      this.emprendedorId = +emprendedorIdParam;
    }

    this.loadReservas();

    // Escuchar clic fuera para cerrar menú de estados
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  ngOnDestroy() {
    // Eliminar event listener al destruir el componente
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }

  handleDocumentClick(event: MouseEvent) {
    if (this.reservaEstadoMenuOpen) {
      this.reservaEstadoMenuOpen = false;
    }
  }

  loadReservas() {
    this.loading = true;

    // Preparar filtros
    const filters: any = {};

    if (this.codigoReserva) {
      filters.codigo = this.codigoReserva;
    }

    if (this.estadoReserva) {
      filters.estado = this.estadoReserva;
    }

    if (this.fechaInicio) {
      filters.fecha_inicio = this.fechaInicio;
    }

    // Si tenemos ID de emprendedor, cargar solo sus reservas
    if (this.emprendedorId) {
      this.turismoService.getReservasByEmprendedor(this.emprendedorId).subscribe({
        next: (reservas) => {
          // Adaptar el formato para que coincida con PaginatedResponse
          this.pagination = {
            current_page: 1,
            data: reservas,
            from: 1,
            to: reservas.length,
            total: reservas.length,
            per_page: reservas.length,
            last_page: 1,
            path: '',
            first_page_url: '',
            last_page_url: '',
            next_page_url: null,
            prev_page_url: null,
            links: []
          };
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar reservas por emprendedor:', error);
          this.loading = false;
        }
      });
    } else {
      // Cargar todas las reservas con paginación
      this.turismoService.getReservas(this.currentPage, this.itemsPerPage, filters).subscribe({
        next: (response) => {
          this.pagination = response;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar reservas:', error);
          this.loading = false;
        }
      });
    }
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadReservas();
  }

  toggleReservaEstadoMenu(reserva: Reserva, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    // Si ya está abierto para la misma reserva, cerrar
    if (this.reservaEstadoMenuOpen && this.activeReservaId === reserva.id) {
      this.reservaEstadoMenuOpen = false;
      this.activeReservaId = null;
    } else {
      // Abrir para esta reserva
      this.reservaEstadoMenuOpen = true;
      this.activeReservaId = reserva.id ?? null;
    }
  }

  cambiarEstadoReserva(reserva: Reserva, estado: string) {
    if (!reserva.id) return;

    // Cerrar el menú
    this.reservaEstadoMenuOpen = false;
    this.activeReservaId = null;

    // No hacer nada si ya tiene ese estado
    if (reserva.estado === estado) {
      return;
    }

    this.turismoService.cambiarEstadoReserva(reserva.id, estado).subscribe({
      next: (updated) => {
        // Actualizar la reserva en la lista
        if (this.pagination) {
          const index = this.pagination.data.findIndex(r => r.id === reserva.id);
          if (index !== -1) {
            this.pagination.data[index] = updated;
          }
        }
      },
      error: (error) => {
        console.error('Error al cambiar el estado de la reserva:', error);
        alert('Error al cambiar el estado de la reserva. Por favor, intente nuevamente.');
      }
    });
  }

  deleteReserva(reserva: Reserva) {
    if (!reserva.id) return;

    if (confirm('¿Está seguro de eliminar la reserva "' + reserva.codigo_reserva + '"? Esta acción no se puede deshacer.')) {
      this.turismoService.deleteReserva(reserva.id).subscribe({
        next: () => {
          // Recargar la lista después de eliminar
          this.loadReservas();
          alert('Reserva eliminada correctamente');
        },
        error: (error) => {
          console.error('Error al eliminar reserva:', error);
          alert('Error al eliminar la reserva. Por favor, intente nuevamente.');
        }
      });
    }
  }

  goToPage(page: number) {
    if (!this.pagination) return;

    if (page < 1 || page > this.pagination.last_page) {
      return;
    }

    this.currentPage = page;
    this.loadReservas();
  }

  // Métodos de ayuda
  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'confirmada': return 'Confirmada';
      case 'cancelada': return 'Cancelada';
      case 'completada': return 'Completada';
      default: return 'Desconocido';
    }
  }

  formatDate(dateString?: string | null): string {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}
