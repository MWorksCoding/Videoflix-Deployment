import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterVerifiedComponent } from './register-verified.component';

describe('RegisterVerifiedComponent', () => {
  let component: RegisterVerifiedComponent;
  let fixture: ComponentFixture<RegisterVerifiedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterVerifiedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterVerifiedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
