import type { FloorLayout } from "./flooring-calculator";

export const PREVIEW_WIDTH = 360;
export const PREVIEW_HEIGHT = 240;
export const PREVIEW_PAD = 10;
export const DEFAULT_PLANK_LENGTH_M = 1.2;
export const DEFAULT_PLANK_WIDTH_M = 0.2;

const SEG_MIN = 10;
const SEG_MAX = 44;
const COL_STEP_MIN = 6;
const COL_STEP_MAX = 18;
const EPSILON = 0.01;

const round2 = (value: number) => Math.round(value * 100) / 100;

export interface LayoutPreviewPlank {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutPreviewChevron {
  x: number;
  startY: number;
  seg: number;
  steps: number;
}

export interface LayoutPreviewModel {
  width: number;
  height: number;
  roomX: number;
  roomY: number;
  roomW: number;
  roomH: number;
  plankW: number;
  rotate: 0 | 45;
  pivotX: number;
  pivotY: number;
  planks: LayoutPreviewPlank[];
  chevrons: LayoutPreviewChevron[];
}

export interface LayoutPreviewInput {
  layout: FloorLayout;
  lengthM: number;
  widthM: number;
  plankLengthM?: number | undefined;
  plankWidthM?: number | undefined;
}

export function buildLayoutPreview(input: LayoutPreviewInput): LayoutPreviewModel {
  const lengthM = Math.max(input.lengthM, 0.1);
  const widthM = Math.max(input.widthM, 0.1);
  const plankLengthM =
    input.plankLengthM && input.plankLengthM > 0 ? input.plankLengthM : DEFAULT_PLANK_LENGTH_M;
  const plankWidthM =
    input.plankWidthM && input.plankWidthM > 0 ? input.plankWidthM : DEFAULT_PLANK_WIDTH_M;

  const innerW = PREVIEW_WIDTH - PREVIEW_PAD * 2;
  const innerH = PREVIEW_HEIGHT - PREVIEW_PAD * 2;
  const aspect = lengthM / widthM;
  let roomW = innerW;
  let roomH = roomW / aspect;
  if (roomH > innerH) {
    roomH = innerH;
    roomW = roomH * aspect;
  }
  roomW = round2(roomW);
  roomH = round2(roomH);
  const roomX = round2(PREVIEW_PAD + (innerW - roomW) / 2);
  const roomY = round2(PREVIEW_PAD + (innerH - roomH) / 2);

  const scale = roomW / lengthM;
  const plankL = round2(plankLengthM * scale);
  const plankW = round2(plankWidthM * scale);

  const buildRows = (offsetOdd: boolean): LayoutPreviewPlank[] => {
    const planks: LayoutPreviewPlank[] = [];
    const roomEndX = roomX + roomW;
    const roomEndY = roomY + roomH;
    const rowCount = Math.ceil(roomH / plankW);
    for (let row = 0; row < rowCount; row += 1) {
      const y = round2(roomY + row * plankW);
      const h = round2(Math.min(plankW, roomEndY - y));
      let x = roomX;
      if (offsetOdd && row % 2 === 1) {
        const half = round2(plankL / 2);
        planks.push({ x: round2(x), y, w: round2(Math.min(half, roomEndX - x)), h });
        x += half;
      }
      while (x < roomEndX - EPSILON) {
        const w = round2(Math.min(plankL, roomEndX - x));
        planks.push({ x: round2(x), y, w, h });
        x += w;
      }
    }
    return planks;
  };

  const buildDiagonal = (): LayoutPreviewPlank[] => {
    const radius = Math.hypot(roomW / 2, roomH / 2) + plankL;
    const planks: LayoutPreviewPlank[] = [];
    const startX = pivotX - radius;
    const startY = pivotY - radius;
    const span = radius * 2;
    const rowCount = Math.ceil(span / plankW);
    for (let row = 0; row < rowCount; row += 1) {
      const y = round2(startY + row * plankW);
      let x = startX;
      while (x < pivotX + radius - EPSILON) {
        const w = round2(Math.min(plankL, pivotX + radius - x));
        planks.push({ x: round2(x), y, w, h: plankW });
        x += w;
      }
    }
    return planks;
  };

  const buildChevrons = (): LayoutPreviewChevron[] => {
    const seg = round2(Math.min(SEG_MAX, Math.max(SEG_MIN, plankL / 2)));
    const colStep = round2(Math.min(COL_STEP_MAX, Math.max(COL_STEP_MIN, plankW * 2)));
    const chevrons: LayoutPreviewChevron[] = [];
    const steps = Math.ceil(roomH / seg) + 1;
    let col = 0;
    for (let x = roomX; x < roomX + roomW; x += colStep, col += 1) {
      const phase = col % 2 === 1 ? seg : 0;
      chevrons.push({ x: round2(x), startY: round2(roomY - seg + phase), seg, steps });
    }
    return chevrons;
  };

  const pivotX = round2(roomX + roomW / 2);
  const pivotY = round2(roomY + roomH / 2);

  if (input.layout === "diagonal") {
    return {
      width: PREVIEW_WIDTH,
      height: PREVIEW_HEIGHT,
      roomX,
      roomY,
      roomW,
      roomH,
      plankW,
      rotate: 45,
      pivotX,
      pivotY,
      planks: buildDiagonal(),
      chevrons: [],
    };
  }

  if (input.layout === "herringbone") {
    return {
      width: PREVIEW_WIDTH,
      height: PREVIEW_HEIGHT,
      roomX,
      roomY,
      roomW,
      roomH,
      plankW,
      rotate: 0,
      pivotX,
      pivotY,
      planks: [],
      chevrons: buildChevrons(),
    };
  }

  return {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    roomX,
    roomY,
    roomW,
    roomH,
    plankW,
    rotate: 0,
    pivotX,
    pivotY,
    planks: buildRows(input.layout === "straightOffset"),
    chevrons: [],
  };
}
