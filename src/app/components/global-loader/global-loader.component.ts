import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoaderService } from '../../services/loader.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule, BlockUIModule, ProgressSpinnerModule],
  templateUrl: './global-loader.component.html',
  styleUrl: './global-loader.component.css'
})
export class GlobalLoaderComponent implements OnInit {
  private loaderService = inject(LoaderService);
  loading$!: Observable<boolean>;

  ngOnInit(): void {
    this.loading$ = this.loaderService.loading$;
  }
}
