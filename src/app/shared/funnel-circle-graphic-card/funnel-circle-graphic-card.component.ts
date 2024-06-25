import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-funnel-circle-graphic-card',
  templateUrl: './funnel-circle-graphic-card.component.html',
  styleUrls: ['./funnel-circle-graphic-card.component.scss'],
})
export class FunnelCircleGraphicCardComponent implements OnInit {
  @Input() totalApplicants = 0;
  @Input() totalAcceptedApplicants = 0;
  @Input() totalGraduatedApplicants = 0;
  @Input() totalStipends = 0;

  constructor() {}

  ngOnInit() {}
}
