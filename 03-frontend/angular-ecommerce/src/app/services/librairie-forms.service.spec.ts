import { TestBed } from '@angular/core/testing';

import { LibrairieFormsService } from './librairie-forms.service';

describe('LibrairieFormsService', () => {
  let service: LibrairieFormsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibrairieFormsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
