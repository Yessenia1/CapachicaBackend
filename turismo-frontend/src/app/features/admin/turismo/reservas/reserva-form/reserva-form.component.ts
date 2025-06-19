import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TurismoService, Reserva, Servicio, ReservaServicio, Emprendedor } from '../../../../../core/services/turismo.service';
import { ThemeService } from '../../../../../core/services/theme.service';

@Component({
  selector: 'app-reserva-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="space-y-6 transition-colors duration-300">
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{{ isEditMode ? 'Editar' : 'Crear' }} Reserva</h1>
          <p class="mt-1 text-sm text-gray-500">
            {{ isEditMode ? 'Actualice la información de la reserva' : 'Complete el formulario para crear una nueva reserva' }}
          </p>
        </div>
        <div class="mt-4 sm:mt-0">
          <a
            routerLink="/admin/reservas"
            class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-300"
          >
            <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver
          </a>
        </div>
      </div>

      @if (loading) {
        <div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm transition-colors duration-300">
          <div class="flex justify-center items-center p-8">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
            <span class="ml-4">Cargando...</span>
          </div>
        </div>
      } @else {
        <form [formGroup]="reservaForm" (ngSubmit)="submitForm()" class="space-y-6">
          <div class="rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden transition-colors duration-300">
            <div class="p-6 space-y-6">
              <!-- Información básica de la reserva -->
              <div>
                <h2 class="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">Información de la Reserva</h2>
                <div class="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <!-- Estado de la reserva -->
                  <div class="sm:col-span-2">
                    <label for="estado" class="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Estado</label>
                    <div class="mt-1">
                      <select
                        id="estado"
                        formControlName="estado"
                        class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-300"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="cancelada">Cancelada</option>
                        <option value="completada">Completada</option>
                      </select>
                    </div>
                  </div>

                  <!-- Código de reserva (solo lectura si es edición) -->
                  <div class="sm:col-span-2">
                    <label for="codigo_reserva" class="block text-sm font-medium text-gray-700">Código de Reserva</label>
                    <div class="mt-1">
                      <input
                        type="text"
                        id="codigo_reserva"
                        formControlName="codigo_reserva"
                        [readonly]="isEditMode"
                        class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-300"
                        [ngClass]="{'bg-gray-100 dark:bg-gray-600': isEditMode}"
                      >
                    </div>
                    @if (reservaForm.get('codigo_reserva')?.errors?.['required'] && reservaForm.get('codigo_reserva')?.touched) {
                      <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">El código de reserva es obligatorio</p>
                    }
                  </div>

                  <!-- Usuario (Cliente) -->
                  <div class="sm:col-span-2">
                    <label for="usuario_id" class="block text-sm font-medium text-gray-700">Cliente</label>
                    <div class="mt-1">
                      <select
                        id="usuario_id"
                        formControlName="usuario_id"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        <option value="">Seleccionar cliente</option>
                        @for (usuario of usuarios; track usuario.id) {
                          <option [value]="usuario.id">{{ usuario.name }} ({{ usuario.email }})</option>
                        }
                      </select>
                    </div>
                    @if (reservaForm.get('usuario_id')?.errors?.['required'] && reservaForm.get('usuario_id')?.touched) {
                      <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">El cliente es obligatorio</p>
                    }
                  </div>

                  <!-- Notas generales -->
                  <div class="sm:col-span-6">
                    <label for="notas" class="block text-sm font-medium text-gray-700">Notas</label>
                    <div class="mt-1">
                      <textarea
                        id="notas"
                        formControlName="notas"
                        rows="3"
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Notas adicionales sobre la reserva..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Servicios de la reserva -->
              <div class="pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <div class="flex justify-between items-center">
                  <h2 class="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">Servicios Reservados</h2>
                  <button
                    type="button"
                    (click)="addServicio()"
                    class="inline-flex items-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    <svg class="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Añadir Servicio
                  </button>
                </div>

                @if (serviciosArray.controls.length === 0) {
                  <div class="mt-4 rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-4 transition-colors duration-300">
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                      </div>
                      <div class="ml-3">
                        <h3 class="text-sm font-medium text-yellow-800">Añada al menos un servicio</h3>
                        <div class="mt-2 text-sm text-yellow-700">
                          <p>Debe añadir al menos un servicio a la reserva.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                } @else {
                  <!-- Lista de servicios -->
                  <div class="mt-4 space-y-4">
                    @for (control of serviciosArray.controls; track i; let i = $index) {
                      <div [formGroup]="getServicioFormGroup(i)" class="border border-gray-200 rounded-md p-4">
                        <div class="flex justify-between">
                          <h3 class="text-md font-medium text-gray-900">Servicio #{{ i + 1 }}</h3>
                          <button
                            type="button"
                            (click)="removeServicio(i)"
                            class="text-red-600 hover:text-red-900"
                            title="Eliminar servicio"
                          >
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </div>

                        <div class="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <!-- Selección de servicio -->
                          <div class="sm:col-span-3">
                            <label [for]="'servicio_id-' + i" class="block text-sm font-medium text-gray-700">Servicio</label>
                            <div class="mt-1">
                              <select
                                [id]="'servicio_id-' + i"
                                formControlName="servicio_id"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                (change)="onServicioChange(i)"
                              >
                                <option value="">Seleccionar servicio</option>
                                @for (servicio of serviciosDisponibles; track servicio.id) {
                                  <option [value]="servicio.id">{{ servicio.nombre }}</option>
                                }
                              </select>
                            </div>
                            @if (getServicioFormGroup(i).get('servicio_id')?.errors?.['required'] && getServicioFormGroup(i).get('servicio_id')?.touched) {
                              <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">El servicio es obligatorio</p>
                            }
                          </div>

                          <!-- Emprendedor (se actualiza automáticamente al seleccionar servicio) -->
                          <div class="sm:col-span-3">
                            <label [for]="'emprendedor_id-' + i" class="block text-sm font-medium text-gray-700">Emprendedor</label>
                            <div class="mt-1">
                              <select
                                [id]="'emprendedor_id-' + i"
                                formControlName="emprendedor_id"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                [attr.disabled]="true"
                              >
                                <option value="">Seleccionar emprendedor</option>
                                @for (emprendedor of emprendedores; track emprendedor.id) {
                                  <option [value]="emprendedor.id">{{ emprendedor.nombre }}</option>
                                }
                              </select>
                            </div>
                          </div>

                          <!-- Fecha de inicio -->
                          <div class="sm:col-span-2">
                            <label [for]="'fecha_inicio-' + i" class="block text-sm font-medium text-gray-700">Fecha de inicio</label>
                            <div class="mt-1">
                              <input
                                type="date"
                                [id]="'fecha_inicio-' + i"
                                formControlName="fecha_inicio"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                (change)="onFechaHoraChange(i)"
                              >
                            </div>
                            @if (getServicioFormGroup(i).get('fecha_inicio')?.errors?.['required'] && getServicioFormGroup(i).get('fecha_inicio')?.touched) {
                              <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">La fecha de inicio es obligatoria</p>
                            }
                          </div>

                          <!-- Fecha de fin (opcional) -->
                          <div class="sm:col-span-2">
                            <label [for]="'fecha_fin-' + i" class="block text-sm font-medium text-gray-700">Fecha de fin (opcional)</label>
                            <div class="mt-1">
                              <input
                                type="date"
                                [id]="'fecha_fin-' + i"
                                formControlName="fecha_fin"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                [min]="getServicioFormGroup(i).get('fecha_inicio')?.value"
                                (change)="onFechaHoraChange(i)"
                              >
                            </div>
                          </div>

                          <!-- Estado del servicio -->
                          <div class="sm:col-span-2">
                            <label [for]="'estado-servicio-' + i" class="block text-sm font-medium text-gray-700">Estado</label>
                            <div class="mt-1">
                              <select
                                [id]="'estado-servicio-' + i"
                                formControlName="estado"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                              >
                                <option value="pendiente">Pendiente</option>
                                <option value="confirmado">Confirmado</option>
                                <option value="cancelado">Cancelado</option>
                                <option value="completado">Completado</option>
                              </select>
                            </div>
                          </div>

                          <!-- Hora de inicio -->
                          <div class="sm:col-span-2">
                            <label [for]="'hora_inicio-' + i" class="block text-sm font-medium text-gray-700">Hora de inicio</label>
                            <div class="mt-1">
                              <input
                                type="time"
                                [id]="'hora_inicio-' + i"
                                formControlName="hora_inicio"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                (change)="onFechaHoraChange(i)"
                              >
                            </div>
                            @if (getServicioFormGroup(i).get('hora_inicio')?.errors?.['required'] && getServicioFormGroup(i).get('hora_inicio')?.touched) {
                              <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">La hora de inicio es obligatoria</p>
                            }
                          </div>

                          <!-- Hora de fin -->
                          <div class="sm:col-span-2">
                            <label [for]="'hora_fin-' + i" class="block text-sm font-medium text-gray-700">Hora de fin</label>
                            <div class="mt-1">
                              <input
                                type="time"
                                [id]="'hora_fin-' + i"
                                formControlName="hora_fin"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                (change)="onFechaHoraChange(i)"
                              >
                            </div>
                            @if (getServicioFormGroup(i).get('hora_fin')?.errors?.['required'] && getServicioFormGroup(i).get('hora_fin')?.touched) {
                              <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">La hora de fin es obligatoria</p>
                            }

                            @if (getServicioFormGroup(i).get('hora_fin')?.value &&
                                 getServicioFormGroup(i).get('hora_inicio')?.value &&
                                 getServicioFormGroup(i).get('hora_fin')?.value <= getServicioFormGroup(i).get('hora_inicio')?.value) {
                              <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">La hora de fin debe ser posterior a la hora de inicio</p>
                            }
                          </div>

                          <!-- Duración (en minutos) -->
                          <div class="sm:col-span-2">
                            <label [for]="'duracion_minutos-' + i" class="block text-sm font-medium text-gray-700">Duración (minutos)</label>
                            <div class="mt-1">
                              <input
                                type="number"
                                [id]="'duracion_minutos-' + i"
                                formControlName="duracion_minutos"
                                min="1"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                              >
                            </div>
                            @if (getServicioFormGroup(i).get('duracion_minutos')?.errors?.['required'] && getServicioFormGroup(i).get('duracion_minutos')?.touched) {
                              <p class="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">La duración es obligatoria</p>
                            }
                          </div>

                          <!-- Cantidad -->
                          <div class="sm:col-span-2">
                            <label [for]="'cantidad-' + i" class="block text-sm font-medium text-gray-700">Cantidad</label>
                            <div class="mt-1">
                              <input
                                type="number"
                                [id]="'cantidad-' + i"
                                formControlName="cantidad"
                                min="1"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                              >
                            </div>
                          </div>

                          <!-- Precio -->
                          <div class="sm:col-span-2">
                            <label [for]="'precio-' + i" class="block text-sm font-medium text-gray-700">Precio</label>
                            <div class="mt-1 relative rounded-md shadow-sm">
                              <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                                <span class="text-gray-500 sm:text-sm">S/.</span>
                              </div>
                              <input
                                type="number"
                                [id]="'precio-' + i"
                                formControlName="precio"
                                min="0"
                                step="0.01"
                                class="block w-full pl-9 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                              >
                            </div>
                          </div>

                          <!-- Notas del cliente -->
                          <div class="sm:col-span-3">
                            <label [for]="'notas_cliente-' + i" class="block text-sm font-medium text-gray-700">Notas del cliente</label>
                            <div class="mt-1">
                              <textarea
                                [id]="'notas_cliente-' + i"
                                formControlName="notas_cliente"
                                rows="2"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                placeholder="Notas o solicitudes especiales..."
                              ></textarea>
                            </div>
                          </div>

                          <!-- Notas del emprendedor -->
                          <div class="sm:col-span-3">
                            <label [for]="'notas_emprendedor-' + i" class="block text-sm font-medium text-gray-700">Notas del emprendedor</label>
                            <div class="mt-1">
                              <textarea
                                [id]="'notas_emprendedor-' + i"
                                formControlName="notas_emprendedor"
                                rows="2"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                placeholder="Notas internas del emprendedor..."
                              ></textarea>
                            </div>
                          </div>

                          <!-- Indicador de disponibilidad -->
                          <div class="sm:col-span-6">
                            @if (verificandoDisponibilidad[i]) {
                              <div class="flex items-center text-gray-500">
                                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24">
                                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Verificando disponibilidad...
                              </div>
                            } @else if (disponibilidadVerificada[i]) {
                              @if (servicioDisponible[i]) {
                                <div class="flex items-center text-green-600">
                                  <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                                  Servicio disponible en la fecha y horario seleccionados
                                </div>
                              } @else {
                                <div class="flex items-center text-red-600">
                                  <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                                  El servicio no está disponible en la fecha y horario seleccionados
                                </div>
                              }
                            }
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 text-right sm:px-6 transition-colors duration-300">
              <button
                type="button"
                (click)="cancel()"
                class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mr-2 transition-colors duration-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="reservaForm.invalid || hayServiciosNoDisponibles() || isSubmitting || numServiciosVerificados() !== serviciosArray.length"
                class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                [class.opacity-50]="reservaForm.invalid || hayServiciosNoDisponibles() || isSubmitting || numServiciosVerificados() !== serviciosArray.length"
                [class.cursor-not-allowed]="reservaForm.invalid || hayServiciosNoDisponibles() || isSubmitting || numServiciosVerificados() !== serviciosArray.length"
              >
                <ng-container *ngIf="isSubmitting; else textoNormal">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </ng-container>
                <ng-template #textoNormal>
                  {{ isEditMode ? 'Actualizar' : 'Crear' }} Reserva
                </ng-template>
              </button>
            </div>
          </div>
        </form>
      }
    </div>
  `,
})
export class ReservaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private turismoService = inject(TurismoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  reservaForm!: FormGroup;
  reserva: Reserva | null = null;

  // Listas para selección
  serviciosDisponibles: Servicio[] = [];
  emprendedores: Emprendedor[] = [];
  usuarios: any[] = []; // Lista de usuarios para asignar como clientes

  // Estado del componente
  loading = true;
  isSubmitting = false;
  isEditMode = false;
  reservaId: number | null = null;
  servicioPreseleccionadoId: number | null = null;

  // Para control de disponibilidad
  verificandoDisponibilidad: {[index: number]: boolean} = {};
  disponibilidadVerificada: {[index: number]: boolean} = {};
  servicioDisponible: {[index: number]: boolean} = {};

  ngOnInit() {
    this.initForm();
    this.loadServicios();
    this.loadEmprendedores();
    this.loadUsuarios();

    // Verificar si es modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.reservaId = +id;
      this.loadReserva(this.reservaId);
    } else {
      // Si viene con servicio preseleccionado por query param
      const servicioId = this.route.snapshot.queryParams['servicio_id'];
      if (servicioId) {
        this.servicioPreseleccionadoId = +servicioId;
      }

      // Generar código de reserva aleatorio
      this.reservaForm.patchValue({
        codigo_reserva: this.generarCodigoReserva()
      });

      this.loading = false;

      // Si hay servicio preseleccionado, añadirlo automáticamente
      if (this.servicioPreseleccionadoId) {
        this.addServicio(this.servicioPreseleccionadoId);
      }
    }
  }

  initForm() {
    this.reservaForm = this.fb.group({
      usuario_id: ['', [Validators.required]],
      codigo_reserva: ['', [Validators.required]],
      estado: ['pendiente', [Validators.required]],
      notas: [''],
      servicios: this.fb.array([])
    });
  }

  get serviciosArray(): FormArray {
    return this.reservaForm.get('servicios') as FormArray;
  }

  getServicioFormGroup(index: number): FormGroup {
    return this.serviciosArray.at(index) as FormGroup;
  }

  createServicioFormGroup(reservaServicio?: ReservaServicio): FormGroup {
    const fechaActual = new Date().toISOString().split('T')[0];
    const horaActual = new Date().toTimeString().slice(0, 8);

    return this.fb.group({
      id: [reservaServicio?.id || null],
      servicio_id: [reservaServicio?.servicio_id || this.servicioPreseleccionadoId || '', [Validators.required]],
      emprendedor_id: [reservaServicio?.emprendedor_id || '', [Validators.required]],
      fecha_inicio: [reservaServicio?.fecha_inicio || fechaActual, [Validators.required]],
      fecha_fin: [reservaServicio?.fecha_fin || null],
      hora_inicio: [reservaServicio?.hora_inicio || horaActual, [Validators.required]],
      hora_fin: [reservaServicio?.hora_fin || this.sumarHoras(horaActual, 1), [Validators.required]],
      duracion_minutos: [reservaServicio?.duracion_minutos || 60, [Validators.required, Validators.min(1)]],
      cantidad: [reservaServicio?.cantidad || 1, [Validators.min(1)]],
      precio: [reservaServicio?.precio || 0, [Validators.min(0)]],
      estado: [reservaServicio?.estado || 'pendiente', [Validators.required]],
      notas_cliente: [reservaServicio?.notas_cliente || ''],
      notas_emprendedor: [reservaServicio?.notas_emprendedor || '']
    });
  }

  loadReserva(id: number) {
    this.loading = true;
    this.turismoService.getReserva(id).subscribe({
      next: (reserva) => {
        this.reserva = reserva;

        // Llenar el formulario con los datos de la reserva
        this.reservaForm.patchValue({
          usuario_id: reserva.usuario_id,
          codigo_reserva: reserva.codigo_reserva,
          estado: reserva.estado,
          notas: reserva.notas
        });

        // Cargar servicios de la reserva
        if (reserva.servicios && reserva.servicios.length > 0) {
          reserva.servicios.forEach((servicio, index) => {
            this.addServicio(undefined, servicio);
            // Marcar como verificado y disponible (ya que existe)
            this.disponibilidadVerificada[index] = true;
            this.servicioDisponible[index] = true;
            this.verificandoDisponibilidad[index] = false;
          });
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar reserva:', error);
        this.loading = false;
        alert("Error al cargar la reserva. Por favor, intente nuevamente.");
      }
    });
  }

  loadServicios() {
    this.turismoService.getServicios(1, 1000).subscribe({
      next: (response) => {
        this.serviciosDisponibles = response.data;
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
      }
    });
  }

  loadEmprendedores() {
    this.turismoService.getEmprendedores(1, 1000).subscribe({
      next: (response) => {
        this.emprendedores = response.data;
      },
      error: (error) => {
        console.error('Error al cargar emprendedores:', error);
      }
    });
  }

  loadUsuarios() {
    // En un caso real, esto debería llamar a un servicio de usuarios
    // Para este ejemplo, usaremos un array estático
    this.usuarios = [
      { id: 1, name: 'Administrador', email: 'admin@example.com' },
      { id: 2, name: 'Usuario Normal', email: 'user@example.com' },
      { id: 3, name: 'Emprendedor Local', email: 'emprendedor@example.com' }
    ];
  }

  addServicio(servicioId?: number, reservaServicio?: ReservaServicio) {
    const index = this.serviciosArray.length;
    this.serviciosArray.push(this.createServicioFormGroup(reservaServicio));

    // Inicializar estado de disponibilidad
    this.verificandoDisponibilidad[index] = false;
    this.disponibilidadVerificada[index] = false;
    this.servicioDisponible[index] = false;

    // Si se especifica un servicio, seleccionarlo y actualizar el emprendedor
    if (servicioId && !reservaServicio) {
      this.getServicioFormGroup(index).patchValue({ servicio_id: servicioId });
      this.onServicioChange(index);
    }
  }

  removeServicio(index: number) {
    this.serviciosArray.removeAt(index);

    // Actualizar índices en los arrays de disponibilidad
    const newVerificando: {[index: number]: boolean} = {};
    const newVerificada: {[index: number]: boolean} = {};
    const newDisponible: {[index: number]: boolean} = {};

    Object.keys(this.verificandoDisponibilidad).forEach((key) => {
      const numKey = parseInt(key);
      if (numKey > index) {
        newVerificando[numKey - 1] = this.verificandoDisponibilidad[numKey];
        newVerificada[numKey - 1] = this.disponibilidadVerificada[numKey];
        newDisponible[numKey - 1] = this.servicioDisponible[numKey];
      } else if (numKey < index) {
        newVerificando[numKey] = this.verificandoDisponibilidad[numKey];
        newVerificada[numKey] = this.disponibilidadVerificada[numKey];
        newDisponible[numKey] = this.servicioDisponible[numKey];
      }
    });

    this.verificandoDisponibilidad = newVerificando;
    this.disponibilidadVerificada = newVerificada;
    this.servicioDisponible = newDisponible;
  }

  onServicioChange(index: number) {
    const servicioId = this.getServicioFormGroup(index).get('servicio_id')?.value;
    if (!servicioId) return;

    // Buscar el servicio seleccionado
    const servicio = this.serviciosDisponibles.find(s => s.id == servicioId);
    if (!servicio) return;

    // Actualizar emprendedor_id automáticamente
    this.getServicioFormGroup(index).patchValue({
      emprendedor_id: servicio.emprendedor_id
    });

    // Si hay precio referencial, actualizar precio
    if (servicio.precio_referencial) {
      this.getServicioFormGroup(index).patchValue({
        precio: servicio.precio_referencial
      });
    }

    // Verificar disponibilidad si tiene todos los datos necesarios
    this.verificarDisponibilidad(index);
  }

  onFechaHoraChange(index: number) {
    // Actualizar duración en minutos al cambiar horas
    const horaInicio = this.getServicioFormGroup(index).get('hora_inicio')?.value;
    const horaFin = this.getServicioFormGroup(index).get('hora_fin')?.value;

    if (horaInicio && horaFin) {
      const inicioMinutos = this.horaAMinutos(horaInicio);
      const finMinutos = this.horaAMinutos(horaFin);

      // Si hora fin es menor que hora inicio, se asume que es del día siguiente
      let duracionMinutos = finMinutos - inicioMinutos;
      if (duracionMinutos <= 0) {
        duracionMinutos += 24 * 60; // Añadir un día en minutos
      }

      this.getServicioFormGroup(index).patchValue({
        duracion_minutos: duracionMinutos
      });
    }

    // Verificar disponibilidad si tiene todos los datos necesarios
    this.verificarDisponibilidad(index);
  }

  verificarDisponibilidad(index: number) {
    const servicioId = this.getServicioFormGroup(index).get('servicio_id')?.value;
    const fechaInicio = this.getServicioFormGroup(index).get('fecha_inicio')?.value;
    const fechaFin = this.getServicioFormGroup(index).get('fecha_fin')?.value;
    const horaInicio = this.getServicioFormGroup(index).get('hora_inicio')?.value;
    const horaFin = this.getServicioFormGroup(index).get('hora_fin')?.value;
    const reservaServicioId = this.getServicioFormGroup(index).get('id')?.value;

    // Verificar que tenemos todos los datos necesarios
    if (!servicioId || !fechaInicio || !horaInicio || !horaFin) {
      this.disponibilidadVerificada[index] = false;
      return;
    }

    // Formatear las horas a HH:MM:SS
    const horaInicioFormat = this.formatearHora(horaInicio);
    const horaFinFormat = this.formatearHora(horaFin);

    this.verificandoDisponibilidad[index] = true;
    this.disponibilidadVerificada[index] = false;

    this.turismoService.verificarDisponibilidadReservaServicio(
      servicioId,
      fechaInicio,
      fechaFin,
      horaInicioFormat,
      horaFinFormat,
      reservaServicioId
    ).subscribe({
      next: (result) => {
        this.verificandoDisponibilidad[index] = false;
        this.disponibilidadVerificada[index] = true;
        this.servicioDisponible[index] = result.disponible;
      },
      error: (error) => {
        console.error('Error al verificar disponibilidad:', error);
        this.verificandoDisponibilidad[index] = false;
        this.disponibilidadVerificada[index] = true;
        this.servicioDisponible[index] = false; // Por defecto, asumir no disponible en caso de error
      }
    });
  }

  hayServiciosNoDisponibles(): boolean {
    for (let i = 0; i < this.serviciosArray.length; i++) {
      if (this.disponibilidadVerificada[i] && !this.servicioDisponible[i]) {
        return true;
      }
    }
    return false;
  }

  numServiciosVerificados(): number {
    return Object.values(this.disponibilidadVerificada).filter(v => v).length;
  }

  submitForm() {
    if (this.reservaForm.invalid || this.hayServiciosNoDisponibles() || this.isSubmitting || this.numServiciosVerificados() !== this.serviciosArray.length) {
      return;
    }

    this.isSubmitting = true;

    // Preparar datos para enviar
    const formData = this.reservaForm.value;

    // Asegurar que hora_inicio y hora_fin tengan el formato correcto (HH:MM:SS)
    formData.servicios = formData.servicios.map((servicio: any) => {
      return {
        ...servicio,
        hora_inicio: this.formatearHora(servicio.hora_inicio),
        hora_fin: this.formatearHora(servicio.hora_fin)
      };
    });

    // Crear o actualizar la reserva
    if (this.isEditMode && this.reservaId) {
      this.turismoService.updateReserva(this.reservaId, formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          alert("Reserva actualizada correctamente");
          this.router.navigateByUrl('/admin/reservas');
        },
        error: (error) => {
          console.error('Error al actualizar reserva:', error);
          this.isSubmitting = false;
          alert('Error al actualizar la reserva. Por favor, intente nuevamente.');
        }
      });
    } else {
      this.turismoService.createReserva(formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          alert("Reserva creada correctamente");
          this.router.navigateByUrl('/admin/reservas');
        },
        error: (error) => {
          console.error('Error al crear reserva:', error);
          this.isSubmitting = false;
          alert('Error al crear la reserva. Por favor, intente nuevamente.');
        }
      });
    }
  }

  cancel() {
    this.router.navigateByUrl('/admin/reservas');
  }

  // Métodos de utilidad
  generarCodigoReserva(): string {
    const fecha = new Date();
    const year = fecha.getFullYear().toString().substr(-2);
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    // Generar 6 caracteres aleatorios (letras y números)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 6; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `RES-${year}${month}${day}-${codigo}`;
  }

  sumarHoras(hora: string, horas: number): string {
    const [h, m, s] = hora.split(':').map(Number);
    const fecha = new Date();
    fecha.setHours(h, m, s || 0);
    fecha.setTime(fecha.getTime() + horas * 60 * 60 * 1000);

    return `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}:${String(fecha.getSeconds()).padStart(2, '0')}`;
  }

  horaAMinutos(hora: string): number {
    const [h, m, s] = hora.split(':').map(Number);
    return (h || 0) * 60 + (m || 0) + (s || 0) / 60;
  }

  formatearHora(hora: string): string {
    // Asegurar que la hora tenga el formato HH:MM:SS
    if (!hora) return '00:00:00';

    const partes = hora.split(':');
    while (partes.length < 3) {
      partes.push('00');
    }

    return partes.map(p => p.padStart(2, '0')).join(':');
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}
