import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomerTableComponent } from './components/customer-table/customer-table.component';
import { GlobalLoaderComponent } from './components/global-loader/global-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CustomerTableComponent, GlobalLoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Master-Details Demo with PrimeNG';
}
