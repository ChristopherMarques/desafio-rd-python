import { describe, it, expect } from "vitest";
import { soundEffects } from "@/lib/sound";

describe("soundEffects module", () => {
  it("does not throw when triggering sound effects in headless/mock environment", () => {
    expect(() => soundEffects.playMove()).not.toThrow();
    expect(() => soundEffects.playTurn()).not.toThrow();
    expect(() => soundEffects.playLaunch()).not.toThrow();
    expect(() => soundEffects.playWarning()).not.toThrow();
    expect(() => soundEffects.playSuccess()).not.toThrow();
  });
});
