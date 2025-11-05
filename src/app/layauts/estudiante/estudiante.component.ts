import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from "@angular/router";

@Component({
  selector: 'app-estudiante',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './estudiante.component.html',
  styleUrl: './estudiante.component.css'
})
export class EstudianteComponent {
  constructor() { }


}
