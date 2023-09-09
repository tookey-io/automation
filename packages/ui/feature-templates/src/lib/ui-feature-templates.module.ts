import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplatesDialogComponent } from './templates-dialog/templates-dialog.component';
import { TemplatesFiltersComponent } from './templates-dialog/templates-filters/templates-filters.component';
import { TemplateAppsDropdownComponent } from './templates-dialog/template-apps-dropdown/template-apps-dropdown.component';
import { TemplateAppTagContainerComponent } from './templates-dialog/template-apps-dropdown/template-app-tag-container/template-app-tag-container.component';
import { TemplateCardComponent } from './template-card/template-card.component';
import { UiCommonModule } from '@activepieces/ui/common';
import { TemplateBlogNotificationComponent } from './template-blog-notification/template-blog-notification.component';
import { FeaturedTemplateCardComponent } from './featured-template-card/featured-template-card.component';
import { TimeagoModule } from 'ngx-timeago';
const exportedDeclarations = [
  TemplatesDialogComponent,
  TemplatesFiltersComponent,
  TemplateAppsDropdownComponent,
  TemplateAppTagContainerComponent,
  TemplateCardComponent,
  TemplateBlogNotificationComponent,
];
@NgModule({
  imports: [CommonModule, UiCommonModule, TimeagoModule.forChild()],
  declarations: [...exportedDeclarations, FeaturedTemplateCardComponent],
  exports: exportedDeclarations,
})
export class UiFeatureTemplatesModule {}
