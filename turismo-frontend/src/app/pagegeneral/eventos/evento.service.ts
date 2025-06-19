import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  imagen: string;
  lugar?: string;
  organizador?: string;
  detallesAdicionales?: string;
  tipo?: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Evento[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private apiUrl = 'http://127.0.0.1:8000/api/eventos';

  constructor(private http: HttpClient) {}

  getEventos(): Observable<Evento[]> {
    return new Observable<Evento[]>(observer => {
      this.http.get<ApiResponse>(this.apiUrl).subscribe({
        next: (response) => {
          if (response.success) {
            observer.next(response.data.data);
            observer.complete();
          } else {
            observer.error('Error en la respuesta de la API');
          }
        },
        error: (err) => observer.error(err)
      });
    });
  }

  getEventoById(id: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/${id}`);
  }
}
