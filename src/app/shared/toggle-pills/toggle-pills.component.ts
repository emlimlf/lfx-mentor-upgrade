import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-toggle-pills',
  templateUrl: './toggle-pills.component.html',
  styleUrls: ['./toggle-pills.component.scss'],
})
export class TogglePillsComponent implements OnInit {
  @Input() leftButtonText = '';
  @Input() rightButtonText = '';
  @Output() selectedPill = new EventEmitter<string>();

  isLeftActive = true;
  isRightActive = false;

  constructor() {}

  ngOnInit() {}

  onPillSelection(pill: string) {
    this.isLeftActive = pill === 'left';
    this.isRightActive = pill === 'right';
    this.selectedPill.next(pill);
  }
}
