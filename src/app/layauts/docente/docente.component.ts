import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from "@angular/router";

@Component({
  selector: 'app-docente',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './docente.component.html',
  styleUrl: './docente.component.css'
})
export class DocenteComponent {

}
