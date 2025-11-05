import { Component, inject, OnDestroy } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Models } from '../../interfaces/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnDestroy {

  private _firestore = inject(FirestoreService);

  usuarios: any[] = [];
  docentes: any[] = [];
  proyectos: any[] = [];
  contarUsuarios: number = 0;
  contarDocentes: number = 0;
  contarProyectos: number = 0;
  subcripcion: any;

  constructor() {
    this.consultarUsuarios();
    this.consultarDocentes();
    this.consultarProyectos();
  }

  consultarUsuarios() {
    const path = `Estudiantes`;
    const q: Models.Firebases.whereQuery[] = [];
    const extras: Models.Firebases.extrasQuery = {
      orderParam: 'docCreado',
      // directionSort: 'desc',
      // limit: 10,
      // group: true
    };
    this.subcripcion = this._firestore.getDocumentsQueryChanges(path, q, extras).subscribe(res => {
      this.usuarios = res;
      this.contarUsuarios = this.usuarios.length;
      console.log('usuarios', this.usuarios);
    });
  }

  consultarDocentes() {
    const path = `Docentes`;
    const q: Models.Firebases.whereQuery[] = [];
    const extras: Models.Firebases.extrasQuery = {
      orderParam: 'docCreado',
      // directionSort: 'desc',
      // limit: 10,
      // group: true
    };
    this.subcripcion = this._firestore.getDocumentsQueryChanges(path, q, extras).subscribe(res => {
      this.docentes = res;
      this.contarDocentes = this.docentes.length;
      console.log('docentes', this.docentes);
    });
  }

  consultarProyectos() {
    const path = `Proyectos`;
    const q: Models.Firebases.whereQuery[] = [];
    const extras: Models.Firebases.extrasQuery = {
      orderParam: 'docCreado',
      // directionSort: 'desc',
      // limit: 10,
      // group: true
    };
    this.subcripcion = this._firestore.getDocumentsQueryChanges(path, q, extras).subscribe(res => {
      this.proyectos = res;
      this.contarProyectos = this.proyectos.length;
      console.log('proyectos', this.proyectos);
    });
  }

  ngOnDestroy(): void {
    if (this.subcripcion) {
      this.subcripcion.unsubscribe();
    }
  }

}
