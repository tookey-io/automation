import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  ControlValueAccessor,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import deepEqual from 'deep-equal';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import {
  DropdownProperty,
  DropdownState,
  DynamicProperties,
  MultiSelectDropdownProperty,
  PieceProperty,
  PiecePropertyMap,
  PropertyType,
} from '@activepieces/pieces-framework';
import {
  jsonValidator,
  fadeInUp400ms,
  ActionMetaService,
} from '@activepieces/ui/common';
import {
  BuilderSelectors,
  CodeService,
  ConnectionDropdownItem,
} from '@activepieces/ui/feature-builder-store';
import { InsertMentionOperation } from '../interpolating-text-form-control/utils';
import { InterpolatingTextFormControlComponent } from '../interpolating-text-form-control/interpolating-text-form-control.component';
import { PiecePropertiesFormValue } from '../models/piece-properties-form-value';
import { AddEditConnectionButtonComponent } from '@activepieces/ui/feature-connections';

type ConfigKey = string;

@Component({
  selector: 'app-piece-properties-form',
  templateUrl: './piece-properties-form.component.html',
  styleUrls: ['./piece-properties-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: PiecePropertiesFormComponent,
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: PiecePropertiesFormComponent,
    },
  ],
  animations: [fadeInUp400ms],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PiecePropertiesFormComponent implements ControlValueAccessor {
  updateValueOnChange$: Observable<void> = new Observable<void>();
  PropertyType = PropertyType;
  dropdownOptionsObservables$: {
    [key: ConfigKey]: Observable<DropdownState<unknown>>;
  } = {};
  dynamicPropsObservables$: {
    [key: ConfigKey]: Observable<PiecePropertyMap>;
  } = {};
  refreshableConfigsLoadingFlags$: {
    [key: ConfigKey]: BehaviorSubject<boolean>;
  } = {};

  allAuthConfigs$: Observable<ConnectionDropdownItem[]>;
  configDropdownChanged$: Observable<unknown>;
  cloudAuthCheck$: Observable<void>;
  editorOptions = {
    lineNumbers: true,
    theme: 'lucario',
    lineWrapping: true,
    matchBrackets: true,
    gutters: ['CodeMirror-lint-markers'],
    mode: 'application/json',
    lint: true,
  };
  customizedInputs: Record<string, boolean> | undefined;
  checkingOAuth2CloudManager = false;
  properties: PiecePropertyMap = {};
  requiredProperties: PiecePropertyMap = {};
  allOptionalProperties: PiecePropertyMap = {};
  selectedOptionalProperties: PiecePropertyMap = {};
  optionalConfigsMenuOpened = false;
  @Input() actionOrTriggerName: string;
  @Input() pieceName: string;
  @Input() pieceVersion: string;
  @Input() pieceDisplayName: string;
  @Input() isTriggerPieceForm = false;
  @ViewChildren('textControl', { read: ElementRef })
  theInputs: QueryList<ElementRef>;
  @ViewChild('addConnectionBtn')
  addConnectionBtn: AddEditConnectionButtonComponent;
  form!: UntypedFormGroup;
  setDefaultValue$: Observable<null>;
  OnChange: (value: unknown) => void;
  OnTouched: () => void;

  constructor(
    private fb: UntypedFormBuilder,
    private actionMetaDataService: ActionMetaService,
    private store: Store,
    private codeService: CodeService,
    private cd: ChangeDetectorRef
  ) {
    this.allAuthConfigs$ = this.store.select(
      BuilderSelectors.selectAppConnectionsDropdownOptions
    );
  }
  writeValue(obj: PiecePropertiesFormValue): void {
    this.properties = obj.properties;
    this.customizedInputs = obj.customizedInputs;
    this.createForm(obj.propertiesValues);
    if (obj.setDefaultValues) {
      this.setDefaultValue$ = of(null).pipe(
        tap(() => {
          this.form.setValue(this.form.value);
        })
      );
    }
    this.cd.markForCheck();
  }
  registerOnChange(fn: (value: unknown) => void): void {
    this.OnChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.OnTouched = fn;
  }
  setDisabledState(disabled: boolean) {
    if (disabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }
  validate() {
    if (this.form.invalid) {
      return { invalid: true };
    }
    return null;
  }
  createForm(propertiesValues: Record<string, unknown>) {
    this.requiredProperties = {};
    this.allOptionalProperties = {};
    this.selectedOptionalProperties = {};
    Object.entries(this.properties).forEach(([pk]) => {
      if (this.properties[pk].required) {
        this.requiredProperties[pk] = this.properties[pk];
      } else {
        this.allOptionalProperties[pk] = this.properties[pk];
        if (propertiesValues[pk]) {
          this.selectedOptionalProperties[pk] = this.properties[pk];
        }
      }
    });

    const requiredConfigsControls = this.createConfigsFormControls(
      this.requiredProperties,
      propertiesValues
    );
    const optionalConfigsControls = this.createConfigsFormControls(
      this.selectedOptionalProperties,
      propertiesValues
    );

    this.form = this.fb.group({
      ...requiredConfigsControls,
      ...optionalConfigsControls,
    });

    this.createDropdownConfigsObservables();
    this.createDynamicConfigsObservables();
    this.updateValueOnChange$ = this.form.valueChanges.pipe(
      tap((value) => {
        this.OnChange(this.formValueMiddleWare(value));
      }),
      map(() => void 0)
    );

    this.form.markAllAsTouched();
  }
  addNewConnectionButtonPress() {
    this.addConnectionBtn.buttonClicked();
  }
  createDropdownConfigsObservables() {
    Object.keys(this.properties).forEach((pk) => {
      const property = this.properties[pk];
      if (
        property.type === PropertyType.DROPDOWN ||
        property.type === PropertyType.MULTI_SELECT_DROPDOWN
      ) {
        this.dropdownOptionsObservables$[pk] =
          this.createRefreshableConfigObservables<DropdownState<unknown>>({
            property: property,
            propertyKey: pk,
          }).pipe(
            map((res) => {
              if (res.options.length === 0) {
                const emptyDropdownState: DropdownState<unknown> = {
                  options: [],
                  disabled: true,
                  placeholder: `No ${property.displayName} Available`,
                };
                return emptyDropdownState;
              }
              return res;
            }),
            catchError(() => {
              return of({
                options: [],
                disabled: true,
                placeholder: 'unknown server erro happend, check console',
              });
            })
          );
      }
    });
  }
  createDynamicConfigsObservables() {
    Object.keys(this.properties).forEach((pk) => {
      const parentProperty = this.properties[pk];
      if (parentProperty.type == PropertyType.DYNAMIC) {
        this.dynamicPropsObservables$[pk] =
          this.createRefreshableConfigObservables<PiecePropertyMap>({
            property: parentProperty,
            propertyKey: pk,
          }).pipe(
            tap((res) => {
              const fg = this.form.get(pk) as UntypedFormGroup;
              if (fg) {
                const removedControlsKeys = Object.keys(fg.controls).filter(
                  (key) => res[key] === undefined
                );
                removedControlsKeys.forEach((removedKey) => {
                  fg.removeControl(removedKey);
                });
                Object.keys(res).forEach((ck) => {
                  const childConfigControl = fg.get(ck);
                  if (childConfigControl) {
                    if (res[ck].required) {
                      childConfigControl.addValidators(Validators.required);
                    } else {
                      childConfigControl.removeValidators(Validators.required);
                    }
                  } else {
                    fg.addControl(
                      ck,
                      new UntypedFormControl(
                        res[ck].defaultValue,
                        res[ck].required ? Validators.required : []
                      ),
                      { emitEvent: false }
                    );
                  }
                });
                fg.markAllAsTouched();
              }
            }),
            shareReplay(1)
          );
      }
    });
  }

  createRefreshableConfigObservables<
    T extends DropdownState<unknown> | PiecePropertyMap
  >(obj: {
    property:
      | DynamicProperties<boolean>
      | MultiSelectDropdownProperty<unknown, boolean>
      | DropdownProperty<unknown, boolean>;
    propertyKey: string;
  }) {
    this.refreshableConfigsLoadingFlags$[obj.propertyKey] = new BehaviorSubject(
      true
    );
    const refreshers$: Record<string, Observable<unknown>> = {};
    obj.property.refreshers.forEach((rk) => {
      refreshers$[rk] = this.form.controls[rk].valueChanges.pipe(
        distinctUntilChanged((prev, curr) => {
          if (
            this.properties[rk].type === PropertyType.OAUTH2 ||
            this.properties[rk].type === PropertyType.CUSTOM_AUTH ||
            this.properties[rk].type === PropertyType.SECRET_TEXT ||
            this.properties[rk].type === PropertyType.BASIC_AUTH
          ) {
            return false;
          }
          return JSON.stringify(prev) === JSON.stringify(curr);
        }),
        startWith(this.form.controls[rk].value),
        tap(() => {
          this.refreshableConfigsLoadingFlags$[obj.propertyKey].next(true);
        }),
        debounceTime(150)
      );
    });
    if (obj.property.refreshers.length === 0) {
      refreshers$['oneTimeRefresh'] = of(true);
    }
    return combineLatest(refreshers$).pipe(
      switchMap((res) => {
        return this.actionMetaDataService.getPieceActionConfigOptions<T>({
          pieceVersion: this.pieceVersion,
          pieceName: this.pieceName,
          propertyName: obj.propertyKey,
          stepName: this.actionOrTriggerName,
          input: res,
        });
      }),
      catchError((err) => {
        console.error(err);
        throw err;
      }),
      tap(() => {
        this.refreshableConfigsLoadingFlags$[obj.propertyKey].next(false);
      }),
      shareReplay(1)
    );
  }

  private createConfigsFormControls(
    properties: PiecePropertyMap,
    propertiesValues: Record<string, unknown>
  ) {
    const controls: { [key: string]: UntypedFormControl | UntypedFormGroup } =
      {};
    Object.keys(properties).forEach((pk) => {
      const validators: ValidatorFn[] = [];
      const prop = properties[pk];
      const propValue = propertiesValues[pk];
      if (
        prop.required &&
        prop.type !== PropertyType.OBJECT &&
        prop.type !== PropertyType.ARRAY
      ) {
        validators.push(Validators.required);
      }
      if (prop.type === PropertyType.OBJECT) {
        controls[pk] = new UntypedFormControl(
          propValue || prop.defaultValue || {},
          validators
        );
      } else if (prop.type === PropertyType.ARRAY) {
        controls[pk] = new UntypedFormControl(
          propValue || prop.defaultValue || [''],
          validators
        );
      } else if (prop.type === PropertyType.JSON) {
        if (!this.customizedInputs || !this.customizedInputs[pk]) {
          validators.push(jsonValidator);
        }
        if (typeof propValue === 'object') {
          controls[pk] = new UntypedFormControl(
            JSON.stringify(propValue || prop.defaultValue, null, 2),
            validators
          );
        } else {
          controls[pk] = new UntypedFormControl(
            propertiesValues[pk] ||
              JSON.stringify(prop.defaultValue ?? {}, null, 2),
            validators
          );
        }
      } else if (prop.type === PropertyType.DYNAMIC) {
        const dynamicConfigControls: Record<string, UntypedFormControl> = {};
        if (propValue) {
          Object.keys(propValue).forEach((k) => {
            dynamicConfigControls[k] = new UntypedFormControl(
              (propValue as Record<string, unknown>)[k]
            );
          });
        } else {
          controls[pk] = new UntypedFormControl(
            propValue || prop.defaultValue || '{}',
            validators
          );
        }
        controls[pk] = this.fb.group(dynamicConfigControls);
      } else {
        controls[pk] = new UntypedFormControl(
          propValue === undefined || propValue === null
            ? prop.defaultValue
            : propValue,
          validators
        );
      }
    });

    return controls;
  }
  getControl(configKey: string) {
    return this.form.get(configKey);
  }

  removeConfig(propertyKey: string) {
    this.form.removeControl(propertyKey);
    const newSelectedOptionalConfigsObj: PiecePropertyMap = {};
    Object.keys(this.selectedOptionalProperties).forEach((k) => {
      if (k !== propertyKey) {
        newSelectedOptionalConfigsObj[k] = {
          ...this.selectedOptionalProperties[k],
        };
      }
    });
    this.selectedOptionalProperties = newSelectedOptionalConfigsObj;
  }

  addOptionalProperty(propertyKey: string, property: PieceProperty) {
    if (property.type !== PropertyType.JSON) {
      this.form.addControl(
        propertyKey,
        new UntypedFormControl(
          property.defaultValue ? property.defaultValue : undefined
        )
      );
    } else {
      this.form.addControl(
        propertyKey,
        new UntypedFormControl(
          property.defaultValue
            ? JSON.stringify(property.defaultValue, null, 2)
            : undefined
        )
      );
    }
    this.selectedOptionalProperties = {
      ...this.selectedOptionalProperties,
      [propertyKey]: property,
    };
  }

  connectionValueChanged(event: {
    propertyKey: string;
    value: `{{connections.${string}}}`;
  }) {
    this.form.get(event.propertyKey)!.setValue(event.value.toString());
  }
  dropdownCompareWithFunction = (opt: string, formControlValue: string) => {
    return formControlValue !== undefined && deepEqual(opt, formControlValue);
  };

  addMentionToJsonControl(
    jsonControl: CodemirrorComponent,
    mention: InsertMentionOperation
  ) {
    const doc = jsonControl.codeMirror!.getDoc();
    const cursor = doc.getCursor();
    doc.replaceRange(mention.insert.mention.serverValue, cursor);
  }

  formValueMiddleWare(formValue: Record<string, unknown>) {
    const formattedValue: Record<string, unknown> = { ...formValue };
    Object.keys(formValue).forEach((pk) => {
      const property = this.properties[pk];
      if (property.type === PropertyType.JSON) {
        try {
          formattedValue[pk] = JSON.parse(formValue[pk] as string);
        } catch (_) {
          //incase it is an invalid json
        }
      }
    });

    if (this.customizedInputs) {
      return {
        input: formattedValue,
        customizedInputs: this.customizedInputs,
      };
    } else {
      return formattedValue;
    }
  }

  beautify(configKey: string) {
    try {
      const ctrl = this.form.get(configKey)!;
      ctrl.setValue(this.codeService.beautifyJson(JSON.parse(ctrl.value)));
    } catch {
      //ignore
    }
  }
  toggleCustomizedInputFlag(propertyKey: string) {
    if (!this.customizedInputs) {
      throw new Error('Activepieces-customized inputs map is not initialized');
    }
    const isCustomized = !this.customizedInputs[propertyKey];
    this.customizedInputs = {
      ...this.customizedInputs,
      [propertyKey]: isCustomized,
    };
    const property = this.properties[propertyKey];
    const ctrl = this.form.get(propertyKey);
    if (!property || !ctrl) {
      throw new Error('Activepieces-config not found: ' + propertyKey);
    }

    const silentChange = { emitEvent: false };
    switch (property.type) {
      case PropertyType.JSON: {
        if (isCustomized) {
          ctrl.removeValidators([jsonValidator]);
          ctrl.setValue('', silentChange);
        } else {
          ctrl.addValidators([jsonValidator]);
          ctrl.setValue('{}', silentChange);
        }
        break;
      }
      case PropertyType.OBJECT: {
        if (isCustomized) {
          ctrl.setValue('', silentChange);
        } else {
          ctrl.setValue({}, silentChange);
        }
        break;
      }
      case PropertyType.ARRAY: {
        if (isCustomized) {
          ctrl.setValue('', silentChange);
        } else {
          ctrl.setValue([''], silentChange);
        }
        break;
      }
      default: {
        ctrl.setValue(undefined, silentChange);
      }
    }
    this.cd.detectChanges();
    const input = this.theInputs.find(
      (input) => input.nativeElement.getAttribute('name') === propertyKey
    );
    if (input) {
      this.cd.detectChanges();
      input.nativeElement.click();
    }
  }
  async addMention(
    textControl: InterpolatingTextFormControlComponent,
    mentionOp: InsertMentionOperation
  ) {
    await textControl.addMention(mentionOp);
  }
  checkIfTheDivIsTheTarget($event: MouseEvent, noConnectionDiv: HTMLElement) {
    return $event.target === noConnectionDiv;
  }
}
