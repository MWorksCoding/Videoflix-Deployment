import { Component } from '@angular/core';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss',
})
export class PrivacyComponent {
  constructor(public common: CommonService) {}

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.common.component = 'imprint-privacy';
  }
}
