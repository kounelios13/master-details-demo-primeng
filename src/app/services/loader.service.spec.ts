import { TestBed } from '@angular/core/testing';
import { LoaderService } from './loader.service';

describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loading$', () => {
    it('should be defined', () => {
      expect(service.loading$).toBeDefined();
    });

    it('should emit false initially', (done) => {
      service.loading$.subscribe((loading) => {
        expect(loading).toBe(false);
        done();
      });
    });
  });

  describe('show', () => {
    it('should set loading to true', (done) => {
      service.show();
      service.loading$.subscribe((loading) => {
        expect(loading).toBe(true);
        done();
      });
    });

    it('should emit true when show is called', (done) => {
      let emissionCount = 0;
      service.loading$.subscribe((loading) => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(loading).toBe(false);
        } else if (emissionCount === 2) {
          expect(loading).toBe(true);
          done();
        }
      });
      service.show();
    });
  });

  describe('hide', () => {
    it('should set loading to false', (done) => {
      service.show();
      service.hide();
      service.loading$.subscribe((loading) => {
        expect(loading).toBe(false);
        done();
      });
    });

    it('should emit false when hide is called after show', (done) => {
      let emissionCount = 0;
      service.loading$.subscribe((loading) => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(loading).toBe(false);
        } else if (emissionCount === 2) {
          expect(loading).toBe(true);
        } else if (emissionCount === 3) {
          expect(loading).toBe(false);
          done();
        }
      });
      service.show();
      service.hide();
    });
  });

  describe('show and hide sequence', () => {
    it('should handle multiple show/hide calls', (done) => {
      const emissions: boolean[] = [];
      
      service.loading$.subscribe((loading) => {
        emissions.push(loading);
        
        if (emissions.length === 5) {
          expect(emissions[0]).toBe(false);
          expect(emissions[1]).toBe(true);
          expect(emissions[2]).toBe(false);
          expect(emissions[3]).toBe(true);
          expect(emissions[4]).toBe(false);
          done();
        }
      });
      
      service.show();
      service.hide();
      service.show();
      service.hide();
    });

    it('should handle show called twice in a row', (done) => {
      const emissions: boolean[] = [];
      
      service.loading$.subscribe((loading) => {
        emissions.push(loading);
        
        if (emissions.length === 3) {
          expect(emissions[0]).toBe(false);
          expect(emissions[1]).toBe(true);
          expect(emissions[2]).toBe(true);
          done();
        }
      });
      
      service.show();
      service.show();
    });

    it('should handle hide called twice in a row', (done) => {
      const emissions: boolean[] = [];
      
      service.loading$.subscribe((loading) => {
        emissions.push(loading);
        
        if (emissions.length === 4) {
          expect(emissions[0]).toBe(false);
          expect(emissions[1]).toBe(true);
          expect(emissions[2]).toBe(false);
          expect(emissions[3]).toBe(false);
          done();
        }
      });
      
      service.show();
      service.hide();
      service.hide();
    });
  });
});
