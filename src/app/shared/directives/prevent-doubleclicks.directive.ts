import { Directive, Input, OnInit, OnDestroy, Output, EventEmitter, HostListener } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { throttleTime, tap } from 'rxjs/operators';

@Directive({
  selector: '[appPreventDoubleClick]',
})
export class PreventDoubleClickDirective implements OnInit, OnDestroy {
  @Input()
  throttleTime = 500;

  @Output()
  throttledClick = new EventEmitter();

  @Output()
  targetClicked = new EventEmitter<HTMLButtonElement>();

  private clicks = new Subject();
  private subscription: Subscription;

  constructor() {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    this.subscription = this.clicks
      .pipe(
        tap((e: any) => {
          if (e && e.path && e.path.length > 1) {
            const button = e.path[1] as HTMLButtonElement;
            this.targetClicked.emit(button);
          }
        }),
        throttleTime(this.throttleTime)
      )
      .subscribe(e => this.emitThrottledClick(e));
  }

  emitThrottledClick(e: any) {
    this.throttledClick.emit(e);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @HostListener('click', ['$event'])
  clickEvent(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.clicks.next(event);
  }
}
