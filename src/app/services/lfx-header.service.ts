import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { AuthService } from './auth.service';

function setHeaderScript() {
  const script = document.createElement('script');
  script.setAttribute('src', environment.LFx_Header_URL);
  script.setAttribute('async', 'true');

  if (document && document.head) {
    document.head.appendChild(script);
  }

  const header: any = document.getElementById('lfx-header');
  if (header) {
    header.product = 'CB People';
    header.docslink = 'https://docs.linuxfoundation.org/lfx/mentorship';
    header.supportlink = 'https://jira.linuxfoundation.org/servicedesk/customer/portal/4';
    header.faqlink = 'https://docs.linuxfoundation.org/lfx/mentorship/mentorship-faqs';
    header.links = [
      {
        title: 'Enroll a Program',
        url: '/participate/maintainer',
      },
      {
        title: 'Become a Mentor',
        url: '/participate/mentor',
      },
      {
        title: 'Become a Mentee',
        url: '/participate/mentee',
      },
    ];
  }
}

function setFooterScript() {
  const script = document.createElement('script');
  script.setAttribute('src', environment.LFx_Footer_URL);
  script.setAttribute('async', 'true');

  if (document && document.head) {
    document.head.appendChild(script);
  }
}

setHeaderScript();
setFooterScript();

@Injectable({
  providedIn: 'root',
})
export class LfxHeaderService {
  constructor(private auth: AuthService) {
    this.setUserInLFxHeader();
    this.setCallBackUrl();
    this.setLogoutUrl();
  }

  setCallBackUrl() {
    console.log('entered setCallBackUrl');
    const lfHeaderEl: any = document.getElementById('lfx-header');
    if (!lfHeaderEl) {
      return;
    }
    console.log('app setCallBackUrl ', this.auth.auth0Options.callbackUrl);
    lfHeaderEl.callbackurl = this.auth.auth0Options.callbackUrl;
  }
  setLogoutUrl() {
    const lfHeaderEl: any = document.getElementById('lfx-header');
    if (!lfHeaderEl) {
      return;
    }
    lfHeaderEl.logouturl = this.auth.auth0Options.logoutUrl;
  }

  setUserInLFxHeader(): void {
    const lfHeaderEl: any = document.getElementById('lfx-header');
    if (!lfHeaderEl) {
      return;
    }

    this.auth.userProfile$.subscribe(data => {
      if (data) {
        lfHeaderEl.authuser = data;
      }
    });
  }
}
