import { Component, inject, viewChild, OnDestroy, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NuevoUsuariosComponent } from './nuevo-usuarios/nuevo-usuarios.component';
import { EliminarUsuariosComponent } from './eliminar-usuarios/eliminar-usuarios.component';
import { NuevoDocentesComponent } from './nuevo-docentes/nuevo-docentes.component';
import { Models } from '../../interfaces/models';
import { FirestoreService } from '../../services/firestore.service';

interface Usuario {
  nombre: string;
  email: string;
  rol: 'estudiante' | 'docente';
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EliminarUsuariosComponent, NuevoUsuariosComponent, NuevoDocentesComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnDestroy, OnChanges {

  modalNuevoEditar = viewChild.required<NuevoUsuariosComponent>('modalNuevoEditar');
  modalEliminar = viewChild.required<EliminarUsuariosComponent>('modalEliminar');
  modalNuevoDocentes = viewChild.required<NuevoDocentesComponent>('modalNuevoDocentes');

  private _firestore = inject(FirestoreService);

  usuariosAll: any[] = [];
  usuariosAll2: any[] = [];

  usuarios: any[] = [];

  usuarioAEliminar: Usuario | null = null;

  usuarioForm: FormGroup;

  private subcripcion: any;
  private subcripcion2: any;

  constructor(private fb: FormBuilder) {
    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rol: ['', Validators.required],
    });
    this.consultarUsuarios();
  }

  consultarUsuarios() {
    //console.log('id programa enviado', this.idDocumento);
    this.usuarios = [];

    //console.log('Entro a consultarDocumentos');
    const path = `Estudiantes`;
    const path2 = `Docentes`;
    let q: Models.Firebases.whereQuery[];

    q = [['estado', '==', 'Activo']];

    const extras: Models.Firebases.extrasQuery = {
      orderParam: 'docCreado',
      // directionSort: 'asc',
      // limit: 1,
      // group: true
    };
  
    this.subcripcion = this._firestore.getDocumentsQueryChanges(path, q, extras).subscribe(res => {
      this.usuariosAll = res;
      //console.log('usuarios | estudiantes', this.usuariosAll);
      this.subcripcion2 = this._firestore.getDocumentsQueryChanges(path2, q, extras).subscribe(res => {
        this.usuariosAll2 = res;
        this.usuarios = [...this.usuariosAll, ...this.usuariosAll2];
        this.applyFilters();
        //console.log('usuarios | docentes', this.usuariosAll2);
      });
      
    });

    

    
    //console.log('usuarios', this.usuarios);
    //this.applyFilters();
    // snapshot.docs.forEach((doc: any) => {
    // const data = doc.data();
    // this.actividades.push(data);
    // });

    //console.log('Muestra actividades---->>>', this.actividadesCalendario);
    

  }

  crearNuevoUsuario() {
    // this.esEditar = false;
    // this.usuarioForm.reset();
    // this.mostrarModal = true;
    this.modalNuevoEditar().abrirModal('crear', null);
  }

  crearNuevoDocente() {
    this.modalNuevoDocentes().abrirModal('crear', null);
  }

  editarUsuario(usuario: Usuario) {
    this.modalNuevoEditar().abrirModal('editar', usuario);
  }

  eliminarUsuario(usuario: Usuario) {
    this.usuarioAEliminar = usuario;
    this.modalEliminar().abrirModal(usuario);
  }

  cerrarModal() {
    this.modalNuevoEditar().cerrarModal();
  }

  cerrarModalEliminar() {
    this.modalEliminar().cerrarModal();
  }

  /// Filtros registros

  ngOnChanges(changes: SimpleChanges): void {
    this.applyFilters();
  }

  activeFilter = 'Todos';
  searchText = '';
  filterButtons = [
    { label: 'Todos', value: 'Todos' },
    { label: 'Estudiante', value: 'Estudiante' },
    { label: 'Docente', value: 'Docente' },
  ];

  setFilter(filterValue: string) {
    this.activeFilter = filterValue;
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.usuariosAll, ...this.usuariosAll2];

    if (this.activeFilter !== 'Todos') {
      filtered = filtered.filter(item => item.tipoUsuario === this.activeFilter);
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

    this.usuarios = filtered;
  }
  
  ngOnDestroy(): void {
    if (this.subcripcion) {
      this.subcripcion.unsubscribe();
    }
    if (this.subcripcion2) {
      this.subcripcion2.unsubscribe();
    }
  }

  // Modal usuario seleccionado
  usuarioSeleccionado = signal<any | null>(null);

  abrirModalUsuario(usuario: any) {
    this.usuarioSeleccionado.set(usuario);
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

}
