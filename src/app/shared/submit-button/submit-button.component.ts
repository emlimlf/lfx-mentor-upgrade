// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export enum SubmitState {
  READY = 'ready',
  SUBMITTING = 'submitting',
  SUCCESS = 'success',
  FAILED = 'failed',
  DISABLED = 'disabled'
}

const styleMap = {
  [SubmitState.READY]: 'btn btn-success',
  [SubmitState.FAILED]: 'btn btn-danger',
  [SubmitState.SUBMITTING]: 'btn btn-success',
  [SubmitState.SUCCESS]: 'btn btn-success',
  [SubmitState.DISABLED]: 'btn btn-disabled'
};

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
  styleUrls: ['./submit-button.component.scss']
})
export class SubmitButtonComponent implements OnInit {
  submitStateType = SubmitState;

  @Input() state = SubmitState.READY;

  @Input() readyText = 'Submit';
  @Input() buttonClasses = '';

  @Output() submitted = new EventEmitter<SubmitButtonComponent>();

  get isDisabled() {
    return this.state !== SubmitState.READY;
  }

  get buttonClass() {
    return styleMap[this.state] + ' ' + this.buttonClasses;
  }

  constructor() {}

  ngOnInit() {}

  onSubmit() {
    this.submitted.emit(this);
  }
}
