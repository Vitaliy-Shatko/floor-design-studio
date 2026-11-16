import { describe, expect, it } from "vitest";
import { buildLayoutPreview } from "../lib/floor-layout-preview";

const base = { lengthM: 5, widthM: 4 };

describe("floor layout preview", () => {
  it("fits the room into the canvas with padding", () => {
    const model = buildLayoutPreview({ ...base, layout: "straight" });
    expect(model.width).toBe(360);
    expect(model.height).toBe(240);
    expect(model.roomW).toBe(275);
    expect(model.roomH).toBe(220);
    expect(model.roomX).toBe(42.5);
    expect(model.roomY).toBe(10);
    expect(model.plankW).toBe(11);
  });

  it("keeps straight rows aligned", () => {
    const straight = buildLayoutPreview({ ...base, layout: "straight" });
    expect(straight.planks.slice(0, 2)).toEqual([
      { x: 42.5, y: 10, w: 66, h: 11 },
      { x: 108.5, y: 10, w: 66, h: 11 },
    ]);
  });

  it("shifts odd rows by half a plank for the offset layout", () => {
    const offset = buildLayoutPreview({ ...base, layout: "straightOffset" });
    expect(offset.planks[0]?.w).toBe(66);
    const secondRowStart = offset.planks.find((plank) => plank.y === 21) ?? null;
    expect(secondRowStart).toEqual({ x: 42.5, y: 21, w: 33, h: 11 });
  });

  it("rotates the diagonal layout around the room center", () => {
    const model = buildLayoutPreview({ ...base, layout: "diagonal" });
    expect(model.rotate).toBe(45);
    expect(model.pivotX).toBe(180);
    expect(model.pivotY).toBe(120);
    expect(model.planks.length).toBeGreaterThan(0);
    expect(model.chevrons).toHaveLength(0);
  });

  it("draws interlocked chevron columns for herringbone", () => {
    const model = buildLayoutPreview({ ...base, layout: "herringbone" });
    expect(model.planks).toHaveLength(0);
    expect(model.chevrons.length).toBeGreaterThan(1);
    expect(model.chevrons.slice(0, 2)).toEqual([
      { x: 42.5, startY: -23, seg: 33, steps: 8 },
      { x: 60.5, startY: 10, seg: 33, steps: 8 },
    ]);
  });

  it("uses plank dimensions from the input", () => {
    const model = buildLayoutPreview({
      ...base,
      layout: "straight",
      plankLengthM: 1.25,
      plankWidthM: 0.25,
    });
    expect(model.planks[0]?.w).toBe(68.75);
    expect(model.planks[0]?.h).toBe(13.75);
  });
});
