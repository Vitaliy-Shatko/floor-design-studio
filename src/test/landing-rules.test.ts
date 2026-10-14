import { describe, expect, it } from "vitest";
import { headerShouldHide, isValidPhone } from "../lib/landing-rules";

describe("landing interactions", () => {
  it("hides the header scrolling down and restores it scrolling up", () => {
    expect(headerShouldHide(100, 200)).toBe(true);
    expect(headerShouldHide(200, 100)).toBe(false);
    expect(headerShouldHide(0, 40)).toBe(false);
  });
  it("accepts a complete phone number and rejects an incomplete number", () => {
    expect(isValidPhone("+7 (999) 123-45-67")).toBe(true);
    expect(isValidPhone("123")).toBe(false);
    expect(isValidPhone("not a phone")).toBe(false);
  });
});