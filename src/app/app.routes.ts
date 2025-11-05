import { Routes } from '@angular/router';

// Layouts
import { DocenteComponent } from './layauts/docente/docente.component';
import { EstudianteComponent } from './layauts/estudiante/estudiante.component';

// Estudiante
import { DashboardComponent as EstudianteDashboard } from './estudiante/dashboard/dashboard.component';
import { ProyectosComponent } from './estudiante/proyectos/proyectos.component';
import { SubirDocumentosComponent } from './estudiante/subir-documentos/subir-documentos.component';
import { EstadoProyectoComponent } from './estudiante/estado-proyecto/estado-proyecto.component';
import { CronogramaComponent } from './estudiante/cronograma/cronograma.component';

// Docente
import { DashboardComponent as DocenteDashboard } from './docente/dashboard/dashboard.component';
import { ListaProyectosComponent } from './docente/lista-proyectos/lista-proyectos.component';
import { ObservacionesComponent } from './docente/observaciones/observaciones.component';
import { CoordinacionComponent } from './layauts/coordinacion/coordinacion.component';

// Coordinacion
import { DashboardComponent as CoordinacionDashboard } from './coordinacion/dashboard/dashboard.component';
import { UsuariosComponent } from './coordinacion/usuarios/usuarios.component';
import { HistorialProyectosComponent } from './coordinacion/historial-proyectos/historial-proyectos.component';
import { ReportesComponent } from './coordinacion/reportes/reportes.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';


export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'estudiante',
    component: EstudianteComponent,
    children: [
      { path: 'dashboard', component: EstudianteDashboard },
      { path: 'proyectos', component: ProyectosComponent },
      { path: 'subir-documentos', component: SubirDocumentosComponent },
      { path: 'estado-proyecto', component: EstadoProyectoComponent },
      { path: 'cronograma', component: CronogramaComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'docente',
    component: DocenteComponent,
    children: [
      { path: 'dashboard', component: DocenteDashboard },
      { path: 'lista-proyectos', component: ListaProyectosComponent },
      { path: 'observaciones', component: ObservacionesComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'coordinacion',
    component: CoordinacionComponent,
    children: [
      { path: 'dashboard', component: CoordinacionDashboard },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'proyectos', component: HistorialProyectosComponent },
      { path: 'reportes', component: ReportesComponent },
      { path: 'nuevo-usuarios', component: RegisterComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // ruta raíz
  { path: '**', redirectTo: '/login' } // ruta desconocida
];
