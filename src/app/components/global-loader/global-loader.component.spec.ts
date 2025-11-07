import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalLoaderComponent } from './global-loader.component';
import { LoaderService } from '../../services/loader.service';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('GlobalLoaderComponent', () => {
  let component: GlobalLoaderComponent;
  let fixture: ComponentFixture<GlobalLoaderComponent>;
  let loaderService: LoaderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalLoaderComponent],
      providers: [LoaderService, provideAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalLoaderComponent);
    component = fixture.componentInstance;
    loaderService = TestBed.inject(LoaderService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize loading$ observable', () => {
    expect(component.loading$).toBeDefined();
  });

  it('should subscribe to loader service loading$ observable', (done) => {
    component.loading$.subscribe((loading) => {
      expect(loading).toBe(false);
      done();
    });
  });

  it('should reflect loading state from loader service', (done) => {
    loaderService.show();
    
    component.loading$.subscribe((loading) => {
      expect(loading).toBe(true);
      done();
    });
  });

  it('should update when loader service hides', (done) => {
    loaderService.show();
    loaderService.hide();
    
    component.loading$.subscribe((loading) => {
      expect(loading).toBe(false);
      done();
    });
  });
});
