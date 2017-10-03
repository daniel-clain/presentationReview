import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentationHistoryComponent } from './presentation-history.component';

describe('PresentationHistoryComponent', () => {
  let component: PresentationHistoryComponent;
  let fixture: ComponentFixture<PresentationHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PresentationHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresentationHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
