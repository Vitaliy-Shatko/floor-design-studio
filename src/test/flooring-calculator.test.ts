import { describe, expect, it } from "vitest";
import {
  calculateFlooring,
  defaultWastePercent,
  formatArea,
  formatRub,
} from "../lib/flooring-calculator";

const baseInput = {
  lengthM: 5,
  widthM: 4,
  packCoverageM2: 2.2,
  packPriceRub: 3000,
};

describe("flooring calculator", () => {
  it("computes packs with default straight waste and costs", () => {
    const result = calculateFlooring(baseInput);
    expect(result).toEqual({
      areaM2: 20,
      layout: "straight",
      wastePercent: 10,
      areaWithWasteM2: 22,
      packs: 10,
      purchasedCoverageM2: 22,
      planks: null,
      perimeterM: 18,
      skirtingPlanks: null,
      underlayRolls: null,
      materialsCostRub: 30000,
      installCostRub: 0,
      totalCostRub: 30000,
    });
  });

  it("rounds packs up when area does not fit whole packs", () => {
    const result = calculateFlooring({ ...baseInput, lengthM: 4.5, widthM: 5 });
    expect(result.areaWithWasteM2).toBe(24.75);
    expect(result.packs).toBe(12);
    expect(result.purchasedCoverageM2).toBe(26.4);
  });

  it("uses layout-specific default waste", () => {
    const diagonal = calculateFlooring({ ...baseInput, layout: "diagonal" });
    expect(diagonal.wastePercent).toBe(defaultWastePercent.diagonal);
    expect(diagonal.areaWithWasteM2).toBe(23);
    expect(diagonal.packs).toBe(11);

    const straightOffset = calculateFlooring({ ...baseInput, layout: "straightOffset" });
    expect(straightOffset.wastePercent).toBe(defaultWastePercent.straightOffset);
    expect(straightOffset.packs).toBe(10);

    const herringbone = calculateFlooring({ ...baseInput, layout: "herringbone" });
    expect(herringbone.wastePercent).toBe(defaultWastePercent.herringbone);
    expect(herringbone.packs).toBe(11);
  });

  it("respects an explicit waste override", () => {
    const result = calculateFlooring({ ...baseInput, wastePercent: 25 });
    expect(result.wastePercent).toBe(25);
    expect(result.areaWithWasteM2).toBe(25);
    expect(result.packs).toBe(12);
  });

  it("counts planks, underlay rolls and skirting planks", () => {
    const result = calculateFlooring({
      ...baseInput,
      planksPerPack: 8,
      underlayRollCoverageM2: 5,
      skirtingPlankLengthM: 2,
    });
    expect(result.planks).toBe(80);
    expect(result.underlayRolls).toBe(4);
    expect(result.skirtingPlanks).toBe(10);
  });

  it("sums material and installation costs", () => {
    const result = calculateFlooring({
      ...baseInput,
      underlayRollCoverageM2: 5,
      underlayRollPriceRub: 450,
      skirtingPlankLengthM: 2,
      skirtingPlankPriceRub: 250,
      installRateRubPerM2: 350,
    });
    expect(result.materialsCostRub).toBe(34300);
    expect(result.installCostRub).toBe(7000);
    expect(result.totalCostRub).toBe(41300);
  });

  it("rejects non-positive dimensions, coverage and price", () => {
    expect(() => calculateFlooring({ ...baseInput, lengthM: 0 })).toThrow();
    expect(() => calculateFlooring({ ...baseInput, widthM: -3 })).toThrow();
    expect(() => calculateFlooring({ ...baseInput, lengthM: Number.NaN })).toThrow();
    expect(() => calculateFlooring({ ...baseInput, packCoverageM2: 0 })).toThrow();
    expect(() => calculateFlooring({ ...baseInput, packPriceRub: -1 })).toThrow();
  });

  it("rejects invalid waste percentage", () => {
    expect(() => calculateFlooring({ ...baseInput, wastePercent: -5 })).toThrow();
    expect(() => calculateFlooring({ ...baseInput, wastePercent: 100 })).toThrow();
    expect(() => calculateFlooring({ ...baseInput, wastePercent: Number.NaN })).toThrow();
  });
});

describe("formatters", () => {
  it("formats rubles with ru-RU grouping", () => {
    expect(formatRub(41300).replace(/[\u00A0\u202F]/g, " ")).toBe("41 300 ₽");
    expect(formatRub(1234567).replace(/[\u00A0\u202F]/g, " ")).toBe("1 234 567 ₽");
  });

  it("formats area with at most one decimal", () => {
    expect(formatArea(20)).toBe("20 м²");
    expect(formatArea(16.5)).toBe("16,5 м²");
  });
});
