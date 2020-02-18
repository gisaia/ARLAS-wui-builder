import { ValidatorFn, ValidationErrors, FormGroup, AbstractControl, Validators } from '@angular/forms';

export class CustomValidators {

    static getLTEValidator(minField: string, maxField: string): ValidatorFn {
        return (fg: FormGroup): ValidationErrors | null => {
            const start = fg.get(minField).value;
            const end = fg.get(maxField).value;
            return start !== null && end !== null && start <= end ? null : { lte: true };
        };
    }

    static getConditionalValidator(predicate: () => boolean, validator: ValidatorFn) {
        return ((formControl: AbstractControl) => {
            if (predicate()) {
                return validator(formControl);
            }
            return null;
        });
    }
}
