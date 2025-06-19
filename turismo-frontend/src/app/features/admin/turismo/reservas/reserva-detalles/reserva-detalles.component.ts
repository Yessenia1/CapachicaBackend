import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TurismoService, Reserva, ReservaServicio } from '../../../../../core/services/turismo.service';

@Component({
  selector: 'app-reserva-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Detalle de Reserva</h1>
          @if (reserva) {
            <p class="mt-1 text-sm text-gray-500">
              Código: <span class="font-medium">{{ reserva.codigo_reserva }}</span>
            </p>
          }
        </div>
        <div class="mt-4 sm:mt-0 flex space-x-3">
          @if (reserva) {
            <a 
              [routerLink]="['/admin/reservas/edit', reserva.id]" 
              class="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-primary-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Editar
            </a>
          }
          <a 
            routerLink="/admin/reservas" 
            class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver
          </a>
        </div>
      </div>
      
      @if (loading) {
        <div class="rounded-lg bg-white p-6 shadow-sm">
          <div class="flex justify-center items-center p-8">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
            <span class="ml-4">Cargando información de la reserva...</span>
          </div>
        </div>
      } @else if (!reserva) {
        <div class="rounded-lg bg-white p-6 shadow-sm">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Reserva no encontrada</h3>
            <p class="mt-1 text-sm text-gray-500">
              La reserva que estás buscando no existe o ha sido eliminada.
            </p>
            <div class="mt-6">
              <a 
                routerLink="/admin/reservas" 
                class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Volver a la lista de reservas
              </a>
            </div>
          </div>
        </div>
      } @else {
        <!-- Información principal de la reserva -->
        <div class="rounded-lg bg-white p-6 shadow-sm">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2">
              <h2 class="text-lg font-medium text-gray-900">Información de la Reserva</h2>
              
              <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Cliente</h3>
                  <p class="mt-1 text-sm text-gray-900">
                    @if (reserva.usuario) {
                      {{ reserva.usuario.name }}
                      <span class="block text-xs text-gray-500">{{ reserva.usuario.email }}</span>
                    } @else {
                      <span class="text-gray-500">Cliente no registrado</span>
                    }
                  </p>
                </div>
                
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Estado</h3>
                  <div class="mt-1 flex items-center">
                    <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" 
                          [ngClass]="{
                            'bg-yellow-100 text-yellow-800': reserva.estado === 'pendiente',
                            'bg-green-100 text-green-800': reserva.estado === 'confirmada',
                            'bg-red-100 text-red-800': reserva.estado === 'cancelada',
                            'bg-blue-100 text-blue-800': reserva.estado === 'completada'
                          }">
                      {{ getEstadoLabel(reserva.estado) }}
                    </span>
                    
                    <!-- Botón para cambiar estado -->
                    <div class="relative ml-2">
                      <button 
                        (click)="toggleEstadoMenu($event)"
                        class="text-gray-500 hover:text-gray-700"
                        title="Cambiar estado"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </button>
                      
                      <!-- Menú desplegable para cambiar estado -->
                      @if (estadoMenuOpen) {
                        <div class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                          <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            <button 
                              class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left" 
                              role="menuitem"
                              (click)="cambiarEstado('pendiente')"
                              [disabled]="reserva.estado === 'pendiente'"
                              [ngClass]="{'opacity-50 cursor-not-allowed': reserva.estado === 'pendiente'}"
                            >
                              Pendiente
                            </button>
                            <button 
                              class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left" 
                              role="menuitem"
                              (click)="cambiarEstado('confirmada')"
                              [disabled]="reserva.estado === 'confirmada'"
                              [ngClass]="{'opacity-50 cursor-not-allowed': reserva.estado === 'confirmada'}"
                            >
                              Confirmada
                            </button>
                            <button 
                              class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left" 
                              role="menuitem"
                              (click)="cambiarEstado('cancelada')"
                              [disabled]="reserva.estado === 'cancelada'"
                              [ngClass]="{'opacity-50 cursor-not-allowed': reserva.estado === 'cancelada'}"
                            >
                              Cancelada
                            </button>
                            <button 
                              class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left" 
                              role="menuitem"
                              (click)="cambiarEstado('completada')"
                              [disabled]="reserva.estado === 'completada'"
                              [ngClass]="{'opacity-50 cursor-not-allowed': reserva.estado === 'completada'}"
                            >
                              Completada
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Fecha de Reserva</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ formatDate(reserva.created_at) }}</p>
                </div>
                
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Servicios Reservados</h3>
                  <p class="mt-1 text-sm text-gray-900">{{ reserva.servicios?.length || 0 }} servicios</p>
                </div>
              </div>
              
              @if (reserva.notas) {
                <div class="mt-4">
                  <h3 class="text-sm font-medium text-gray-500">Notas</h3>
                  <p class="mt-1 text-sm text-gray-900 whitespace-pre-line">{{ reserva.notas }}</p>
                </div>
              }
              
              <!-- Acciones -->
              <div class="mt-6 flex space-x-3">
                <button 
                  (click)="imprimirReserva()"
                  class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                  </svg>
                  Imprimir
                </button>
                <button 
                  (click)="showDeleteConfirmation = true"
                  class="inline-flex items-center rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Eliminar
                </button>
              </div>
            </div>
            
            <!-- Panel lateral con datos adicionales -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider">Resumen</h3>
              
              <dl class="mt-4 grid grid-cols-1 gap-4">
                <div class="bg-white rounded-lg p-4 shadow-sm">
                  <dt class="text-sm font-medium text-gray-500">Periodo de Reserva</dt>
                  <dd class="mt-1 text-sm font-semibold text-gray-900">
                    {{ formatDate(reserva.fecha_inicio) }} 
                    @if (reserva.fecha_fin && reserva.fecha_inicio !== reserva.fecha_fin) {
                      — {{ formatDate(reserva.fecha_fin) }}
                    }
                  </dd>
                </div>
                
                @if (totalReserva > 0) {
                  <div class="bg-white rounded-lg p-4 shadow-sm">
                    <dt class="text-sm font-medium text-gray-500">Total</dt>
                    <dd class="mt-1 text-xl font-semibold text-gray-900">S/. {{ totalReserva.toFixed(2) }}</dd>
                  </div>
                }
              </dl>
            </div>
          </div>
        </div>
        
        <!-- Servicios reservados -->
        <div class="rounded-lg bg-white shadow-sm overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Servicios Reservados</h2>
          </div>
          
          @if (!reserva.servicios || reserva.servicios.length === 0) {
            <div class="p-8 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No hay servicios reservados</h3>
              <div class="mt-6">
                <a 
                  [routerLink]="['/admin/reservas/edit', reserva.id]" 
                  class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Añadir servicios
                </a>
              </div>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emprendedor</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horario</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (servicio of reserva.servicios; track servicio.id) {
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">
                          @if (servicio.servicio) {
                            {{ servicio.servicio.nombre }}
                          } @else {
                            <span class="text-gray-500">Servicio no disponible</span>
                          }
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">
                          @if (servicio.emprendedor) {
                            {{ servicio.emprendedor.nombre }}
                          } @else {
                            <span class="text-gray-500">Emprendedor no disponible</span>
                          }
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ formatDate(servicio.fecha_inicio) }}</div>
                        @if (servicio.fecha_fin && servicio.fecha_inicio !== servicio.fecha_fin) {
                          <div class="text-xs text-gray-500">hasta {{ formatDate(servicio.fecha_fin) }}</div>
                        }
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">
                          {{ formatTime(servicio.hora_inicio) }} - {{ formatTime(servicio.hora_fin) }}
                        </div>
                        <div class="text-xs text-gray-500">
                          {{ servicio.duracion_minutos }} min.
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" 
                              [ngClass]="getEstadoServicioClass(servicio.estado)">
                          {{ getEstadoServicioLabel(servicio.estado) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        S/. {{ servicio.precio?.toFixed(2) || '0.00' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="relative inline-block text-left">
                          <button 
                            (click)="toggleServicioEstadoMenu(servicio, $event)"
                            class="text-primary-600 hover:text-primary-900"
                            title="Cambiar estado"
                          >
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                            </svg>
                          </button>
                          
                          <!-- Menú desplegable para cambiar estado -->
                          @if (servicioEstadoMenuOpen && activeServicioId === servicio.id) {
                            <div class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                              <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                <button 
                                  class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left" 
                                  role="menuitem"
                                  (click)="cambiarEstadoServicio(servicio, 'pendiente')"
                                  [disabled]="servicio.estado === 'pendiente'"
                                  [ngClass]="{'opacity-50 cursor-not-allowed': servicio.estado === 'pendiente'}"
                                >
                                  Pendiente
                                </button>
                                <button 
                                  class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left" 
                                  role="menuitem"
                                  (click)="cambiarEstadoServicio(servicio, 'confirmado')"
                                  [disabled]="servicio.estado === 'confirmado'"
                                  [ngClass]="{'opacity-50 cursor-not-allowed': servicio.estado === 'confirmado'}"
                                >
                                  Confirmado
                                </button>
                                <button 
                                  class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left" 
                                  role="menuitem"
                                  (click)="cambiarEstadoServicio(servicio, 'cancelado')"
                                  [disabled]="servicio.estado === 'cancelado'"
                                  [ngClass]="{'opacity-50 cursor-not-allowed': servicio.estado === 'cancelado'}"
                                >
                                  Cancelado
                                </button>
                                <button 
                                  class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left" 
                                  role="menuitem"
                                  (click)="cambiarEstadoServicio(servicio, 'completado')"
                                  [disabled]="servicio.estado === 'completado'"
                                  [ngClass]="{'opacity-50 cursor-not-allowed': servicio.estado === 'completado'}"
                                >
                                  Completado
                                </button>
                              </div>
                            </div>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
                <tfoot class="bg-gray-50">
                  <tr>
                    <td colspan="5" class="px-6 py-3 text-right text-sm font-medium text-gray-900">Total:</td>
                    <td class="px-6 py-3 text-right text-sm font-medium text-gray-900">S/. {{ totalReserva.toFixed(2) }}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          }
        </div>
        
        <!-- Historial de cambios (opcional) -->
        <div class="rounded-lg bg-white shadow-sm overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Historial de Cambios</h2>
          </div>
          
          <div class="p-6">
            <div class="flow-root">
              <ul class="-mb-8">
                <!-- Cambio de creación (siempre existe) -->
                <li>
                  <div class="relative pb-8">
                    <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    <div class="relative flex space-x-3">
                      <div>
                        <span class="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                          <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          </svg>
                        </span>
                      </div>
                      <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p class="text-sm text-gray-500">Reserva creada con estado <span class="font-medium text-gray-900">Pendiente</span></p>
                        </div>
                        <div class="text-right text-sm whitespace-nowrap text-gray-500">
                          {{ formatDate(reserva.created_at) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                
                <li>
                  <div class="relative pb-8">
                    <div class="relative flex space-x-3">
                      <div>
                        <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </span>
                      </div>
                      <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p class="text-sm text-gray-500">Estado actual <span class="font-medium text-gray-900">{{ getEstadoLabel(reserva.estado) }}</span></p>
                        </div>
                        <div class="text-right text-sm whitespace-nowrap text-gray-500">
                          {{ formatDate(reserva.updated_at) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Modal de confirmación para eliminar -->
        @if (showDeleteConfirmation) {
          <div class="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="showDeleteConfirmation = false"></div>
            
            <div class="relative bg-white rounded-lg p-6 max-w-md w-full mx-auto shadow-xl">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">Eliminar Reserva</h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      ¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  (click)="eliminarReserva()"
                >
                  Eliminar
                </button>
                <button 
                  type="button" 
                  class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                  (click)="showDeleteConfirmation = false"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class ReservaDetailComponent implements OnInit {
  private turismoService = inject(TurismoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  // Propiedades
  reservaId: number = 0;
  reserva: Reserva | null = null;
  loading = true;
  totalReserva = 0;
  
  // Estado de UI
  estadoMenuOpen = false;
  servicioEstadoMenuOpen = false;
  activeServicioId: number | null = null;
  showDeleteConfirmation = false;
  
  ngOnInit() {
    // Escuchar clic fuera para cerrar menús
    document.addEventListener('click', this.handleDocumentClick.bind(this));
    
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.reservaId = +idParam;
      this.cargarReserva();
    } else {
      this.loading = false;
    }
  }
  
  ngOnDestroy() {
    // Eliminar event listener al destruir el componente
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }
  
  handleDocumentClick(event: MouseEvent) {
    // Cerrar menús al hacer clic fuera
    if (this.estadoMenuOpen || this.servicioEstadoMenuOpen) {
      this.estadoMenuOpen = false;
      this.servicioEstadoMenuOpen = false;
      this.activeServicioId = null;
    }
  }
  
  cargarReserva() {
    this.loading = true;
    this.turismoService.getReserva(this.reservaId).subscribe({
      next: (reserva) => {
        this.reserva = reserva;
        this.calcularTotal();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar la reserva:', error);
        this.loading = false;
      }
    });
  }
  
  calcularTotal() {
    if (this.reserva && this.reserva.servicios) {
      this.totalReserva = this.reserva.servicios.reduce((total, servicio) => {
        return total + (servicio.precio || 0);
      }, 0);
    }
  }
  
  toggleEstadoMenu(event: Event) {
    event.stopPropagation();
    this.estadoMenuOpen = !this.estadoMenuOpen;
    this.servicioEstadoMenuOpen = false;
    this.activeServicioId = null;
  }
  
  toggleServicioEstadoMenu(servicio: ReservaServicio, event: Event) {
    event.stopPropagation();
    
    // Si ya está abierto para este servicio, cerrar
    if (this.servicioEstadoMenuOpen && this.activeServicioId === servicio.id) {
      this.servicioEstadoMenuOpen = false;
      this.activeServicioId = null;
    } else {
      // Abrir para este servicio
      this.servicioEstadoMenuOpen = true;
      this.activeServicioId = servicio.id ?? null;
      this.estadoMenuOpen = false;
    }
  }
  
  cambiarEstado(estado: string) {
    if (!this.reserva || !this.reserva.id) return;
    
    this.estadoMenuOpen = false;
    
    // No hacer nada si ya tiene ese estado
    if (this.reserva.estado === estado) {
      return;
    }
    
    this.turismoService.cambiarEstadoReserva(this.reserva.id, estado).subscribe({
      next: (reservaActualizada) => {
        this.reserva = reservaActualizada;
      },
      error: (error) => {
        console.error('Error al cambiar el estado de la reserva:', error);
        alert('Error al cambiar el estado de la reserva. Por favor, intente nuevamente.');
      }
    });
  }
  
  cambiarEstadoServicio(servicio: ReservaServicio, estado: string) {
    if (!servicio.id) return;
    
    this.servicioEstadoMenuOpen = false;
    this.activeServicioId = null;
    
    // No hacer nada si ya tiene ese estado
    if (servicio.estado === estado) {
      return;
    }
    
    this.turismoService.cambiarEstadoServicioReserva(servicio.id, estado).subscribe({
      next: (servicioActualizado) => {
        // Actualizar el servicio en la lista
        if (this.reserva && this.reserva.servicios) {
          const index = this.reserva.servicios.findIndex(s => s.id === servicio.id);
          if (index !== -1) {
            this.reserva.servicios[index] = servicioActualizado;
          }
        }
      },
      error: (error) => {
        console.error('Error al cambiar el estado del servicio:', error);
        alert('Error al cambiar el estado del servicio. Por favor, intente nuevamente.');
      }
    });
  }
  
  eliminarReserva() {
    if (!this.reserva || !this.reserva.id) return;
    
    this.turismoService.deleteReserva(this.reserva.id).subscribe({
      next: () => {
        this.showDeleteConfirmation = false;
        this.router.navigate(['/admin/reservas']);
        alert('Reserva eliminada correctamente');
      },
      error: (error) => {
        console.error('Error al eliminar la reserva:', error);
        this.showDeleteConfirmation = false;
        alert('Error al eliminar la reserva. Por favor, intente nuevamente.');
      }
    });
  }
  
  imprimirReserva() {
    window.print();
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
  
  getEstadoServicioLabel(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'confirmado': return 'Confirmado';
      case 'cancelado': return 'Cancelado';
      case 'completado': return 'Completado';
      default: return 'Desconocido';
    }
  }
  
  getEstadoServicioClass(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      case 'completado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  formatDate(dateString?: string | null): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  formatTime(timeString?: string): string {
    if (!timeString) return 'N/A';
    // Convertir de formato "HH:MM:SS" a "HH:MM"
    return timeString.substring(0, 5);
  }
}