import { Component, inject, signal, SimpleChanges, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { Models } from '../../interfaces/models';
import { NuevoProyectoComponent } from './nuevo-proyecto/nuevo-proyecto.component';
import { EliminarProyectoComponent } from './eliminar-proyecto/eliminar-proyecto.component';
import { AsignarDirectorTematicoComponent } from "./asignar-director-tematico/asignar-director-tematico.component";
import { AsignarDirectorMetodologicoComponent } from "./asignar-director-metodologico/asignar-director-metodologico.component";
import { AsignarEstudiantesComponent } from "./asignar-estudiantes/asignar-estudiantes.component";
import { AdjuntasDocumentosComponent } from "./adjuntas-documentos/adjuntas-documentos.component";

interface DocumentoAdjunto {
  url: string;
  nombreOriginal: string;
  fechaSubida: string;
}

interface Proyecto {
  nombreProyecto: string;
  codigoProyecto: string;
  codigoEstudiantes: string[];
  estudiantes: string[];
  codigoDirectorTematico: string;
  directorTematico: string;
  codigoDirectorMetodologico: string;
  directorMetodologico: string;
  ano: number;
  estadoProyecto: 'Completo' | 'En Progreso' | 'Rechazado';
  porcentaje: number;
  documentos: string[];
  fechaInicio: string;
  fechaFin: string;
  prorogas: string[];
  programa: string;
}

@Component({
  selector: 'app-historial-proyectos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NuevoProyectoComponent, EliminarProyectoComponent, AsignarDirectorTematicoComponent, AsignarDirectorMetodologicoComponent, AsignarEstudiantesComponent, AdjuntasDocumentosComponent],
  templateUrl: './historial-proyectos.component.html',
  styleUrl: './historial-proyectos.component.css'
})
export class HistorialProyectosComponent {

  modalNuevoEditar = viewChild.required<NuevoProyectoComponent>('modalNuevoEditar');
  modalEliminar = viewChild.required<EliminarProyectoComponent>('modalEliminar');
  modalAsignarDirectorTematico = viewChild.required<AsignarDirectorTematicoComponent>('modalAsignarDirectorTematico');
  modalAsignarDirectorMetodologico = viewChild.required<AsignarDirectorMetodologicoComponent>('modalAsignarDirectorMetodologico');
  modalAsignarEstudiantes = viewChild.required<AsignarEstudiantesComponent>('modalAsignarEstudiantes');
  modalAdjuntasDocumentos = viewChild.required<AdjuntasDocumentosComponent>('modalAdjuntasDocumentos');


  private _firestore = inject(FirestoreService);

  proyectosAll: any[] = [];

  proyectos: any[] = [];

  proyectoAEliminar: Proyecto | null = null;

  usuarioForm: FormGroup;

  private subcripcion: any;

  urlDocumentos: DocumentoAdjunto[] = [];

  constructor() {
    this.consultarProyectos();
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

    

    
    //console.log('usuarios', this.usuarios);
    //this.applyFilters();
    // snapshot.docs.forEach((doc: any) => {
    // const data = doc.data();
    // this.actividades.push(data);
    // });

    //console.log('Muestra actividades---->>>', this.actividadesCalendario);
    

  }

  crearNuevoProyecto() {
    // this.esEditar = false;
    // this.usuarioForm.reset();
    // this.mostrarModal = true;
    this.modalNuevoEditar().abrirModal('crear', null);
  }

  editarProyecto(proyecto: Proyecto) {
    this.modalNuevoEditar().abrirModal('editar', proyecto);
  }

  eliminarProyecto(proyecto: Proyecto) {
    this.proyectoAEliminar = proyecto;
    this.modalEliminar().abrirModal(proyecto);
  }

  cerrarModal() {
    this.modalNuevoEditar().cerrarModal();
  }

  cerrarModalEliminar() {
    //this.modalEliminar().cerrarModal();
  }

  /// Filtros registros

  ngOnChanges(changes: SimpleChanges): void {
    this.applyFilters();
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
        item.nombreUsuario?.toLowerCase().includes(search) ||
        item.correoInstitucional?.toLowerCase().includes(search) ||
        item.programa?.toLowerCase().includes(search) ||
        item.codigoEstudiante?.toLowerCase().includes(search)
      );
    }

    this.proyectos = filtered;
  }
  
  ngOnDestroy(): void {
    this.subcripcion.unsubscribe();
  }

  // Modal usuario seleccionado
  usuarioSeleccionado = signal<any | null>(null);

  abrirModalUsuario(proyecto: any) {
    if (proyecto.urlDocumentos && proyecto.urlDocumentos.length > 0) {
      // Si es el formato antiguo (array de strings)
      if (typeof proyecto.urlDocumentos[0] === 'string') {
        this.urlDocumentos = proyecto.urlDocumentos.map((url: string) => ({
          url: url,
          nombreOriginal: this.obtenerNombreArchivo(url),
          fechaSubida: new Date().toISOString()
        }));
      } else {
        // Si ya es el formato nuevo (array de objetos)
        this.urlDocumentos = proyecto.urlDocumentos;
      }
    } else {
      this.urlDocumentos = [];
    }
    this.usuarioSeleccionado.set(proyecto);
  }

  cerrarModalUsuario() {
    this.usuarioSeleccionado.set(null);
  }

  // Métodos para manejar colores de estado
  getColorEstado(estado: string): string {
    switch (estado) {
      case "Pendiente":
        return "bg-red-500"
      case "En ejecución":
        return "bg-yellow-500"
      case "Completada":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  getTextColorEstado(estado: string): string {
    switch (estado) {
      case "Pendiente":
        return "text-red-700"
      case "En ejecución":
        return "text-yellow-700"
      case "Completada":
        return "text-green-700"
      default:
        return "text-gray-700"
    }
  }

  // Modal Asignar Director Temático
  abrirModalAsignarDirectorTematico(proyecto: Proyecto) {
    this.modalAsignarDirectorTematico().abrirModal('editar', proyecto);
  }

  cerrarModalAsignarDirectorTematico() {
    this.modalAsignarDirectorTematico().cerrarModal();
  }

  // Modal Asignar Director Metodologico
  abrirModalAsignarDirectorMetodologico(proyecto: Proyecto) {
    this.modalAsignarDirectorMetodologico().abrirModal('editar', proyecto);
  }

  cerrarModalAsignarDirectorMetodologico() {
    this.modalAsignarDirectorMetodologico().cerrarModal();
  }

  // Modal Asignar Estudiantes
  abrirModalAsignarEstudiantes(proyecto: Proyecto) {
    console.log('proyecto', proyecto);
    this.modalAsignarEstudiantes().abrirModal('editar', proyecto);
  }

  cerrarModalAsignarEstudiantes() {
    this.modalAsignarEstudiantes().cerrarModal();
  }

  // Modal Adjuntas Documentos
  abrirModalAdjuntasDocumentos(proyecto: Proyecto) {
    console.log('proyecto', proyecto);
    this.modalAdjuntasDocumentos().abrirModal(proyecto);
  }

  cerrarModalAdjuntasDocumentos() {
    this.modalAdjuntasDocumentos().cerrarModal();
  }

  ////DOCUMENTOS ADJUNTOS

  // Extraer el nombre del archivo de la URL
  obtenerNombreArchivo(item: string | DocumentoAdjunto): string {
    // Si es un objeto con nombreOriginal, usarlo
    if (typeof item === 'object' && item.nombreOriginal) {
      return item.nombreOriginal;
    }
    
    // Si es string (formato antiguo), extraer de la URL
    const url = typeof item === 'string' ? item : item.url;
    
    try {
      const decodedUrl = decodeURIComponent(url);
      const match = decodedUrl.match(/DocumentosProyectos%2F([^?]+)/);
      if (match && match[1]) {
        // Remover el timestamp si existe
        const nombreConTimestamp = decodeURIComponent(match[1]);
        return nombreConTimestamp.replace(/_\d{13}(\.[^.]+)$/, '$1');
      }
      
      const segments = decodedUrl.split('/');
      const lastSegment = segments[segments.length - 1];
      const filename = lastSegment.split('?')[0];
      return filename || 'Documento sin nombre';
    } catch (error) {
      return 'Documento';
    }
  }

  // Obtener la extensión del archivo
  obtenerExtension(item: string | DocumentoAdjunto): string {
    const nombre = this.obtenerNombreArchivo(item);
    const extension = nombre.split('.').pop()?.toUpperCase() || 'DOC';
    return extension;
  }

  obtenerClaseExtension(item: string | DocumentoAdjunto): string {
    const ext = this.obtenerExtension(item).toLowerCase();
    
    const clases: { [key: string]: string } = {
      'pdf': 'bg-red-100 text-red-800',
      'doc': 'bg-blue-100 text-blue-800',
      'docx': 'bg-blue-100 text-blue-800',
      'zip': 'bg-yellow-100 text-yellow-800',
      'rar': 'bg-yellow-100 text-yellow-800',
      'png': 'bg-yellow-100 text-yellow-800',
      'jpg': 'bg-yellow-100 text-yellow-800',
      'jpeg': 'bg-green-100 text-green-800',
      'xlsx': 'bg-green-100 text-green-800',
      'pptx': 'bg-orange-100 text-orange-800',
      'ppt': 'bg-orange-100 text-orange-800',
      'xls': 'bg-green-100 text-green-800',
    };
    
    return clases[ext] || 'bg-gray-100 text-gray-800';
  }

  // Ver documento (abre en nueva pestaña)
  verDocumento(item: string | DocumentoAdjunto): void {
    const url = typeof item === 'string' ? item : item.url;
    window.open(url, '_blank');
  }

  
}
