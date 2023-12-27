import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest, map, startWith } from 'rxjs';
import { BuilderSelectors } from '@activepieces/ui/feature-builder-store';
import { FlowDrawer } from '../canvas-utils/drawing/flow-drawer';
import { Store } from '@ngrx/store';
import { PositionedStep } from '../canvas-utils/drawing/step-card';
import {
  FLOW_ITEM_WIDTH,
  PositionButton,
  FLOW_ITEM_HEIGHT_WITH_BOTTOM_PADDING,
} from '../canvas-utils/drawing/draw-common';
import { ZoomingService } from '../canvas-utils/zooming/zooming.service';
import { PannerService } from '../canvas-utils/panning/panner.service';

type UiFlowDrawer = {
  centeringGraphTransform: string;
  svg: string;
  boundingBox: { width: number; height: number };
} & Pick<FlowDrawer, 'buttons' | 'steps' | 'labels'>;
const GRAPH_Y_OFFSET_FROM_TEST_FLOW_WIDGET = 45;
@Component({
  selector: 'app-flow-item-tree',
  templateUrl: './flow-item-tree.component.html',
})
export class FlowItemTreeComponent implements OnInit {
  navbarOpen = false;
  flowDrawer$: Observable<UiFlowDrawer>;
  transform$: Observable<string>;
  readOnly$: Observable<boolean>;
  constructor(
    private store: Store,
    private pannerService: PannerService,
    private zoomingService: ZoomingService
  ) {
    this.transform$ = this.getTransform$();
    this.readOnly$ = this.store.select(BuilderSelectors.selectReadOnly);
  }

  ngOnInit(): void {
    const flowVersion$ = this.store.select(
      BuilderSelectors.selectShownFlowVersion
    );
    this.flowDrawer$ = flowVersion$.pipe(
      map((version) => {
        FlowDrawer.trigger = version.trigger;
        const drawer = FlowDrawer.construct(version.trigger).offset(0, 40);
        return {
          svg: drawer.svg.toSvg().content,
          boundingBox: drawer.boundingBox(),
          buttons: drawer.buttons,
          steps: drawer.steps,
          labels: drawer.labels,
          centeringGraphTransform: `translate(${
            drawer.boundingBox().width / 2 - FLOW_ITEM_WIDTH / 2
          }px,-${
            FLOW_ITEM_HEIGHT_WITH_BOTTOM_PADDING -
            GRAPH_Y_OFFSET_FROM_TEST_FLOW_WIDGET
          }px)`,
        };
      })
    );
  }

  flowItemsTrackBy(_: number, item: PositionedStep) {
    return item.content?.name;
  }
  buttonsTrackBy(_: number, item: PositionButton) {
    return `${item.x}+${item.y}`;
  }

  getTransform$() {
    const scale$ = this.zoomingService.zoomingScale$.asObservable().pipe(
      startWith(1),
      map((val) => {
        return `scale(${val})`;
      })
    );
    const translate$ = this.pannerService.panningOffset$.asObservable().pipe(
      startWith({ x: 0, y: 0 }),
      map((val) => {
        return `translate(${val.x}px,${val.y}px)`;
      })
    );
    const transformObs$ = combineLatest({
      scale: scale$,
      translate: translate$,
    }).pipe(
      map((value) => {
        return `${value.scale} ${value.translate}`;
      })
    );
    return transformObs$;
  }
}
