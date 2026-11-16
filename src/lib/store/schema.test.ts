import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, parseCookieValue, speedToDelay } from "./schema";

describe("speedToDelay", () => {
  it("maps the slowest speed to 1400ms", () => {
    expect(speedToDelay(0)).toBe(1400);
  });

  it("maps the fastest speed to about 90ms", () => {
    expect(Math.abs(speedToDelay(100) - 90)).toBeLessThanOrEqual(1);
  });

  it("clamps values outside 0-100", () => {
    expect(speedToDelay(-50)).toBe(speedToDelay(0));
    expect(speedToDelay(500)).toBe(speedToDelay(100));
  });
});

describe("parseCookieValue", () => {
  it("returns the fallback when the cookie is missing", () => {
    expect(parseCookieValue(undefined, DEFAULT_SETTINGS)).toBe(DEFAULT_SETTINGS);
  });

  it("returns the fallback when the cookie is not valid JSON", () => {
    expect(parseCookieValue("%%%not-json", DEFAULT_SETTINGS)).toBe(DEFAULT_SETTINGS);
  });
});
