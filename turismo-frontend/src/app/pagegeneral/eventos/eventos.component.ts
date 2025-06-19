import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CalendarEvent, CalendarModule, CalendarUtils } from 'angular-calendar';
import { Evento, EventosService } from './evento.service';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CalendarModule],
  providers: [CalendarUtils],
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.css']
})
export class EventosComponent implements OnInit {
  eventos: Evento[] = [];
  viewDate: Date = new Date();
  calendarEvents: CalendarEvent[] = [];
  eventoDestacado: Evento | undefined;

  // Filtros seleccionados por el usuario
  filtroAnio: string = 'todos';
  filtroMes: string = 'proximos';
  filtroTipo: string = 'todos';

  mostrarModalCalendario = false;

  constructor(private eventosService: EventosService) {}

  ngOnInit(): void {
    this.cargarEventos();
  }

cargarEventos(): void {
  this.eventosService.getEventos().subscribe((eventos) => {
    this.eventos = eventos;

    if (this.eventos.length > 0) {
      this.eventoDestacado = this.eventos.find(e => e.id === 1) || this.eventos[0];
    }

    this.actualizarCalendario();
  });
}

  get eventosFiltrados(): Evento[] {
    const hoy = new Date();

    return this.eventos.filter(e => {
      const fecha = new Date(e.fecha);
      const anio = fecha.getFullYear().toString();
      const mes = fecha.toLocaleString('es-PE', { month: 'long' }).toLowerCase();

      const cumpleAnio = this.filtroAnio === 'todos' || this.filtroAnio === anio;
      const cumpleMes =
        this.filtroMes === 'proximos'
          ? fecha >= hoy
          : mes === this.filtroMes.toLowerCase();
      const cumpleTipo =
        this.filtroTipo === 'todos' || (e.tipo?.toLowerCase() === this.filtroTipo.toLowerCase());

      return cumpleAnio && cumpleMes && cumpleTipo;
    });
  }

  actualizarCalendario(): void {
    this.calendarEvents = this.eventosFiltrados.map(e => ({
      start: new Date(e.fecha),
      title: e.titulo,
      allDay: true
    }));
  }

  openCalendar() {
    this.mostrarModalCalendario = false;
  }
}
