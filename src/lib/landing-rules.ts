export function headerShouldHide(previous: number, current: number) {
  return current > 90 && current > previous;
}

export function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}