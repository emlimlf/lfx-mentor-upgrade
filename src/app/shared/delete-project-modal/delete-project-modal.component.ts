import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProjectCard } from '@app/models/project.model';

export enum DeleteMenteeProject {
  PROJECT_DELETED,
  DISMISSED
}

@Component({
  selector: 'app-delete-project-modal',
  templateUrl: './delete-project-modal.component.html',
  styleUrls: ['./delete-project-modal.component.css']
})

export class DeleteProjectModalComponent implements OnInit {

  @Input() projectCard?: ProjectCard;
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
  }

  close() {
    return this.activeModal.close(DeleteMenteeProject.DISMISSED);
  }
  delete() {
    //todo call delete service
    this.activeModal.close(DeleteMenteeProject.PROJECT_DELETED);
  }

}
