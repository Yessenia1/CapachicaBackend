// src/app/features/admin-empredimientos/servicios-list/servicios-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EmprendimientosService, Emprendimiento, Servicio } from '../../../core/services/emprendimientos.service';

@Component({
  selector: 'app-servicios-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <!-- Barra Superior -->
      <header class="bg-white dark:bg-gray-800 shadow">
        <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {{ emprendimiento ? 'Servicios: ' + emprendimiento.nombre : 'Cargando servicios...' }}
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona los servicios que ofrece tu emprendimiento</p>
          </div>
          <div class="flex items-center space-x-4">
            <a [routerLink]="['/mis-emprendimientos']" class="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Volver a Emprendimientos
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
                <button (click)="loadServicios()" class="rounded-md bg-red-50 dark:bg-red-900 px-3 py-2 text-sm font-medium text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800">
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Botones de Acción -->
        <div class="mb-6 flex justify-between items-center">
          <div>
            <a [routerLink]="['/emprendimiento', emprendimientoId]" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Editar Emprendimiento
            </a>
          </div>
          <div>
            <a [routerLink]="['/emprendimiento', emprendimientoId, 'servicio', 'nuevo']" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Servicio
            </a>
          </div>
        </div>
        
        <!-- Sin Servicios -->
        <div *ngIf="!loading && !error && (!servicios || servicios.length === 0)" class="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">No hay servicios</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Este emprendimiento aún no tiene servicios registrados.</p>
          <div class="mt-6">
            <a [routerLink]="['/emprendimiento', emprendimientoId, 'servicio', 'nuevo']" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Crear Primer Servicio
            </a>
          </div>
        </div>
        
        <!-- Lista de Servicios -->
        <div *ngIf="!loading && !error && servicios && servicios.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let servicio of servicios" class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div class="relative h-48 overflow-hidden">
            <ng-container *ngIf="servicio.sliders?.[0]?.url_completa as url; else placeholder">
                <img 
                    [src]="url"
                    [alt]="servicio.nombre || 'Imagen del servicio'"
                    class="w-full h-full object-cover"
                    loading="lazy" />
                </ng-container>



                <ng-template #placeholder>
                <div class="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                </ng-template>

              <div class="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-black/70 to-transparent">
                <h3 class="text-lg font-semibold text-white truncate">{{ servicio.nombre }}</h3>
                <p class="text-sm text-gray-200">S/. {{ servicio.precio_referencial }}</p>
              </div>
            </div>
            <div class="p-5">
              <div class="mb-4">
                <p class="text-sm text-gray-600 dark:text-gray-300">{{ servicio.descripcion }}</p>
              </div>
              
              <div class="flex flex-wrap gap-2 mb-4">
                <span *ngFor="let categoria of servicio.categorias" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                  {{ categoria.nombre }}
                </span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                     [ngClass]="servicio.estado ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'">
                  {{ servicio.estado ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              
              <div class="mb-4">
                <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Horarios disponibles</h4>
                <div *ngIf="servicio.horarios?.length" class="text-sm text-gray-600 dark:text-gray-300">
                <p *ngFor="let horario of getGroupedHorarios(servicio.horarios ?? [])" class="mb-1">
                <span class="font-medium">{{ formatDays(horario.dias) }}:</span> {{ horario.inicio }} - {{ horario.fin }}
                </p>

                </div>
                <p *ngIf="!servicio.horarios?.length" class="text-sm text-gray-500 dark:text-gray-400">No hay horarios configurados</p>
              </div>
              
              <div class="grid grid-cols-2 gap-3">
                <a [routerLink]="['/emprendimiento', emprendimientoId, 'servicio', servicio.id]" class="inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900 hover:bg-orange-200 dark:hover:bg-orange-800">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Editar
                </a>
                <button (click)="confirmDelete(servicio)" class="inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ServiciosListComponent implements OnInit {
  private emprendimientosService = inject(EmprendimientosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  emprendimientoId: number = 0;
  emprendimiento: Emprendimiento | null = null;
  servicios: Servicio[] = [];
  
  loading = true;
  error = '';
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.emprendimientoId = +params['id'];
      this.loadServicios();
    });
  }
  
  loadServicios(): void {
    this.loading = true;
    this.error = '';
    
    // Primero cargar el emprendimiento para mostrar nombre
    this.emprendimientosService.getEmprendimiento(this.emprendimientoId).subscribe({
      next: (data) => {
        this.emprendimiento = data;
        
        // Luego cargar servicios
        this.emprendimientosService.getServicios(this.emprendimientoId).subscribe({
          next: (servicios) => {
            this.servicios = servicios;
            this.loading = false;
          },
          error: (err) => {
            console.error('Error al cargar servicios:', err);
            this.error = err.error?.message || 'Error al cargar los servicios. Inténtalo de nuevo.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar emprendimiento:', err);
        this.error = err.error?.message || 'Error al cargar el emprendimiento. Inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }
  
  confirmDelete(servicio: Servicio): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el servicio "${servicio.nombre}"? Esta acción no se puede deshacer.`)) {
      this.deleteServicio(servicio.id!);
    }
  }
  
  deleteServicio(id: number): void {
    this.emprendimientosService.deleteServicio(id).subscribe({
      next: () => {
        // Actualizar la lista de servicios
        this.servicios = this.servicios.filter(s => s.id !== id);
        alert('Servicio eliminado correctamente');
      },
      error: (err) => {
        console.error('Error al eliminar servicio:', err);
        alert('Error al eliminar el servicio: ' + (err.error?.message || 'Inténtalo de nuevo.'));
      }
    });
  }
  
  // Agrupar horarios por hora inicio/fin
  getGroupedHorarios(horarios: any[]): {dias: string[], inicio: string, fin: string}[] {
    if (!horarios || !horarios.length) return [];
    
    const horarioMap = new Map<string, string[]>();
    
    horarios.forEach(horario => {
      const key = `${horario.hora_inicio}-${horario.hora_fin}`;
      
      if (!horarioMap.has(key)) {
        horarioMap.set(key, []);
      }
      
      horarioMap.get(key)?.push(this.capitalizeDayName(horario.dia_semana));
    });
    
    return Array.from(horarioMap.entries()).map(([key, dias]) => {
      const [inicio, fin] = key.split('-');
      return {
        dias,
        inicio: this.formatHour(inicio),
        fin: this.formatHour(fin)
      };
    });
  }
  
  capitalizeDayName(day: string): string {
    return day.charAt(0).toUpperCase() + day.slice(1);
  }
  
  formatHour(hour: string): string {
    if (!hour) return '';
    
    // Formato: HH:MM:SS
    const parts = hour.split(':');
    if (parts.length < 2) return hour;
    
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    
    if (hours === 0) {
      return `12:${minutes} AM`;
    } else if (hours < 12) {
      return `${hours}:${minutes} AM`;
    } else if (hours === 12) {
      return `12:${minutes} PM`;
    } else {
      return `${hours - 12}:${minutes} PM`;
    }
  }
  
  formatDays(days: string[]): string {
    if (!days || days.length === 0) return '';
    
    // Si son todos los días
    if (days.length === 7) return 'Todos los días';
    
    // Si son días de semana (lunes a viernes)
    const weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const hasAllWeekdays = weekdays.every(day => days.includes(day));
    
    if (hasAllWeekdays && days.length === 5) return 'Lunes a Viernes';
    
    // Si es fin de semana (sábado y domingo)
    const weekend = ['Sábado', 'Domingo'];
    const hasAllWeekend = weekend.every(day => days.includes(day));
    
    if (hasAllWeekend && days.length === 2) return 'Fines de semana';
    
    // Si no, listar los días separados por coma
    return days.join(', ');
  }
}