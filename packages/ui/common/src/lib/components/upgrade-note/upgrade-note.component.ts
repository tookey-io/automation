import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ap-upgrade-note',
  templateUrl: './upgrade-note.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpgradeNoteComponent {
  @Input() urlToOpen = 'https://www.activepieces.com/pricing';

  openUrl() {
    window.open(this.urlToOpen, '_blank');
  }
}
