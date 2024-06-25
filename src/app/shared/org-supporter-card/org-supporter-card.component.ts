import { Component, Input, OnInit } from '@angular/core';
import { OrganizationalSupporter } from '@app/services/project.service';

@Component({
  selector: 'app-org-supporter-card',
  templateUrl: './org-supporter-card.component.html',
  styleUrls: ['./org-supporter-card.component.scss'],
})
export class OrgSupporterCardComponent implements OnInit {
  @Input() organization!: OrganizationalSupporter;

  constructor() {}

  ngOnInit() {}
}
