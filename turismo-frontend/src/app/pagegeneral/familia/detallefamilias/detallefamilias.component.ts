import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { EmprendedorService } from './emprendedores.service';
import { ServicioService } from './servicios.service';
import { Servicio } from './servicio.model';
import { Emprendedor } from './emprendedor.model';

import Swiper from 'swiper';
import { SwiperOptions } from 'swiper/types';
import { Navigation, Pagination } from 'swiper/modules';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { FormArray, FormGroup } from '@angular/forms';
import { UbicacionMapComponent } from '../../../shared/components/ubicacion-map/ubicacion-map.component';

Swiper.use([Navigation, Pagination]);

@Component({
  selector: 'app-detallefamilias',
  templateUrl: './detallefamilias.component.html',
  styleUrls: ['./detallefamilias.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, UbicacionMapComponent]
})
export class DetallefamiliasComponent implements OnInit {
  emprendedor!: Emprendedor | null;
  servicios: Servicio[] = [];
  id: number = 0;

  selectedServicio: Servicio | null = null;
  mostrarModal: boolean = false;
  servicioForm!: FormGroup;

  latitud: number = -15.6417;
  longitud: number = -69.8306;

  // Recibir nueva ubicación seleccionada
  actualizarUbicacion(e: { lat: number, lng: number }) {
    this.latitud = e.lat;
    this.longitud = e.lng;
  }

  // Orden de días de la semana (empezando por lunes)
  diasOrden: { [key: string]: number } = {
    'lunes': 1,
    'martes': 2,
    'miercoles': 3,
    'jueves': 4,
    'viernes': 5,
    'sabado': 6,
    'domingo': 7
  };

  // Traducciones de días para mostrar correctamente
  traduccionDias: { [key: string]: string } = {
    'lunes': 'Lunes',
    'martes': 'Martes',
    'miercoles': 'Miércoles',
    'jueves': 'Jueves',
    'viernes': 'Viernes',
    'sabado': 'Sábado',
    'domingo': 'Domingo'
  };

  constructor(
    private route: ActivatedRoute,
    private emprendedorService: EmprendedorService,
    private servicioService: ServicioService,
    private sanitizer: DomSanitizer
  ) { }

  cargando = true;

  ngOnInit(): void {
    // Captura el ID de la URL
    this.route.paramMap.subscribe(params => {
      this.id = Number(params.get('id')); // Convierte el ID a número
      this.cargarEmprendedor();
      this.cargarServicios();
    });

    setTimeout(() => {
      this.cargando = false; // cuando termines de cargar los datos
    }, 2000);

  }

  cargarEmprendedor() {
    // Llama al servicio para obtener el emprendedor por ID
    this.emprendedorService.getEmprendedorById(this.id).subscribe(emprendedor => {
      this.emprendedor = emprendedor;
      if (!emprendedor) {
        console.warn('Emprendedor no encontrado con ID:', this.id);
      } else {
        console.log('Emprendedor cargado:', emprendedor);
      }
    });
  }

  cargarServicios() {
    this.servicioService.obtenerServicios().subscribe((resp: any) => {
      // resp es el objeto completo
      const serviciosArray = resp.data?.data; // Aquí está el array real

      if (Array.isArray(serviciosArray)) {
        this.servicios = serviciosArray.filter(s => s.emprendedor_id === this.id);
      } else {
        console.error('La propiedad data.data no es un array:', serviciosArray);
        this.servicios = [];
      }
    }, error => {
      console.error('Error en obtenerServicios:', error);
    });
  }



  // Ordena los horarios por día de la semana
  getOrdenadosHorarios(horarios: any[] | undefined): any[] {
    if (!horarios || !Array.isArray(horarios)) return [];

    return [...horarios].sort((a, b) => {
      return this.diasOrden[a.dia_semana] - this.diasOrden[b.dia_semana];
    });
  }

  // Traduce el día de la semana
  traducirDia(dia: string): string {
    return this.traduccionDias[dia] || dia;
  }



  getImagenesSecundarias(): any[] {
    // Devuelve las imágenes secundarias si existen
    return this.emprendedor?.sliders_secundarios || [];

  }

  getImagenesPrincipal(): string[] {
    // Devuelve las imágenes principales si existen
    return this.emprendedor?.sliders_principales?.map(s => s.url_completa) || [];
  }

  getSlidersSecundarios(): any[] {
    return this.emprendedor?.sliders_secundarios || [];
  }







  //Método para sanitizar URLs de mapas de Google
  getMapaUrl(lat: number | string, lng: number | string): SafeResourceUrl {
    if (!lat || !lng || isNaN(Number(lat)) || isNaN(Number(lng))) {
      console.warn('Latitud o longitud inválida:', lat, lng);
      return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
    }

    const url = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }



  get horariosArray(): FormArray {
    return this.servicioForm.get('horarios') as FormArray;
  }





  ngAfterViewInit(): void {
    setTimeout(() => {

      new Swiper('.mySwiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        breakpoints: {
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        },
      });
    }, 100); // Pequeño delay para asegurar que el DOM está listo
  }
}
