import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-coordinacion',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './coordinacion.component.html',
  styleUrl: './coordinacion.component.css'
})
export class CoordinacionComponent {

  constructor() { }

}
