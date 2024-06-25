import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appEditTypeHead]'
})
export class EditTypeHeadDirective {
  @Input() public typeHead: any;
  constructor(private el: ElementRef) {}

  @HostListener('keyup', ['$event'])
  onKeyUp(e: any) {
    if (e.keyCode === '38' || e.keyCode === 38) {
      // up arrow
      this.scrollToPos(true);
    } else if (e.keyCode === '40' || e.keyCode === 40) {
      // down arrow
      this.scrollToPos(false);
    } else {
      this.appendSeeMoreDivs();
    }
  }
  @HostListener('focus', ['$event'])
  onFocus(e: any) {
    setTimeout(() => {
      this.appendSeeMoreDivs();
    }, 100);
  }

  appendSeeMoreDivs() {
    if (this.typeHead._windowRef && this.typeHead._windowRef.location && this.typeHead._windowRef.location.nativeElement) {
      const nativeElement = this.typeHead._windowRef.location.nativeElement;
      nativeElement.classList.add('custom-dropdown-list');

      const upperDiv = this.createDiv('upper-div', 0);
      const lowerDiv = this.createDiv('lower-div', 284);

      if (nativeElement.getElementsByClassName && nativeElement.getElementsByClassName(upperDiv.className).length === 0) {
        nativeElement.appendChild(upperDiv);
      }
      if (nativeElement.getElementsByClassName && nativeElement.getElementsByClassName(lowerDiv.className).length === 0) {
        nativeElement.appendChild(lowerDiv);
      }

      nativeElement.addEventListener('scroll', function() {
        if (nativeElement.scrollTop > 0) {
          upperDiv.style.top = nativeElement.scrollTop + 'px';
          upperDiv.style.display = 'block';
        } else {
          upperDiv.style.display = 'none';
        }

        if (nativeElement.scrollHeight - nativeElement.scrollTop - 300 > 0) {
          lowerDiv.style.top = nativeElement.scrollTop + 300 - 16 + 'px';
          lowerDiv.style.display = 'block';
        } else {
          lowerDiv.style.display = 'none';
        }
      });
    }
  }

  createDiv(type: string, top: number) {
    const div = document.createElement('div');

    div.style.top = top + 'px';
    div.innerHTML = '...';

    if (type === 'lower-div') {
      div.style.display = 'block';
    }
    div.className = type + ' dropdown-more-div';

    return div;
  }

  scrollToPos(direction: boolean) {
    if (this.typeHead._windowRef && this.typeHead._windowRef.location && this.typeHead._windowRef.location.nativeElement) {
      const dropdownDiv = this.typeHead._windowRef.location.nativeElement;
      if (direction) {
        if (dropdownDiv.scrollTop > 0) {
          dropdownDiv.scroll(0, dropdownDiv.scrollTop - 32);
        }
      } else {
        if (dropdownDiv.scrollTop < dropdownDiv.scrollHeight) {
          dropdownDiv.scroll(0, dropdownDiv.scrollTop + 32);
        }
      }
    }
  }
}
