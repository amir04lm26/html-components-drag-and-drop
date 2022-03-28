namespace App {
  // Validation
  interface IValidate {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  }

  export function validate(validateObject: IValidate): boolean {
    const { value, required, minLength, maxLength, min, max } = validateObject;
    let isValid = true;

    if (required) {
      isValid = value.toString().trim().length !== 0;
    }
    if (typeof minLength === "number" && isValid && typeof value === "string") {
      isValid = value.length >= minLength;
    }
    if (typeof maxLength === "number" && isValid && typeof value === "string") {
      isValid = value.length <= maxLength;
    }
    if (typeof min === "number" && isValid && typeof value === "number") {
      isValid = value >= min;
    }
    if (typeof max === "number" && isValid && typeof value === "number") {
      isValid = value <= max;
    }

    return isValid;
  }
}
