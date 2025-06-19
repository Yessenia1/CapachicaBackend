import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TurismoService, ReservaServicio } from '../../../../../core/services/turismo.service';
import { ThemeService } from '../../../../../core/services/theme.service';

@Component({
  selector: 'app-reserva-calendario',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6 transition-colors duration-300 ease-in-out">
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Calendario de Reservas</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Visualiza todas las reservas programadas en formato de calendario.
          </p>
        </div>
        <div class="mt-4 sm:mt-0">
          <a
            routerLink="/admin/reservas"
            class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300 ease-in-out"
          >
            <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver
          </a>
        </div>
      </div>

      <!-- Filtros -->
      <div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm transition-colors duration-300 ease-in-out">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label for="fechaInicio" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Inicio</label>
            <div class="mt-1">
              <input
                type="date"
                id="fechaInicio"
                [(ngModel)]="fechaInicio"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-300 ease-in-out"
              >
            </div>
          </div>

          <div>
            <label for="fechaFin" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Fin</label>
            <div class="mt-1">
              <input
                type="date"
                id="fechaFin"
                [(ngModel)]="fechaFin"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-300 ease-in-out"
              >
            </div>
          </div>

          <div class="flex items-end">
            <button
              type="button"
              (click)="cargarReservas()"
              class="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300 ease-in-out"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Actualizar Calendario
            </button>
          </div>
        </div>
      </div>

      <!-- Calendario -->
      <div class="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm transition-colors duration-300 ease-in-out">
        @if (loading) {
          <div class="flex justify-center items-center p-8">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
            <span class="ml-4 dark:text-white">Cargando reservas...</span>
          </div>
        } @else {
          <!-- Navegación del mes -->
          <div class="flex justify-between items-center mb-6">
            <button
              (click)="mesAnterior()"
              class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300 ease-in-out"
            >
              <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Mes Anterior
            </button>

            <h2 class="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">{{ nombreMes }} {{ anioActual }}</h2>

            <button
              (click)="mesSiguiente()"
              class="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-300 ease-in-out"
            >
              Mes Siguiente
              <svg class="h-5 w-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>

          <!-- Grid del calendario -->
          <div class="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden transition-colors duration-300 ease-in-out">
            <!-- Cabecera de días de la semana -->
            @for (dia of diasSemana; track dia) {
              <div class="bg-gray-100 dark:bg-gray-700 p-2 text-center text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors duration-300 ease-in-out">
                {{ dia }}
              </div>
            }

            <!-- Celdas de días -->
            @for (celda of celdasCalendario; track celda.fecha) {
              <div
                class="bg-white dark:bg-gray-800 min-h-[100px] p-2 {{ celda.esFueraDeMes ? 'bg-gray-50 dark:bg-gray-900 opacity-50' : '' }} transition-colors duration-300 ease-in-out"
              >
                <!-- Número del día -->
                <div class="flex justify-between items-start">
                  <span class="font-medium text-gray-700 dark:text-gray-200 {{ esHoy(celda.fecha) ? 'p-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full' : '' }} transition-colors duration-300 ease-in-out">
                    {{ formatFecha(celda.fecha, 'dia') }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300 ease-in-out">
                    {{ celda.reservas.length > 0 ? celda.reservas.length + ' reservas' : '' }}
                  </span>
                </div>

                <!-- Eventos del día -->
                <div class="mt-1 space-y-1 max-h-[120px] overflow-auto">
                  @for (reserva of celda.reservas; track reserva.id) {
                    <a
                      [routerLink]="['/admin/reservas/detail', reserva.reserva_id]"
                      class="block px-2 py-1 rounded-md text-xs {{ getEstadoClass(reserva.estado) }} transition-colors duration-300 ease-in-out"
                      [title]="getReservaTooltip(reserva)"
                    >
                      {{ obtenerHoraFormateada(reserva.hora_inicio) }} - {{ reserva.servicio?.nombre }}
                    </a>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Leyenda -->
          <div class="mt-4 flex flex-wrap gap-3">
            <div class="flex items-center">
              <span class="inline-block w-3 h-3 mr-1 bg-yellow-100 dark:bg-yellow-800 border border-yellow-400 dark:border-yellow-600 rounded-sm transition-colors duration-300 ease-in-out"></span>
              <span class="text-xs text-gray-700 dark:text-gray-300 transition-colors duration-300 ease-in-out">Pendiente</span>
            </div>
            <div class="flex items-center">
              <span class="inline-block w-3 h-3 mr-1 bg-green-100 dark:bg-green-800 border border-green-400 dark:border-green-600 rounded-sm transition-colors duration-300 ease-in-out"></span>
              <span class="text-xs text-gray-700 dark:text-gray-300 transition-colors duration-300 ease-in-out">Confirmada</span>
            </div>
            <div class="flex items-center">
              <span class="inline-block w-3 h-3 mr-1 bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-600 rounded-sm transition-colors duration-300 ease-in-out"></span>
              <span class="text-xs text-gray-700 dark:text-gray-300 transition-colors duration-300 ease-in-out">Cancelada</span>
            </div>
            <div class="flex items-center">
              <span class="inline-block w-3 h-3 mr-1 bg-blue-100 dark:bg-blue-800 border border-blue-400 dark:border-blue-600 rounded-sm transition-colors duration-300 ease-in-out"></span>
              <span class="text-xs text-gray-700 dark:text-gray-300 transition-colors duration-300 ease-in-out">Completada</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ReservaCalendarioComponent implements OnInit {
  private turismoService = inject(TurismoService);
  private themeService = inject(ThemeService);

  // Estado del componente
  loading = true;
  reservasServicios: ReservaServicio[] = [];

  // Fechas
  fechaInicio: string;
  fechaFin: string;
  mesActual: number;
  anioActual: number;

  // Datos del calendario
  diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  celdasCalendario: {fecha: Date, reservas: ReservaServicio[], esFueraDeMes: boolean}[] = [];

  constructor() {
    // Inicializar fechas con el mes actual
    const hoy = new Date();
    this.mesActual = hoy.getMonth();
    this.anioActual = hoy.getFullYear();

    // Establecer fechaInicio al primer día del mes actual
    const primerDia = new Date(this.anioActual, this.mesActual, 1);
    this.fechaInicio = this.formatearFecha(primerDia);

    // Establecer fechaFin al último día del mes actual
    const ultimoDia = new Date(this.anioActual, this.mesActual + 1, 0);
    this.fechaFin = this.formatearFecha(ultimoDia);
  }

  ngOnInit() {
    this.generarCalendario();
    this.cargarReservas();
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  cargarReservas() {
    this.loading = true;

    if (!this.fechaInicio || !this.fechaFin) {
      alert("Por favor, seleccione fechas válidas");
      this.loading = false;
      return;
    }

    this.turismoService.getCalendarioReservas(this.fechaInicio, this.fechaFin).subscribe({
      next: (reservas) => {
        this.reservasServicios = reservas;
        this.generarCalendario();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar las reservas:', error);
        this.loading = false;
        alert("Error al cargar las reservas. Por favor, intente nuevamente.");
      }
    });
  }

  generarCalendario() {
    this.celdasCalendario = [];

    // Obtener primer día del mes actual
    const primerDia = new Date(this.anioActual, this.mesActual, 1);

    // Obtener último día del mes actual
    const ultimoDia = new Date(this.anioActual, this.mesActual + 1, 0);

    // Calcular primer día que aparecerá en el calendario (puede ser del mes anterior)
    // Para que comience en domingo (0)
    const diaInicio = new Date(primerDia);
    const diaSemanaInicio = primerDia.getDay();
    diaInicio.setDate(primerDia.getDate() - diaSemanaInicio);

    // Calcular último día que aparecerá en el calendario (puede ser del mes siguiente)
    // Para que termine en sábado (6)
    const diaFin = new Date(ultimoDia);
    const diaSemanaFin = ultimoDia.getDay();
    diaFin.setDate(ultimoDia.getDate() + (6 - diaSemanaFin));

    // Generar todas las celdas del calendario
    let fecha = new Date(diaInicio);
    while (fecha <= diaFin) {
      const reservasDia = this.reservasServicios.filter(r => {
        const fechaReserva = new Date(r.fecha_inicio);
        return fechaReserva.getFullYear() === fecha.getFullYear() &&
               fechaReserva.getMonth() === fecha.getMonth() &&
               fechaReserva.getDate() === fecha.getDate();
      });

      this.celdasCalendario.push({
        fecha: new Date(fecha),
        reservas: reservasDia,
        esFueraDeMes: fecha.getMonth() !== this.mesActual
      });

      // Avanzar al siguiente día
      fecha.setDate(fecha.getDate() + 1);
    }
  }

  mesAnterior() {
    this.mesActual--;
    if (this.mesActual < 0) {
      this.mesActual = 11;
      this.anioActual--;
    }

    // Actualizar fechas
    const primerDia = new Date(this.anioActual, this.mesActual, 1);
    this.fechaInicio = this.formatearFecha(primerDia);

    const ultimoDia = new Date(this.anioActual, this.mesActual + 1, 0);
    this.fechaFin = this.formatearFecha(ultimoDia);

    this.cargarReservas();
  }

  mesSiguiente() {
    this.mesActual++;
    if (this.mesActual > 11) {
      this.mesActual = 0;
      this.anioActual++;
    }

    // Actualizar fechas
    const primerDia = new Date(this.anioActual, this.mesActual, 1);
    this.fechaInicio = this.formatearFecha(primerDia);

    const ultimoDia = new Date(this.anioActual, this.mesActual + 1, 0);
    this.fechaFin = this.formatearFecha(ultimoDia);

    this.cargarReservas();
  }

  get nombreMes(): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[this.mesActual];
  }

  // Métodos de utilidad
  formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  formatFecha(fecha: Date, formato: 'dia' | 'completo'): string {
    if (formato === 'dia') {
      return fecha.getDate().toString();
    } else {
      return fecha.toLocaleDateString();
    }
  }

  esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.getFullYear() === hoy.getFullYear() &&
           fecha.getMonth() === hoy.getMonth() &&
           fecha.getDate() === hoy.getDate();
  }

  obtenerHoraFormateada(horaString: string): string {
    // Asumiendo formato "HH:MM:SS"
    return horaString.substring(0, 5); // Retorna solo "HH:MM"
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-l-2 border-yellow-400 dark:border-yellow-600';
      case 'confirmado': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-l-2 border-green-400 dark:border-green-600';
      case 'cancelado': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-l-2 border-red-400 dark:border-red-600';
      case 'completado': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-l-2 border-blue-400 dark:border-blue-600';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-l-2 border-gray-400 dark:border-gray-500';
    }
  }

  getReservaTooltip(reserva: ReservaServicio): string {
    return `Reserva: ${reserva.reserva_id}
Servicio: ${reserva.servicio?.nombre || 'Sin nombre'}
Horario: ${this.obtenerHoraFormateada(reserva.hora_inicio)} - ${this.obtenerHoraFormateada(reserva.hora_fin)}
Estado: ${reserva.estado}`;
  }
}
