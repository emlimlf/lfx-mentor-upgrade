import { transition, trigger, animate, style, query, stagger } from '@angular/animations';

export let listStagger = trigger('listStagger', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(-100px)' }),
        stagger('50ms', animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0px)' }))),
      ],
      { optional: true }
    ),
  ]),
]);

export let fadeInTop = trigger('fadeInTop', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-40px)' }),
    animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0px)' })),
  ]),
]);
