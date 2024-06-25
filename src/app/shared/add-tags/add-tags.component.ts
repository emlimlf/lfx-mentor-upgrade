// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { of, Subject, Observable, merge } from 'rxjs';
import {
  Component,
  ElementRef,
  ViewChild,
  OnChanges,
  OnDestroy,
  OnInit,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import { switchMap, filter, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { SkillsService } from '../../services/skills.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-tags',
  templateUrl: './add-tags.component.html',
  styleUrls: ['./add-tags.component.scss'],
})
export class AddTagsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() hideTagsContainer = false;
  @Input() itemList: any[] = [];
  @Input() parentSubject: Subject<any>;
  @Input() isValid = false;
  @Input() feature = '';
  @Input() tagTypes: any[] = [];
  @Input() autofocus = false;
  @Input() tagSectionLabel = '';
  @Input() typeaheadItems: any[] = [];
  @Input() skills = false;
  @Input() strict = false;
  @Input() required = false;
  @Input() featureAlias = '';
  @Output() itemListChange: EventEmitter<any[]> = new EventEmitter();
  @Output() validationChanged: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('focusControl', { static: true }) focusElem?: ElementRef;

  showEmptyNameError = false;
  showEmptyEmailError = false;
  showDuplicateEmailError = false;
  showDuplicateNameError = false;
  showInvalidEmailError = false;
  showTypeNameNotExist = false;
  isNameValid = false;
  isEmailValid = false;
  name = '';
  email = '';

  tagTypeahead: any;
  @ViewChild('tagTypeahead', { static: true })
  set tagTypeAhead(v: NgbTypeahead) {
    this.tagTypeahead = v;
  }
  tagFocus$ = new Subject<string>();
  tagClick$ = new Subject<string>();
  searchTag = this.searchTags.bind(this);

  constructor(private skillsService: SkillsService) {
    this.parentSubject = new Subject();
  }

  ngOnInit() {
    this.parentSubject.subscribe(event => {
      if (event === 'submit') {
        this.checkItemsValidation(this.tagTypes.length);
      }
    });
    if (this.itemList === null) {
      this.itemList = [];
    }
  }

  ngOnChanges() {
    if (typeof this.required === 'string') {
      this.required = this.required && this.required === 'true';
    } else {
      this.required = !!this.required;
    }
  }

  tagSelected(e: NgbTypeaheadSelectItemEvent, input: any, tagType: any) {
    e.preventDefault();

    const value = typeof e.item === 'string' ? e.item : e.item.name;
    this.tagTypeahead.setValue = value;
    input.value = value;
  }

  tagEnter(e: any, input: any) {
    e.preventDefault();
    if (!input.value) {
      return;
    }
    if (this.strict) {
      return;
    }
    if (this.tagTypeahead.isPopupOpen()) {
      return;
    }

    let item: any = { name: input.value };

    if (this.typeaheadItems && this.typeaheadItems.length) {
      const itemY = this.typeaheadItems.find(i => {
        return i.name === input.value;
      });
      item = itemY ? { ...itemY } : { ...item };
    }

    if (!this.itemList.find((i: any) => i.name.trim().toLowerCase() === item.name.trim().toLowerCase())) {
      if (item.name.trim()) {
        this.itemList = [
          ...this.itemList.map((item: any) => (typeof item === 'string' ? item : { ...item })),
          { ...item },
        ];
        this.itemListChange.emit(this.itemList.map((item: any) => (typeof item === 'string' ? item : { ...item })));
      }
    }
    input.value = '';
  }

  private searchTags(text$: Observable<string>) {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.tagClick$.pipe(filter(() => !this.tagTypeahead.isPopupOpen()));
    const inputFocus$ = this.tagFocus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      switchMap(term => {
        if (this.skills) {
          return this.skillsService.search(term, -1);
        }
        if (this.typeaheadItems) {
          term = term.toLowerCase();
          const items = this.typeaheadItems.filter(item => {
            if (typeof item !== 'string') {
              item = item.name;
            }
            return item.toLowerCase().indexOf(term) >= 0;
          });
          // .splice(0, 10);
          return of(
            items.map((item: any) => {
              return typeof item === 'string' ? item : { ...item };
            })
          );
        }
        return of([]);
      })
    );
  }

  ngOnDestroy() {
    this.parentSubject.unsubscribe();
  }

  changeItemNameInput(event: any, withoutDuplicateCheck?: boolean) {
    this.name = event.target.value;
    this.checkNameValidation(withoutDuplicateCheck);
  }

  changeItemEmailInput(event: any) {
    this.email = event.target.value;
    this.checkEmailValidation();
  }

  trackItem(index: number, backer: any) {
    return index;
  }

  getLowerCaseOfFeature(feature: string) {
    return feature.toLocaleLowerCase();
  }

  onCreateItem(ev: any, onlyCheckNameBoolean: boolean | null, withoutDuplicateCheck?: boolean) {
    ev.preventDefault();
    this.checkItemsValidation(this.tagTypes.length, withoutDuplicateCheck);
    const item = { name: this.name, email: this.email } as NullableItem;

    if (this.isValid && this.isInputCompleted(item, onlyCheckNameBoolean)) {
      this.itemList = [...this.itemList, item];
      this.itemListChange.emit([...this.itemList]);
      this.name = '';
      this.email = '';
    }
    if (this.focusElem && this.focusElem.nativeElement) {
      this.focusElem.nativeElement.focus();
    }

    this.isNameValid = false;
    this.isEmailValid = false;
  }

  onRemoveItem(item: any) {
    this.itemList = this.itemList.filter((remove: any) => remove.name !== item.name || remove.email !== item.email);
    this.itemListChange.emit(this.itemList);
  }

  checkItemsValidation(tagTypesLength: number, withoutDuplicateCheck?: boolean) {
    this.checkNameValidation(withoutDuplicateCheck);
    this.checkEmailValidation();
    if (tagTypesLength === 2) {
      this.isValid = this.isNameValid && this.isEmailValid;
    } else {
      this.isValid = this.isNameValid;
    }

    this.validationChanged.emit(this.isValid);
  }

  formattedItemDetails(item: any) {
    if (item.email) {
      return `${item.name} (${item.email})`;
    } else if (item.name) {
      return `${item.name}`;
    } else {
      return item;
    }
  }

  private checkNameValidation(withoutDuplicateCheck?: boolean) {
    this.showEmptyNameError = false;
    this.showDuplicateNameError = false;
    this.isNameValid = true;

    if (!this.isEmpty() && this.isFieldEmpty(this.name)) {
      this.showEmptyNameError = true;
      this.isNameValid = false;
    }

    if (!this.isFieldEmpty(this.name) && !withoutDuplicateCheck) {
      if (this.isDuplicateName(this.name)) {
        this.showDuplicateNameError = true;
        this.isNameValid = false;
      }
    }
  }

  private checkEmailValidation() {
    this.showEmptyEmailError = false;
    this.showDuplicateEmailError = false;
    this.showInvalidEmailError = false;
    this.isEmailValid = true;

    if (!this.isEmpty() && this.isFieldEmpty(this.email)) {
      this.showEmptyEmailError = true;
      this.isEmailValid = false;
    }
    if (!this.isFieldEmpty(this.email)) {
      if (this.isDuplicateEmail(this.email)) {
        this.showDuplicateEmailError = true;
        this.isEmailValid = false;
      }
      if (!this.isEmail(this.email)) {
        this.showInvalidEmailError = true;
        this.isEmailValid = false;
      }
    }
  }

  private isDuplicateName(name: string | null) {
    if (name === null) {
      return false;
    }

    return this.itemList.map((added: any) => added.name).includes(name);
  }

  private isDuplicateEmail(email: string | null) {
    if (email === null) {
      return false;
    }

    return this.itemList.map((added: any) => added.email).includes(email);
  }

  private isEmail(email: string | null) {
    const control = new FormControl(email, [Validators.email, Validators.required]);
    return control.errors == null;
  }

  private isInputCompleted(item: NullableItem, onlyCheckNameBoolean: boolean | null): boolean {
    if (onlyCheckNameBoolean) {
      return this.isCompleted(item.name, null);
    } else {
      return this.isCompleted(item.name, item.email);
    }
  }

  private isEmpty() {
    return this.isFieldEmpty(this.name) && this.isFieldEmpty(this.email);
  }

  private isFieldEmpty(input: string | null) {
    return input === null || input === '';
  }

  private isCompleted(name: string | null, email: string | null) {
    if (name && email) {
      return !this.isFieldEmpty(email) && !this.isFieldEmpty(name);
    } else {
      return !this.isFieldEmpty(name);
    }
  }
}
interface NullableItem {
  name: string | null;
  email: string | null;
  value: string | null;
}
