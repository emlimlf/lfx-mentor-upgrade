import { Component, Input, OnInit } from '@angular/core';
import { DownloadService } from '@app/services/download.service';
import { PopularMentor } from '@app/services/project.service';

@Component({
  selector: 'app-popular-mentor-card',
  templateUrl: './popular-mentor-card.component.html',
  styleUrls: ['./popular-mentor-card.component.scss'],
})
export class PopularMentorCardComponent implements OnInit {
  @Input() mentor!: PopularMentor;
  constructor(private downloadService: DownloadService) {}

  ngOnInit() {
    if (!this.mentor.photoURL || (this.mentor.photoURL as string).includes('s.gravatar')) {
      this.mentor.photoURL = this.downloadService._defaultLogo({
        first: this.mentor.name,
        last: '',
      });
    }
  }
}
