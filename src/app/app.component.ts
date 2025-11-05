import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomerTableComponent } from './components/customer-table/customer-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CustomerTableComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Master-Details Demo with PrimeNG';
}
