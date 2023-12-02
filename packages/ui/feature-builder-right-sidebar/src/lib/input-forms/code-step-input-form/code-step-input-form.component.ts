import { Component } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormGroup,
  FormBuilder,
  FormControl,
} from '@angular/forms';
import { Observable, tap } from 'rxjs';
import { ActionType, SourceCode } from '@activepieces/shared';
import { CodeStepInputFormSchema } from '../input-forms-schema';

@Component({
  selector: 'app-code-step-input-form',
  templateUrl: './code-step-input-form.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: CodeStepInputFormComponent,
    },
  ],
})
export class CodeStepInputFormComponent implements ControlValueAccessor {
  codeStepForm: FormGroup<{
    input: FormControl<Record<string, unknown>>;
    sourceCode: FormControl<SourceCode>;
  }>;
  formValueChanged$: Observable<unknown>;

  markdown = `
  To use data from previous steps in your code, include them as pairs of keys and values below.
  <br>
  <br>
  You can access these inputs in your code using **inputs.key**, where **key** is the name you assigned below.
  <br>
  <br>
  **Warning: "const code" is the entry to the code, if it is removed or renamed, your step will fail.**
  `;

  onChange: (val: CodeStepInputFormSchema) => void = (
    value: CodeStepInputFormSchema
  ) => {
    value;
  };
  onTouch: () => void = () => {
    //ignore
  };

  constructor(private formBuilder: FormBuilder) {
    this.codeStepForm = this.formBuilder.group({
      input: new FormControl({}, { nonNullable: true }),
      sourceCode: new FormControl(
        { code: '', packageJson: '' },
        { nonNullable: true }
      ),
    });
    this.formValueChanged$ = this.codeStepForm.valueChanges.pipe(
      tap((formValue) => {
        this.onChange({
          input: this.codeStepForm.value.input || {},
          sourceCode: formValue.sourceCode!,
          type: ActionType.CODE,
        });
      })
    );
  }

  writeValue(obj: CodeStepInputFormSchema): void {
    if (obj.type === ActionType.CODE) {
      this.codeStepForm.controls.sourceCode.setValue(obj.sourceCode, {
        emitEvent: false,
      });
      this.codeStepForm.controls.input.setValue(obj.input, {
        emitEvent: false,
      });
      if (this.codeStepForm.disabled) {
        this.codeStepForm.disable();
      }
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.codeStepForm.disable();
    } else if (this.codeStepForm.disabled) {
      this.codeStepForm.enable();
    }
  }
}
