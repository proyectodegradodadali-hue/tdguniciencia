import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { Models } from '../../interfaces/models';
import { DetalleProyectoComponent } from "./detalle-proyecto/detalle-proyecto.component";

@Component({
  selector: 'app-lista-proyectos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DetalleProyectoComponent],
  templateUrl: './lista-proyectos.component.html',
  styleUrl: './lista-proyectos.component.css'
})
export class ListaProyectosComponent {

  private _firestore = inject(FirestoreService);

  tab = 0;

  proyectosAll: any[] = [];

  proyectos: any[] = [];

  subcripcion: any;

  constructor() {
    this.consultarProyectos();
  }

  cambiarTab(tab: number) {
    this.tab = tab;
  }

  consultarProyectos() {
    //console.log('id programa enviado', this.idDocumento);
    this.proyectos = [];

    //console.log('Entro a consultarDocumentos');
    const path = `Proyectos`;
    let q: Models.Firebases.whereQuery[];

    q = [['estado', '==', 'Activo']];

    const extras: Models.Firebases.extrasQuery = {
      orderParam: 'docCreado',
      // directionSort: 'asc',
      // limit: 1,
      // group: true
    };
  
    this.subcripcion = this._firestore.getDocumentsQueryChanges(path, q, extras).subscribe(res => {
      this.proyectos = res;
      this.proyectosAll = res;
      this.applyFilters();
    });

  }

  activeFilter = 'Todos';
  searchText = '';
  filterButtons = [
    { label: 'Todos', value: 'Todos' },
    { label: 'Completo', value: 'Completo' },
    { label: 'En Progreso', value: 'En Progreso' },
    { label: 'Rechazado', value: 'Rechazado' },
  ];

  setFilter(filterValue: string) {
    this.activeFilter = filterValue;
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }


  private applyFilters() {
    let filtered = [...this.proyectosAll];

    if (this.activeFilter !== 'Todos') {
      filtered = filtered.filter(item => item.estadoProyecto === this.activeFilter);
    }

    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(item => 
        item.nombreProyecto?.toLowerCase().includes(search) ||
        item.codigoProyecto?.toLowerCase().includes(search) ||
        item.programa?.toLowerCase().includes(search) 
      );
    }

    this.proyectos = filtered;
  }
  
  ngOnDestroy(): void {
    this.subcripcion.unsubscribe();
  }

  
}
