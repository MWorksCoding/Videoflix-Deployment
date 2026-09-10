import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginHelpComponent } from './login-help.component';

describe('LoginHelpComponent', () => {
  let component: LoginHelpComponent;
  let fixture: ComponentFixture<LoginHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
