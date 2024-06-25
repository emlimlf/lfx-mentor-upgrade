import { Component, Input, OnInit } from '@angular/core';
import { PopularProgram } from '@app/services/project.service';

@Component({
  selector: 'app-popular-program-card',
  templateUrl: './popular-program-card.component.html',
  styleUrls: ['./popular-program-card.component.scss'],
})
export class PopularProgramCardComponent implements OnInit {
  @Input() program!: PopularProgram;

  constructor() {}

  ngOnInit() {}
}
