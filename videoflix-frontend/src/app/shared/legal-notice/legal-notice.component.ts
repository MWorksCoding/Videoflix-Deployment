import { Component } from '@angular/core';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.scss',
})
export class LegalNoticeComponent {
  constructor(public common: CommonService) {}

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.common.component = 'imprint-privacy';
  }
}
