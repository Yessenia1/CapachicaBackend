import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { EmprendimientosService, Emprendimiento, AdminRequest } from '../../../core/services/emprendimientos.service';
import { UsersService } from '../../../core/services/users.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-administradores-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="min-h-screen relative">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-[url('https://media-cdn.tripadvisor.com/media/photo-s/08/e7/29/52/capachica-peninsula.jpg')] bg-cover bg-center bg-no-repeat">
        <div class="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-gray-900/95 backdrop-blur-sm"></div>
      </div>
      <!-- Content -->
      <div class="relative min-h-screen">
        <!-- Barra Superior -->
        <header class="backdrop-blur-lg bg-white/10 dark:bg-gray-800/20 border-b border-white/10 dark:border-gray-700/30 sticky top-0 z-50">
          <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
                {{ emprendimiento ? 'Administradores: ' + emprendimiento.nombre : 'Cargando administradores...' }}
              </h1>
              <p class="text-sm text-gray-300 dark:text-gray-400 mt-1">Gestiona los administradores de tu emprendimiento</p>
            </div>
            <div class="flex items-center space-x-4">
              <a [routerLink]="['/mis-emprendimientos']" class="group flex items-center px-4 py-2 rounded-full bg-white/10 dark:bg-gray-800/30 text-white hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Volver a Emprendimientos
              </a>
            </div>
          </div>
        </header>
        
        <!-- Contenido Principal -->
        <main class="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <!-- Estado de Carga -->
          <div *ngIf="loading" class="flex justify-center py-12 animate-fade-in">
            <div class="relative">
              <div class="w-16 h-16 border-4 border-orange-200/30 dark:border-orange-800/30 rounded-full"></div>
              <div class="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
          </div>
          
          <!-- Error -->
          <div *ngIf="error" class="backdrop-blur-lg bg-red-500/10 dark:bg-red-900/20 border border-red-500/20 dark:border-red-800/30 rounded-2xl p-6 mb-6 shadow-2xl animate-fade-in">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-red-200">{{ error }}</h3>
                <div class="mt-4">
                  <button (click)="loadEmprendimiento()" class="inline-flex items-center px-4 py-2 rounded-full bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Formulario para Agregar Administrador -->
          <div class="backdrop-blur-lg bg-white/10 dark:bg-gray-800/20 shadow-2xl rounded-2xl mb-8 border border-gradient-to-r from-orange-400/40 to-orange-600/40 animate-fade-in">
            <div class="p-7">
              <h2 class="text-xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-200 bg-clip-text text-transparent mb-4 tracking-tight animate-slide-in">Agregar Nuevo Administrador</h2>
              <form [formGroup]="adminForm" (ngSubmit)="onSubmit()" class="space-y-5">
                <div class="relative">
                  <label for="email" class="block text-sm font-medium text-gray-300 mb-1">Email del Usuario *</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-orange-300">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </span>
                    <input 
                      type="email" 
                      id="email" 
                      formControlName="email" 
                      class="mt-1 block w-full rounded-lg border border-gray-500/30 bg-white/20 dark:bg-gray-700/30 dark:text-white shadow-inner focus:border-orange-400 focus:ring-orange-400 focus:ring-2 px-10 py-2 placeholder-gray-400 transition-all duration-300 focus:shadow-orange-400/20"
                      placeholder="Ingresa el email del usuario">
                  </div>
                  <div *ngIf="submitted && f['email'].errors" class="mt-1 text-sm text-red-400 animate-shake">
                    <span *ngIf="f['email'].errors['required']">El email es requerido</span>
                    <span *ngIf="f['email'].errors['email']">El formato del email no es válido</span>
                  </div>
                </div>
                <div class="relative">
                  <label for="rol" class="block text-sm font-medium text-gray-300 mb-1">Rol *</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-orange-300">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
                    </span>
                    <select 
                      id="rol" 
                      formControlName="rol" 
                      class="mt-1 block w-full rounded-lg border border-gray-500/30 bg-white/20 dark:bg-gray-700/30 dark:text-white shadow-inner focus:border-orange-400 focus:ring-orange-400 focus:ring-2 px-10 py-2 transition-all duration-300 focus:shadow-orange-400/20">
                      <option value="administrador">Administrador</option>
                      <option value="colaborador">Colaborador</option>
                    </select>
                  </div>
                  <div *ngIf="submitted && f['rol'].errors" class="mt-1 text-sm text-red-400 animate-shake">
                    <span *ngIf="f['rol'].errors['required']">El rol es requerido</span>
                  </div>
                </div>
                <div class="flex justify-end">
                  <button
                    type="submit"
                    [disabled]="submitting"
                    class="inline-flex justify-center rounded-xl border border-transparent bg-gradient-to-r from-orange-500 to-orange-400 py-2 px-6 text-sm font-bold text-white shadow-lg hover:from-orange-600 hover:to-orange-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 active:scale-95 animate-pulse-once">
                    <span *ngIf="submitting" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></span>
                    Agregar Administrador
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <!-- Lista de Administradores -->
          <div class="backdrop-blur-lg bg-white/10 dark:bg-gray-800/20 shadow-2xl rounded-2xl border border-white/10 dark:border-gray-700/30 animate-fade-in">
            <div class="p-7">
              <h2 class="text-xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-200 bg-clip-text text-transparent mb-4 tracking-tight animate-slide-in">Administradores Actuales</h2>
              <!-- Sin Administradores -->
              <div *ngIf="!loading && !error && (!administradores || administradores.length === 0)" class="text-center py-8 animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 class="mt-2 text-lg font-bold text-white animate-fade-in">No hay administradores</h3>
                <p class="mt-1 text-sm text-gray-300">Este emprendimiento aún no tiene administradores registrados.</p>
              </div>
              <!-- Tabla de Administradores -->
              <div *ngIf="!loading && !error && administradores && administradores.length > 0" class="overflow-x-auto animate-fade-in">
                <table class="min-w-full divide-y divide-gray-500/20 dark:divide-gray-700/40">
                  <thead class="bg-white/20 dark:bg-gray-800/30 sticky top-0 z-10 shadow-lg">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Usuario</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Email</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Rol</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Estado</th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-bold text-gray-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white/5 dark:bg-gray-800/10 divide-y divide-gray-500/20 dark:divide-gray-700/40">
                    <tr *ngFor="let admin of administradores" class="transition-all duration-300 hover:bg-orange-400/10 hover:shadow-xl animate-fade-in">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="flex-shrink-0 h-12 w-12 relative">
                            <div class="absolute -inset-1 rounded-full bg-gradient-to-br from-orange-400/40 to-orange-600/40 blur-md opacity-70 z-0"></div>
                            <img 
                              *ngIf="admin.foto_perfil_url || admin.avatar" 
                              [src]="admin.foto_perfil_url || admin.avatar" 
                              [alt]="admin.name"
                              class="h-12 w-12 rounded-full object-cover border-4 border-white/60 shadow-xl relative z-10">
                            <div 
                              *ngIf="!admin.foto_perfil_url && !admin.avatar" 
                              class="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400/40 to-orange-600/40 flex items-center justify-center border-4 border-white/60 shadow-xl relative z-10">
                              <span class="text-lg font-bold text-white">{{ getInitials(admin.name) }}</span>
                            </div>
                          </div>
                          <div class="ml-4">
                            <div class="text-base font-bold text-white">{{ admin.name }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-base text-gray-300">{{ admin.email }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-base text-gray-300 flex items-center gap-2">
                          <svg *ngIf="admin.pivot?.rol === 'administrador'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-orange-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                          <svg *ngIf="admin.pivot?.rol === 'colaborador'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-300 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                          {{ admin.pivot?.rol || 'Administrador' }}
                          <span *ngIf="admin.pivot?.es_principal" class="ml-1 bg-gradient-to-r from-yellow-400/80 to-yellow-300/80 text-yellow-900 text-xs px-2 py-0.5 rounded-full shadow flex items-center gap-1 animate-pulse">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                            Principal
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-bold rounded-full shadow-md flex items-center gap-1 animate-gradient-x" 
                              [ngClass]="admin.active ? 'bg-gradient-to-r from-green-500/80 to-green-400/80 text-white' : 'bg-gradient-to-r from-red-500/80 to-red-400/80 text-white'">
                          <svg *ngIf="admin.active" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="2" /></svg>
                          <svg *ngIf="!admin.active" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          {{ admin.active ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-base font-bold">
                        <button 
                          *ngIf="!admin.pivot?.es_principal"
                          (click)="confirmRemoveAdmin(admin)"
                          class="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-400 text-white shadow-lg hover:from-red-600 hover:to-red-500 transition-all duration-300 active:scale-95 animate-shake-on-hover">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Eliminar
                        </button>
                        <span *ngIf="admin.pivot?.es_principal" class="text-gray-400 dark:text-gray-500 cursor-not-allowed">
                          No removible
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
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
export class AdministradoresListComponent implements OnInit {
  private emprendimientosService = inject(EmprendimientosService);
  private usersService = inject(UsersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  emprendimientoId: number = 0;
  emprendimiento: Emprendimiento | null = null;
  administradores: User[] = [];
  
  loading = true;
  submitting = false;
  submitted = false;
  error = '';
  
  adminForm: FormGroup;
  
  constructor() {
    this.adminForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      rol: ['administrador', [Validators.required]]
    });
  }
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.emprendimientoId = +params['id'];
      this.loadEmprendimiento();
    });
  }
  
  get f() {
    return this.adminForm.controls;
  }
  
  loadEmprendimiento(): void {
    this.loading = true;
    this.error = '';
    
    this.emprendimientosService.getEmprendimiento(this.emprendimientoId).subscribe({
      next: (data) => {
        this.emprendimiento = data;
        this.administradores = data.administradores || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar emprendimiento:', err);
        this.error = err.error?.message || 'Error al cargar el emprendimiento. Inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }
  
  onSubmit(): void {
    this.submitted = true;
    
    if (this.adminForm.invalid) {
      return;
    }
    
    this.submitting = true;
    
    const adminData: AdminRequest = {
      email: this.adminForm.value.email,
      rol: this.adminForm.value.rol,
      es_principal: false // Siempre false desde esta interfaz
    };
    
    this.emprendimientosService.addAdministrador(this.emprendimientoId, adminData).subscribe({
      next: () => {
        // Recargar lista de administradores
        this.loadEmprendimiento();
        this.adminForm.reset({
          email: '',
          rol: 'administrador'
        });
        this.submitted = false;
        this.submitting = false;
        alert('Administrador agregado correctamente');
      },
      error: (err) => {
        console.error('Error al agregar administrador:', err);
        this.error = err.error?.message || 'Error al agregar el administrador. Inténtalo de nuevo.';
        this.submitting = false;
      }
    });
  }
  
  confirmRemoveAdmin(admin: User): void {
    if (confirm(`¿Estás seguro de que deseas eliminar a "${admin.name}" como administrador? Esta acción no se puede deshacer.`)) {
      this.removeAdmin(admin.id!);
    }
  }
  
  removeAdmin(userId: number): void {
    this.emprendimientosService.removeAdministrador(this.emprendimientoId, userId).subscribe({
      next: () => {
        // Actualizar la lista de administradores
        this.administradores = this.administradores.filter(a => a.id !== userId);
        alert('Administrador eliminado correctamente');
      },
      error: (err) => {
        console.error('Error al eliminar administrador:', err);
        this.error = err.error?.message || 'Error al eliminar el administrador. Inténtalo de nuevo.';
      }
    });
  }
  
  getInitials(name: string): string {
    if (!name) return '';
    
    const parts = name.split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}