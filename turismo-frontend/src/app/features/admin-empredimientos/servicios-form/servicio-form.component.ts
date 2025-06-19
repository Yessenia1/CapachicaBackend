import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { EmprendimientosService, Emprendimiento, Servicio, Horario } from '../../../core/services/emprendimientos.service';

interface CategoriaOption {
  id: number;
  nombre: string;
  descripcion?: string;
}

@Component({
  selector: 'app-servicio-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <!-- Barra Superior -->
      <header class="bg-white dark:bg-gray-800 shadow">
        <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {{ isEditing ? 'Editar Servicio' : 'Nuevo Servicio' }}
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ emprendimiento ? emprendimiento.nombre : 'Cargando emprendimiento...' }}
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <a [routerLink]="['/emprendimiento', emprendimientoId, 'servicios']" class="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Volver a Servicios
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
                <button (click)="isEditing ? loadServicio() : loadEmprendimiento()" class="rounded-md bg-red-50 dark:bg-red-900 px-3 py-2 text-sm font-medium text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800">
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Formulario de Servicio -->
        <form *ngIf="servicioForm && !loading" [formGroup]="servicioForm" (ngSubmit)="onSubmit()" class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div class="p-6">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-6">Información del Servicio</h2>
            
            <!-- Información Básica -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div class="col-span-2">
                <label for="nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Servicio *</label>
                <input type="text" id="nombre" formControlName="nombre" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                <div *ngIf="submitted && f['nombre'].errors" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  <span *ngIf="f['nombre'].errors['required']">El nombre es requerido</span>
                </div>
              </div>
              
              <div class="col-span-2">
                <label for="descripcion" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción *</label>
                <textarea id="descripcion" formControlName="descripcion" rows="3" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500"></textarea>
                <div *ngIf="submitted && f['descripcion'].errors" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  <span *ngIf="f['descripcion'].errors['required']">La descripción es requerida</span>
                </div>
              </div>
              
              <div>
                <label for="precio_referencial" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio Referencial (S/.) *</label>
                <input type="number" id="precio_referencial" formControlName="precio_referencial" min="0" step="0.01" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                <div *ngIf="submitted && f['precio_referencial'].errors" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  <span *ngIf="f['precio_referencial'].errors['required']">El precio es requerido</span>
                  <span *ngIf="f['precio_referencial'].errors['min']">El precio no puede ser negativo</span>
                </div>
              </div>
              
              <div>
                <label for="categorias" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Categorías *</label>
                <select id="categorias" multiple formControlName="categorias" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                  <option *ngFor="let cat of categoriasDisponibles" [value]="cat.id">{{ cat.nombre }}</option>
                </select>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Mantén presionada la tecla Ctrl (o Command en Mac) para seleccionar múltiples categorías</p>
                <div *ngIf="submitted && f['categorias'].errors" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  <span *ngIf="f['categorias'].errors['required']">Debes seleccionar al menos una categoría</span>
                </div>
              </div>
              
              <div>
                <label for="ubicacion_referencia" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación de Referencia *</label>
                <input type="text" id="ubicacion_referencia" formControlName="ubicacion_referencia" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                <div *ngIf="submitted && f['ubicacion_referencia'].errors" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  <span *ngIf="f['ubicacion_referencia'].errors['required']">La ubicación es requerida</span>
                </div>
              </div>
              
              <div class="flex items-center">
                <input type="checkbox" id="estado" formControlName="estado" class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded">
                <label for="estado" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">Servicio activo</label>
              </div>
            </div>
            
            <!-- Horarios -->
            <div class="mb-8">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-md font-medium text-gray-800 dark:text-white">Horarios Disponibles</h3>
                <button 
                  type="button" 
                  (click)="addHorario()" 
                  class="inline-flex items-center text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar Horario
                </button>
              </div>
              
              <div formArrayName="horarios" class="space-y-4">
                <div *ngFor="let horario of horarios.controls; let i = index" [formGroupName]="i" class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div class="flex justify-between items-start mb-3">
                    <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Horario #{{ i + 1 }}</h4>
                    <button 
                      type="button" 
                      (click)="removeHorario(i)" 
                      class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label [for]="'dia_semana_' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Día de la Semana *</label>
                      <select 
                        [id]="'dia_semana_' + i" 
                        formControlName="dia_semana" 
                        class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                        <option value="lunes">Lunes</option>
                        <option value="martes">Martes</option>
                        <option value="miercoles">Miércoles</option>
                        <option value="jueves">Jueves</option>
                        <option value="viernes">Viernes</option>
                        <option value="sabado">Sábado</option>
                        <option value="domingo">Domingo</option>
                      </select>
                    </div>
                    
                    <div>
                      <label [for]="'hora_inicio_' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora de Inicio *</label>
                      <input 
                        type="time" 
                        [id]="'hora_inicio_' + i" 
                        formControlName="hora_inicio" 
                        class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                    </div>
                    
                    <div>
                      <label [for]="'hora_fin_' + i" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora de Fin *</label>
                      <input 
                        type="time" 
                        [id]="'hora_fin_' + i" 
                        formControlName="hora_fin" 
                        class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                    </div>
                  </div>
                  
                  <div class="mt-3 flex items-center">
                    <input type="checkbox" [id]="'activo_' + i" formControlName="activo" class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded">
                    <label [for]="'activo_' + i" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">Horario activo</label>
                  </div>
                </div>
                
                <div *ngIf="horarios.length === 0" class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center">
                  <p class="text-sm text-gray-500 dark:text-gray-400">No hay horarios configurados. Agrega horarios para definir cuándo estará disponible este servicio.</p>
                </div>
              </div>
            </div>
            
            <!-- Ubicación en Mapa (Placeholder) -->
            <div class="mb-8">
              <h3 class="text-md font-medium text-gray-800 dark:text-white mb-4">Ubicación en Mapa</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="latitud" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitud</label>
                  <input type="text" id="latitud" formControlName="latitud" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                </div>
                
                <div>
                  <label for="longitud" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitud</label>
                  <input type="text" id="longitud" formControlName="longitud" class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-orange-500 focus:ring-orange-500">
                </div>
              </div>
              
              <div class="mt-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-dashed border-gray-300 dark:border-gray-600">
                <div class="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Próximamente: Selección de ubicación en mapa
                  </p>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Esta función estará disponible en una próxima actualización.
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Imágenes (Placeholder) -->
            <div class="mb-8">
              <h3 class="text-md font-medium text-gray-800 dark:text-white mb-4">Imágenes del Servicio</h3>
              
              <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-dashed border-gray-300 dark:border-gray-600">
                <div class="text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6.5 20H16a4 4 0 004-4V7a4 4 0 00-4-4H6a4 4 0 00-4 4v9a4 4 0 004 4h.5z" />
                  </svg>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Próximamente: Subir y editar imágenes
                  </p>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Esta función estará disponible en una próxima actualización.
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Botones de Acción -->
            <div class="pt-5 border-t border-gray-200 dark:border-gray-700">
              <div class="flex justify-between">
                <button type="button" (click)="cancel()" class="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                  Cancelar
                </button>
                <button type="submit" [disabled]="submitting" class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                  <span *ngIf="submitting" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></span>
                  {{ isEditing ? 'Guardar Cambios' : 'Crear Servicio' }}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ServicioFormComponent implements OnInit {
  private emprendimientosService = inject(EmprendimientosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  emprendimientoId: number = 0;
  servicioId: number | null = null;
  emprendimiento: Emprendimiento | null = null;
  servicio: Servicio | null = null;
  
  servicioForm: FormGroup | null = null;
  
  loading = true;
  submitting = false;
  submitted = false;
  error = '';
  
  categoriasDisponibles: CategoriaOption[] = [
    { id: 1, nombre: 'Hospedaje' },
    { id: 2, nombre: 'Alimentación' },
    { id: 3, nombre: 'Transporte' },
    { id: 4, nombre: 'Artesanía' },
    { id: 5, nombre: 'Actividades' }
  ];
  
  get isEditing(): boolean {
    return this.servicioId !== null;
  }
  
  get f() {
    return this.servicioForm?.controls || {};
  }
  
  get horarios() {
    return this.f['horarios'] as FormArray;
  }
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.emprendimientoId = +params['id'];
      this.servicioId = params['servicioId'] ? +params['servicioId'] : null;
      
      if (this.servicioId) {
        this.loadServicio();
      } else {
        this.loadEmprendimiento();
      }
    });
    
    // Inicializar el formulario vacío
    this.initForm();
  }
  
  loadEmprendimiento(): void {
    this.loading = true;
    this.error = '';
    
    this.emprendimientosService.getEmprendimiento(this.emprendimientoId).subscribe({
      next: (data) => {
        this.emprendimiento = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar emprendimiento:', err);
        this.error = err.error?.message || 'Error al cargar el emprendimiento. Inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }
  
  loadServicio(): void {
    if (!this.servicioId) return;
    
    this.loading = true;
    this.error = '';
    
    // Primero cargar el emprendimiento
    this.emprendimientosService.getEmprendimiento(this.emprendimientoId).subscribe({
      next: (empData) => {
        this.emprendimiento = empData;
        
        // Luego cargar el servicio
        this.emprendimientosService.getServicio(this.servicioId!).subscribe({
          next: (servData) => {
            this.servicio = servData;
            this.updateForm();
            this.loading = false;
          },
          error: (err) => {
            console.error('Error al cargar servicio:', err);
            this.error = err.error?.message || 'Error al cargar el servicio. Inténtalo de nuevo.';
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
  
  initForm(): void {
    this.servicioForm = this.fb.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      precio_referencial: ['', [Validators.required, Validators.min(0)]],
      emprendedor_id: [this.emprendimientoId],
      estado: [true],
      latitud: [''],
      longitud: [''],
      ubicacion_referencia: ['', [Validators.required]],
      categorias: [[], [Validators.required]],
      horarios: this.fb.array([])
    });
  }
  
  updateForm(): void {
    if (!this.servicio) return;
    
    // Limpiar horarios existentes
    while (this.horarios.length) {
      this.horarios.removeAt(0);
    }
    
    // Agregar cada horario del servicio
    if (this.servicio.horarios && this.servicio.horarios.length > 0) {
      this.servicio.horarios.forEach(horario => {
        this.horarios.push(this.createHorarioFormGroup(horario));
      });
    }
    
    // Extraer IDs de categorías
    const categoriaIds = this.servicio.categorias ? 
      this.servicio.categorias.map(cat => cat.id) : 
      [];
    
    // Actualizar valores del formulario
    this.servicioForm?.patchValue({
      nombre: this.servicio.nombre,
      descripcion: this.servicio.descripcion,
      precio_referencial: this.servicio.precio_referencial,
      emprendedor_id: this.emprendimientoId,
      estado: this.servicio.estado ?? true,
      latitud: this.servicio.latitud,
      longitud: this.servicio.longitud,
      ubicacion_referencia: this.servicio.ubicacion_referencia,
      categorias: categoriaIds
    });
  }
  
  createHorarioFormGroup(horario?: Horario): FormGroup {
    return this.fb.group({
      id: [horario?.id || null],
      dia_semana: [horario?.dia_semana || 'lunes', [Validators.required]],
      hora_inicio: [horario?.hora_inicio || '', [Validators.required]],
      hora_fin: [horario?.hora_fin || '', [Validators.required]],
      activo: [horario?.activo ?? true]
    });
  }
  
  addHorario(): void {
    this.horarios.push(this.createHorarioFormGroup());
  }
  
  removeHorario(index: number): void {
    this.horarios.removeAt(index);
  }
  
  onSubmit(): void {
    this.submitted = true;
    
    if (this.servicioForm?.invalid) {
      // Scrollear al primer error
      const firstError = document.querySelector('.text-red-600');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    this.submitting = true;
    
    if (this.isEditing) {
      this.updateServicio();
    } else {
      this.createServicio();
    }
  }
  
  createServicio(): void {
    if (!this.servicioForm) return;
    
    const servicioData = { ...this.servicioForm.value };
    
    this.emprendimientosService.createServicio(servicioData).subscribe({
      next: (data) => {
        this.submitting = false;
        
        // Mostrar mensaje de éxito y redirigir a la lista
        alert('Servicio creado correctamente');
        this.router.navigate(['/emprendimiento', this.emprendimientoId, 'servicios']);
      },
      error: (err) => {
        console.error('Error al crear servicio:', err);
        this.error = err.error?.message || 'Error al crear el servicio. Inténtalo de nuevo.';
        this.submitting = false;
      }
    });
  }
  
  updateServicio(): void {
    if (!this.servicioForm || !this.servicioId) return;
    
    const servicioData = { ...this.servicioForm.value };
    
    this.emprendimientosService.updateServicio(this.servicioId, servicioData).subscribe({
      next: (data) => {
        this.submitting = false;
        
        // Mostrar mensaje de éxito y redirigir a la lista
        alert('Servicio actualizado correctamente');
        this.router.navigate(['/emprendimiento', this.emprendimientoId, 'servicios']);
      },
      error: (err) => {
        console.error('Error al actualizar servicio:', err);
        this.error = err.error?.message || 'Error al actualizar el servicio. Inténtalo de nuevo.';
        this.submitting = false;
      }
    });
  }
  
  cancel(): void {
    this.router.navigate(['/emprendimiento', this.emprendimientoId, 'servicios']);
  }
}