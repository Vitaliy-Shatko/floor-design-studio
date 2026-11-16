export type FloorLayout = "straight" | "straightOffset" | "diagonal" | "herringbone";

export const defaultWastePercent: Record<FloorLayout, number> = {
  straight: 10,
  straightOffset: 10,
  diagonal: 15,
  herringbone: 20,
};

export interface FlooringCalcInput {
  lengthM: number;
  widthM: number;
  layout?: FloorLayout | undefined;
  wastePercent?: number | undefined;
  packCoverageM2: number;
  packPriceRub: number;
  planksPerPack?: number | undefined;
  underlayRollCoverageM2?: number | undefined;
  underlayRollPriceRub?: number | undefined;
  skirtingPlankLengthM?: number | undefined;
  skirtingPlankPriceRub?: number | undefined;
  installRateRubPerM2?: number | undefined;
}

export interface FlooringCalcResult {
  areaM2: number;
  layout: FloorLayout;
  wastePercent: number;
  areaWithWasteM2: number;
  packs: number;
  purchasedCoverageM2: number;
  planks: number | null;
  perimeterM: number;
  skirtingPlanks: number | null;
  underlayRolls: number | null;
  materialsCostRub: number;
  installCostRub: number;
  totalCostRub: number;
}

const roundDigits = 6;
const skirtingWasteFactor = 1.1;

const roundTo = (value: number, digits = roundDigits) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const ceilTo = (value: number) => Math.ceil(roundTo(value));

const requirePositive = (value: number, label: string) => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} должна быть положительным числом`);
  }
  return value;
};

const requireNonNegative = (value: number, label: string) => {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} не может быть отрицательной`);
  }
  return value;
};

export function calculateFlooring(input: FlooringCalcInput): FlooringCalcResult {
  const lengthM = requirePositive(input.lengthM, "Длина комнаты");
  const widthM = requirePositive(input.widthM, "Ширина комнаты");
  const packCoverageM2 = requirePositive(input.packCoverageM2, "Площадь упаковки");
  const packPriceRub = requireNonNegative(input.packPriceRub, "Цена упаковки");

  const layout: FloorLayout = input.layout ?? "straight";
  const wastePercent = input.wastePercent ?? defaultWastePercent[layout];
  if (!Number.isFinite(wastePercent) || wastePercent < 0 || wastePercent >= 100) {
    throw new Error("Запас на подрезку должен быть от 0 до 100%");
  }

  const areaM2 = roundTo(lengthM * widthM);
  const areaWithWasteM2 = roundTo(areaM2 * (1 + wastePercent / 100));
  const packs = ceilTo(areaWithWasteM2 / packCoverageM2);
  const purchasedCoverageM2 = roundTo(packs * packCoverageM2);
  const planks =
    input.planksPerPack && input.planksPerPack > 0 ? packs * input.planksPerPack : null;
  const perimeterM = roundTo(2 * (lengthM + widthM));
  const skirtingPlanks =
    input.skirtingPlankLengthM && input.skirtingPlankLengthM > 0
      ? ceilTo((perimeterM * skirtingWasteFactor) / input.skirtingPlankLengthM)
      : null;
  const underlayRolls =
    input.underlayRollCoverageM2 && input.underlayRollCoverageM2 > 0
      ? ceilTo(areaM2 / input.underlayRollCoverageM2)
      : null;

  let underlayCostRub = 0;
  if (underlayRolls && input.underlayRollPriceRub) {
    underlayCostRub = underlayRolls * input.underlayRollPriceRub;
  }
  let skirtingCostRub = 0;
  if (skirtingPlanks && input.skirtingPlankPriceRub) {
    skirtingCostRub = skirtingPlanks * input.skirtingPlankPriceRub;
  }
  const materialsCostRub = roundTo(packs * packPriceRub + underlayCostRub + skirtingCostRub, 2);
  const installCostRub = input.installRateRubPerM2
    ? roundTo(areaM2 * input.installRateRubPerM2, 2)
    : 0;
  const totalCostRub = roundTo(materialsCostRub + installCostRub, 2);

  return {
    areaM2,
    layout,
    wastePercent,
    areaWithWasteM2,
    packs,
    purchasedCoverageM2,
    planks,
    perimeterM,
    skirtingPlanks,
    underlayRolls,
    materialsCostRub,
    installCostRub,
    totalCostRub,
  };
}

export function formatRub(value: number): string {
  const formatted = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value);
  return `${formatted} ₽`;
}

export function formatArea(value: number): string {
  const formatted = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value);
  return `${formatted} м²`;
}
