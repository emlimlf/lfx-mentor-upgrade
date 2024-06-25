import { Injectable } from '@angular/core';
import * as moment from 'moment-timezone';
import { BehaviorSubject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { MenteeCSVResponse } from '@app/models/project.model';

@Injectable({
  providedIn: 'root',
})
export class DownloadService {
  $documentUrl = new BehaviorSubject<String>('');
  $documentLoadState = new BehaviorSubject<Boolean>(false);

  selectedFile?: File = undefined;
  fileUrl = '';
  fileExt = '';
  constructor(private sanitizer: DomSanitizer) {}

  get color() {
    const min = 1,
      max = 30;
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  _defaultLogo({ first, last }: any) {
    let fullname = `${first} ${last}`;
    // uncomment below for random background color
    //let color = this.color;
    //comment this out for random background
    let color = this.hashedColor(fullname.trim()) as number;
    let bg = this.hex[color];
    last = last !== '' ? ` + ${last}` : '';
    return `https://ui-avatars.com/api/?name=${first}${last}&background=${bg}&color=fff&rounded=true`;
  }

  getLocalTime(str: any) {
    const zone = moment.tz.guess(true);
    const date = str.substr(0, str.indexOf('+'));
    return moment
      .utc(date.trimEnd())
      .tz(zone)
      .format('YYYY-MM-DD HH:mm:ss');
  }

  downloadFile(data: MenteeCSVResponse[], filename = 'data', mode: any) {
    let csvData;

    let csv =
      mode === 'mentors'
        ? data.map((item: any) => {
            filename = 'mentors';
            return {
              name: item.name,
            };
          })
        : data
            .filter(item => !!item)
            .map(({ firstName, lastName, email, applicationStatus, applicationDateCreate, applicationDateUpdate }) => {
              filename = 'mentees';
              return {
                FirstName: firstName,
                LastName: lastName,
                Email: email,
                Status: applicationStatus,
                CreatedOn: this.getLocalTime(applicationDateCreate),
                UpdatedOn: this.getLocalTime(applicationDateUpdate),
              };
            });

    csvData =
      mode === 'mentors'
        ? this.ConvertToCSV(csv, ['name'])
        : this.ConvertToCSV(csv, ['FirstName', 'LastName', 'Email', 'Status', 'CreatedOn', 'UpdatedOn']);

    let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    let dwldLink = document.createElement('a');
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {
      //if Safari open in new window to save file with random filename.
      dwldLink.setAttribute('target', '_blank');
    }
    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', filename + '.csv');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  ConvertToCSV(objArray: any, headerList: any) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = 'S.No,';

    for (let index in headerList) {
      row += headerList[index] + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = i + 1 + '';
      for (let index in headerList) {
        let head = headerList[index];

        line += ',' + array[i][head];
      }
      str += line + '\r\n';
    }
    return str;
  }

  hex = [
    'ffa2ab',
    '946b2d',
    '6497b1',
    'ff759c',
    '063c75',
    'ff9478',
    '63a194',
    'ff6666',
    'b3c0e2',
    'c8c35c',
    'ffc1b2',
    '63a194',
    'fdd450',
    'ffc1b2',
    'ffb45a',
    'ff6666',
    'ff759c',
    '222f5b',
    'ff2b40',
    'a4d0ff',
    'c8c35c',
    'ff9478',
    '35b899',
    '063c75',
    'b3c0e2',
    '6497b1',
    '99dd44',
    'ffa557',
    'ffa2ab',
    '800d00',
    '800db0',
    '00b000',
    '996699',
    '660066',
    'ff3366',
    'ff3300',
    '3300ff',
    '6633cc',
    '3366cc',
  ];

  hashedColor(str: any, asString?: any, seed?: any) {
    var i,
      l,
      hval = seed === undefined ? 0x811c9dc5 : seed;

    for (i = 0, l = str.length; i < l; i++) {
      hval ^= str.charCodeAt(i);
      hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    if (asString) {
      // Convert to 8 digit hex string
      const hash = ('0000000' + (hval >>> 0).toString(16)).substr(-8);
      return this.getElementSum(hash);
    }
    const hash = hval >>> 0;
    return this.getElementSum(hash);
  }

  getElementSum(str: any) {
    let arr = str
      .toString()
      .substr(0, 4)
      .split('')
      .map((x: string) => parseInt(x, 10));
    return arr.reduce((a: number, b: number) => a + b);
  }

  get defaultLogo() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `data:image/svg+xml;base64,PHN2ZyB4bWxucz0
      iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZ
      XdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBkPSJNNjQ
      gMzcxLjJoNzYuNzk1VjQ0OEgxOTJWMzIwSDY0djUxL
      jJ6bTc2Ljc5NS0yMzAuNEg2NFYxOTJoMTI4VjY0aC0
      1MS4yMDV2NzYuOHpNMzIwIDQ0OGg1MS4ydi03Ni44S
      DQ0OFYzMjBIMzIwdjEyOHptNTEuMi0zMDcuMlY2NEg
      zMjB2MTI4aDEyOHYtNTEuMmgtNzYuOHoiLz48L3N2Zz4=`
    );
  }
}
