import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownComponent } from './components/markdown/markdown.component';
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { EditableTextComponent } from './components/editable-text/editable-text.component';
import {
  MatTooltipDefaultOptions,
  MatTooltipModule,
  MAT_TOOLTIP_DEFAULT_OPTIONS,
} from '@angular/material/tooltip';
import { WarningBoxComponent } from './components/warning-box/warning-box.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { StateIconComponent } from './components/status-icon/state-icon.component';
import { LoadingIconComponent } from './components/loading-icon/loading-icon.component';
import { ApPaginatorComponent } from './components/pagination/ap-paginator.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { IconButtonComponent } from './components/icon-button/icon-button.component';
import { HotspotComponent } from './components/hotspot/hotspot.component';
import { MatButtonModule } from '@angular/material/button';
import { ApButtonComponent } from './components/ap-button/ap-button.component';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DialogTitleTemplateComponent } from './components/dialog-title-template/dialog-title-template.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { OutputLogPipe } from './pipe/output-log.pipe';
import { DefaultFalsePipe } from './pipe/default-false.pipe';
import { DefaultTruePipe } from './pipe/default-true.pipe';
import { CenterMatMenuDirective } from './directives/center-mat-menu.directive';
import { SidebarHeaderComponent } from './components/sidebar-header/sidebar-header.component';
import { JsonViewComponent } from './components/json-view/json-view.component';
import { JsonViewDialogComponent } from './components/json-view/json-view-dialog/json-view-dialog.component';
import { HorizontalSidebarSeparatorComponent } from './components/horizontal-sidebar-separator/horizontal-sidebar-separator.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TrackFocusDirective } from './directives/track-focus.directive';
import { ObjectToArrayPipe } from './pipe/object-to-array.pipe';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DeleteEntityDialogComponent } from './components/delete-enity-dialog/delete-entity-dialog.component';
import { MatDividerModule } from '@angular/material/divider';
import { GenericSnackbarTemplateComponent } from './components/generic-snackbar-template/generic-snackbar-template.component';
import { MatIconModule } from '@angular/material/icon';
import { UserAvatarComponent } from './components/user-avatar/user-avatar.component';
import { TrackHoverDirective } from './directives/track-hover.directive';
import { PiecesIconsFromFlowComponent } from './components/pieces-icons-from-flow/pieces-icons-from-flow.component';
import { PieceIconContainerComponent } from './components/pieces-icons/piece-icon-container/piece-icon-container.component';
import { UploadImageControlComponent } from './components/upload-file-control/upload-file-control.component';
import { DragDropDirective } from './directives/drag-drop.directive';
import { ElementDirective } from './directives/element-ref.directive';
import { CheckOverflowDirective } from './directives/check-overflow.directive';
import { MatTabsModule } from '@angular/material/tabs';
const exportedImports = [
  CommonModule,
  MatTooltipModule,
  AngularSvgIconModule,
  MatFormFieldModule,
  ReactiveFormsModule,
  MatSelectModule,
  MatInputModule,
  MatMenuModule,
  MatButtonModule,
  MatCardModule,
  MatTableModule,
  MatDialogModule,
  MatSidenavModule,
  MatProgressBarModule,
  MatButtonToggleModule,
  MatSlideToggleModule,
  DragDropModule,
  MatCheckboxModule,
  MatDividerModule,
  MatIconModule,
  MatTabsModule,
];
const exportedDeclarations = [
  UploadImageControlComponent,
  ElementDirective,
  MarkdownComponent,
  EditableTextComponent,
  ApButtonComponent,
  WarningBoxComponent,
  StateIconComponent,
  LoadingIconComponent,
  ApPaginatorComponent,
  HotspotComponent,
  IconButtonComponent,
  ApButtonComponent,
  DialogTitleTemplateComponent,
  OutputLogPipe,
  DefaultFalsePipe,
  DefaultTruePipe,
  CenterMatMenuDirective,
  SidebarHeaderComponent,
  JsonViewComponent,
  JsonViewDialogComponent,
  HorizontalSidebarSeparatorComponent,
  TrackFocusDirective,
  ObjectToArrayPipe,
  DeleteEntityDialogComponent,
  GenericSnackbarTemplateComponent,
  UserAvatarComponent,
  PiecesIconsFromFlowComponent,
  TrackHoverDirective,
  PieceIconContainerComponent,
  DragDropDirective,
  CheckOverflowDirective,
];
export const materialTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 0,
  hideDelay: 0,
  touchendHideDelay: 0,
};

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();
  const linkRenderer = renderer.link;

  renderer.link = (href, title, text) => {
    const html = linkRenderer.call(renderer, href, title, text);
    return html.replace(
      /^<a /,
      '<a role="link" tabindex="0" rel="noopener" target="_blank" rel="nofollow noopener noreferrer" '
    );
  };

  return {
    renderer,
    gfm: true,
    breaks: false,
    pedantic: false,
    smartLists: true,
    smartypants: false,
  };
}
@NgModule({
  imports: [
    ...exportedImports,
    MarkdownModule.forRoot({
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory,
      },
    }),
  ],
  providers: [
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: materialTooltipDefaults },
  ],
  declarations: [...exportedDeclarations],
  exports: [...exportedImports, ...exportedDeclarations],
})
export class UiCommonModule {}
