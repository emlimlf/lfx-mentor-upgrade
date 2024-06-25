// Copyright The Linux Foundation and each contributor to CommunityBridge.
// SPDX-License-Identifier: MIT
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InlineSVGModule } from 'ng-inline-svg';
import { Ng5SliderModule } from 'ng5-slider';
import { ImageCropperModule } from 'ngx-image-cropper';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { EllipsisModule } from 'ngx-ellipsis';
import { NgxTrimDirectiveModule } from 'ngx-trim-directive';

import { AddTagsComponent } from './add-tags/add-tags.component';
import { AlertBarComponent } from './alert-bar/alert-bar.component';
import { ApprenticeCardComponent } from './apprentice-card/apprentice-card.component';
import { AvatarComponent } from './avatar/avatar.component';
import { BadgesComponent } from './badges/badges.component';
import { BannerComponent } from './banner/banner.component';
import { BudgetSummaryComponent } from './budget-summary/budget-summary.component';
import { BudgetTitleComponent } from './budget-title/budget-title.component';
import { CentsToDollarsPipe } from './cents-to-dollars.pipe';
import { ColorFieldComponent } from './color-field/color-field.component';
import { ControlInvalidStyleDirective } from './control-invalid-style.directive';
import { CreditCardFieldComponent } from './credit-card-field/credit-card-field.component';
import { EditableCardDirective } from './editable-card/editable-card.directive';
import { EllipsesPipe } from './ellipses.pipe';
import { EmployerCardComponent } from './employer-card/employer-card.component';
import { ExpenseCategoryIconComponent } from './expense-category-icon/expense-category-icon.component';
import { FooterComponent } from './footer/footer.component';
import { FormCardComponent } from './form-card/form-card.component';
import { FormErrorComponent } from './form-error/form-error.component';
import { FormatDatePipe } from './format-date.pipe';
import { EditOrganizationModalComponent } from './funding-identity-selector/edit-organization-modal/edit-organization-modal.component';
import { FundingIdentitySelectorComponent } from './funding-identity-selector/funding-identity-selector.component';
import { IndustryIconsComponent } from './industry-icons/industry-icons.component';
import { LoaderComponent } from './loader/loader.component';
import { LogoFieldComponent } from './logo-field/logo-field.component';
import { MentorCardComponent } from './mentor-card/mentor-card.component';
import { NavigationToggleComponent } from './navigation-toggle/navigation-toggle.component';
import { NavigationComponent } from './navigation/navigation.component';
import { OverviewCardComponent } from './overview-card/overview-card.component';
import { EditCardModalComponent } from './payment-account/edit-card-modal/edit-card-modal.component';
import { PaymentAccountComponent } from './payment-account/payment-account.component';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { PillDropdownMenteeContactComponent } from './pill-dropdown-mentee-contact/pill-dropdown-mentee-contact.component';
import { PillDropdownStatusComponent } from './pill-dropdown-status/pill-dropdown-status.component';
import { PlaceholderCardComponent } from './placeholder-card/placeholder-card.component';
import { ProgressBarCardComponent } from './progress-bar-card/progress-bar-card.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { RadioButtonComponent } from './radio-button/radio-button.component';
import { RadioLineButtonComponent } from './radio-line-button/radio-line-button.component';
import { ResumeFieldComponent } from './resume-field/resume-field.component';
import { SafePipe } from './safe.pipe';
import { ShortNumberPipe } from './short-number.pipe';
import { SignupCalloutComponent } from './signup-callout/signup-callout.component';
import { SliderComponent } from './slider/slider.component';
import { StepperItemComponent } from './stepper-item/stepper-item.component';
import { StepperComponent } from './stepper/stepper.component';
import { StickyTabBarComponent } from './sticky-tab-bar/sticky-tab-bar.component';
import { StickyTabComponent } from './sticky-tab/sticky-tab.component';
import { SubmitButtonComponent } from './submit-button/submit-button.component';
import { SwitchComponent } from './switch/switch.component';
import { TableComponent } from './table/table.component';
import { TallyItemComponent } from './tally-item/tally-item.component';
import { TallyComponent } from './tally/tally.component';
import { TasksModule } from './tasks/tasks.module';
import { TasksComponent } from './tasks/tasks/tasks.component';
import { TransactionListItemComponent } from './transaction-list-item/transaction-list-item.component';
import { TransactionListComponent } from './transaction-list/transaction-list.component';
import { UrlPipe } from './url.pipe';
import { LineBreakPipe } from './line-break.pipe';
import { WindowRef } from './windowRef';
import { CiiComponent } from './cii/cii.component';
import { EditTypeHeadDirective } from './edit-type-head.directive';
import { ImageCropperComponent } from './image-cropper/image-cropper.component';
import { LogoCropperFieldComponent } from './logo-cropper-field/logo-cropper-field.component';
import { ColorInputComponent } from './color-input/color-input.component';
export { SubmitState } from './submit-button/submit-button.component';
export { INDIVIDUAL_FUNDING_IDENTITY } from './funding-identity-selector/funding-identity-selector.component';
export {
  EditOrganizationModalComponent,
  EditOrganizationResult,
} from './funding-identity-selector/edit-organization-modal/edit-organization-modal.component';
import { ColorPickerModule } from 'ngx-color-picker';

import { EllipsisTextComponent } from './ellipsis-text/ellipsis-text.component';
import { DeleteProjectModalComponent } from './delete-project-modal/delete-project-modal.component';
import { ProgressBarFundingComponent } from './progress-bar-funding/progress-bar-funding.component';
import { IconLoaderComponent } from './icon-loader/icon-loader.component';
import { InputSearchComponent } from './input-search/input-search.component';
import { TermAddEditComponent } from './term-add-edit/term-add-edit.component';
import { StatusDropdownComponent } from './status-dropdown/status-dropdown.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { TogglePillsComponent } from './toggle-pills/toggle-pills.component';
import { ProjectCardComponent } from './project-card/project-card.component';
import { NavSecondaryTabsComponent } from './nav-secondary-tabs/nav-secondary-tabs.component';
import { SponsorComponent } from './sponsor/sponsor.component';
import { NgbtabDirective } from './ngbtab.directive';
import { OrgSupporterCardComponent } from './org-supporter-card/org-supporter-card.component';
import { PopularProgramCardComponent } from './popular-program-card/popular-program-card.component';
import { PopularMentorCardComponent } from './popular-mentor-card/popular-mentor-card.component';
import { FunnelCircleGraphicCardComponent } from './funnel-circle-graphic-card/funnel-circle-graphic-card.component';

/**
 * SharedModule is where all DumbComponents should live.
 */
@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    Ng5SliderModule,
    ReactiveFormsModule,
    FormsModule,
    TasksModule,
    InlineSVGModule.forRoot(),
    RouterModule.forChild([]),
    ColorPickerModule,
    ImageCropperModule,
    InfiniteScrollModule,
    EllipsisModule,
    NgxTrimDirectiveModule,
  ],
  declarations: [
    NavigationComponent,
    FooterComponent,
    FormErrorComponent,
    ControlInvalidStyleDirective,
    EditableCardDirective,
    EllipsesPipe,
    BannerComponent,
    PlaceholderCardComponent,
    ColorFieldComponent,
    ColorInputComponent,
    CreditCardFieldComponent,
    PillDropdownMenteeContactComponent,
    PillDropdownStatusComponent,
    FormCardComponent,
    TallyComponent,
    TallyItemComponent,
    SwitchComponent,
    NavigationToggleComponent,
    SubmitButtonComponent,
    PaymentAccountComponent,
    EditCardModalComponent,
    AlertBarComponent,
    UrlPipe,
    LineBreakPipe,
    ShortNumberPipe,
    AvatarComponent,
    StepperComponent,
    StepperItemComponent,
    LogoFieldComponent,
    ResumeFieldComponent,
    SafePipe,
    CentsToDollarsPipe,
    ProgressBarComponent,
    ProgressBarCardComponent,
    BudgetSummaryComponent,
    BudgetTitleComponent,
    ExpenseCategoryIconComponent,
    PieChartComponent,
    BadgesComponent,
    IndustryIconsComponent,
    SignupCalloutComponent,
    FundingIdentitySelectorComponent,
    RadioLineButtonComponent,
    RadioButtonComponent,
    AddTagsComponent,
    StickyTabComponent,
    StickyTabBarComponent,
    EditOrganizationModalComponent,
    OverviewCardComponent,
    TransactionListComponent,
    TransactionListItemComponent,
    MentorCardComponent,
    EmployerCardComponent,
    ApprenticeCardComponent,
    SliderComponent,
    TableComponent,
    CiiComponent,
    EditTypeHeadDirective,
    ImageCropperComponent,
    LogoCropperFieldComponent,
    EllipsisTextComponent,
    DeleteProjectModalComponent,
    ProgressBarFundingComponent,
    IconLoaderComponent,
    InputSearchComponent,
    TermAddEditComponent,
    StatusDropdownComponent,
    NotFoundComponent,
    TogglePillsComponent,
    ProjectCardComponent,
    NavSecondaryTabsComponent,
    SponsorComponent,
    NgbtabDirective,
    OrgSupporterCardComponent,
    PopularProgramCardComponent,
    PopularMentorCardComponent,
    FunnelCircleGraphicCardComponent,
  ],
  exports: [
    NavigationComponent,
    FooterComponent,
    FormErrorComponent,
    ControlInvalidStyleDirective,
    PillDropdownMenteeContactComponent,
    PillDropdownStatusComponent,
    EditableCardDirective,
    EllipsesPipe,
    FormatDatePipe,
    BannerComponent,
    PlaceholderCardComponent,
    ColorFieldComponent,
    ColorInputComponent,
    LoaderComponent,
    CreditCardFieldComponent,
    FormCardComponent,
    TallyComponent,
    TallyItemComponent,
    SwitchComponent,
    NavigationToggleComponent,
    SubmitButtonComponent,
    PaymentAccountComponent,
    EditCardModalComponent,
    AlertBarComponent,
    UrlPipe,
    LineBreakPipe,
    ShortNumberPipe,
    AvatarComponent,
    StepperComponent,
    StepperItemComponent,
    LogoFieldComponent,
    ResumeFieldComponent,
    SafePipe,
    CentsToDollarsPipe,
    ProgressBarComponent,
    ProgressBarCardComponent,
    BudgetSummaryComponent,
    BudgetTitleComponent,
    ExpenseCategoryIconComponent,
    PieChartComponent,
    BadgesComponent,
    IndustryIconsComponent,
    SignupCalloutComponent,
    FundingIdentitySelectorComponent,
    AddTagsComponent,
    StickyTabComponent,
    StickyTabBarComponent,
    EditOrganizationModalComponent,
    OverviewCardComponent,
    TransactionListComponent,
    TransactionListItemComponent,
    MentorCardComponent,
    EmployerCardComponent,
    TasksComponent,
    ApprenticeCardComponent,
    SliderComponent,
    TableComponent,
    CiiComponent,
    EditTypeHeadDirective,
    LogoCropperFieldComponent,
    EllipsisTextComponent,
    DeleteProjectModalComponent,
    ProgressBarFundingComponent,
    IconLoaderComponent,
    InputSearchComponent,
    NgxTrimDirectiveModule,
    StatusDropdownComponent,
    EllipsisModule,
    NotFoundComponent,
    ProjectCardComponent,
    NavSecondaryTabsComponent,
    InfiniteScrollModule,
    SponsorComponent,
    NgbtabDirective,
    OrgSupporterCardComponent,
    PopularProgramCardComponent,
    PopularMentorCardComponent,
    FunnelCircleGraphicCardComponent,
  ],
  entryComponents: [
    EditCardModalComponent,
    EditOrganizationModalComponent,
    DeleteProjectModalComponent,
    TermAddEditComponent,
  ],
  providers: [WindowRef],
})
export class SharedModule {}
