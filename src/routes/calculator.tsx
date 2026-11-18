import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Layers3 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { catalogProducts } from "@/lib/catalog";
import {
  buildLayoutPreview,
  DEFAULT_PLANK_LENGTH_M,
  DEFAULT_PLANK_WIDTH_M,
  type LayoutPreviewChevron,
  type LayoutPreviewModel,
} from "@/lib/floor-layout-preview";
import {
  calculateFlooring,
  defaultWastePercent,
  formatArea,
  formatRub,
  type FloorLayout,
  type FlooringCalcResult,
} from "@/lib/flooring-calculator";
import { isValidPhone } from "@/lib/landing-rules";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const positiveField = (label: string) =>
  z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ invalid_type_error: "Введите число", required_error: "Заполните поле" })
      .positive(`${label} должна быть больше нуля`),
  );

const optionalPositiveField = () =>
  z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ invalid_type_error: "Введите число" })
      .positive("Должно быть больше нуля")
      .optional(),
  );

const calculatorSchema = z.object({
  productId: z.string(),
  lengthM: positiveField("Длина"),
  widthM: positiveField("Ширина"),
  areaM2: optionalPositiveField(),
  layout: z.enum(["straight", "straightOffset", "diagonal", "herringbone"]),
  wastePercent: z.coerce
    .number({ invalid_type_error: "Введите число" })
    .min(0, "От 0%")
    .max(99, "До 99%"),
  packCoverageM2: positiveField("Площадь упаковки"),
  packPriceRub: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ invalid_type_error: "Введите число" })
      .nonnegative("Не может быть отрицательной"),
  ),
  planksPerPack: optionalPositiveField(),
  useUnderlay: z.boolean().default(false),
  underlayRollCoverageM2: optionalPositiveField(),
  underlayRollPriceRub: optionalPositiveField(),
  useSkirting: z.boolean().default(false),
  skirtingPlankLengthM: optionalPositiveField(),
  skirtingPlankPriceRub: optionalPositiveField(),
  needInstall: z.boolean().default(false),
  installRateRubPerM2: optionalPositiveField(),
});

type CalculatorFormInput = z.input<typeof calculatorSchema>;
type CalculatorFormValues = z.output<typeof calculatorSchema>;

const layoutLabels: Record<FloorLayout, string> = {
  straight: "Прямая — без смещения",
  straightOffset: "Прямая — со смещением",
  diagonal: "Диагональная",
  herringbone: "Ёлочка",
};

function LayoutPreviewSvg({ model }: { model: LayoutPreviewModel }) {
  const chevronPoints = (chevron: LayoutPreviewChevron) => {
    const points: string[] = [];
    for (let step = 0; step < chevron.steps * 2; step += 1) {
      const y = chevron.startY + step * chevron.seg;
      const x = chevron.x + (step % 2 === 1 ? chevron.seg : 0);
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  };

  return (
    <svg
      className="calculator-preview"
      viewBox={`0 0 ${model.width} ${model.height}`}
      role="img"
      aria-label="Схема раскладки покрытия"
    >
      <defs>
        <clipPath id="calc-room-clip">
          <rect x={model.roomX} y={model.roomY} width={model.roomW} height={model.roomH} />
        </clipPath>
      </defs>
      <rect
        className="calc-room-bg"
        x={model.roomX}
        y={model.roomY}
        width={model.roomW}
        height={model.roomH}
      />
      <g clipPath="url(#calc-room-clip)">
        <g
          transform={model.rotate === 45 ? `rotate(45 ${model.pivotX} ${model.pivotY})` : undefined}
        >
          {model.planks.map((plank) => (
            <rect
              key={`${plank.x}-${plank.y}-${plank.w}`}
              className="calc-plank"
              x={plank.x}
              y={plank.y}
              width={plank.w}
              height={plank.h}
            />
          ))}
        </g>
        {model.chevrons.map((chevron) => (
          <polyline
            key={`${chevron.x}-${chevron.startY}`}
            className="calc-chevron"
            points={chevronPoints(chevron)}
            fill="none"
          />
        ))}
      </g>
      <rect
        className="calc-room-border"
        x={model.roomX}
        y={model.roomY}
        width={model.roomW}
        height={model.roomH}
      />
    </svg>
  );
}

export const Route = createFileRoute("/calculator")({
  validateSearch: (search: Record<string, unknown>): { product?: string } => {
    const product = typeof search["product"] === "string" ? search["product"] : undefined;
    return product ? { product } : {};
  },
  head: () => ({
    meta: [
      { title: "Калькулятор напольных покрытий — Полмастер" },
      {
        name: "description",
        content:
          "Посчитайте, сколько покрытия нужно: упаковки с запасом на подрезку, плинтус, подложка и стоимость укладки.",
      },
      { property: "og:title", content: "Калькулятор напольных покрытий — Полмастер" },
      {
        property: "og:description",
        content: "Упаковки с запасом, плинтус, подложка и стоимость укладки — расчёт за минуту.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalculatorPage,
});

function CalculatorPage() {
  const { product } = Route.useSearch();
  const preset = catalogProducts.find((item) => item.id === product);
  const form = useForm<CalculatorFormInput, unknown, CalculatorFormValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      productId: preset?.id ?? "",
      lengthM: "",
      widthM: "",
      layout: "straight",
      wastePercent: 10,
      packCoverageM2: preset ? String(preset.packCoverageM2) : "",
      packPriceRub: preset ? String(Math.round(preset.price * preset.packCoverageM2)) : "",
      planksPerPack: preset?.planksPerPack ? String(preset.planksPerPack) : "",
      useUnderlay: false,
      underlayRollCoverageM2: "",
      underlayRollPriceRub: "",
      useSkirting: false,
      skirtingPlankLengthM: "",
      skirtingPlankPriceRub: "",
      needInstall: false,
      installRateRubPerM2: "",
    },
  });
  const [result, setResult] = useState<FlooringCalcResult | null>(null);
  const [areaMode, setAreaMode] = useState<"sides" | "area">("sides");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSent, setContactSent] = useState(false);
  const useUnderlay = form.watch("useUnderlay") === true;
  const useSkirting = form.watch("useSkirting") === true;
  const needInstall = form.watch("needInstall") === true;
  const watchLength = form.watch("lengthM");
  const watchWidth = form.watch("widthM");
  const watchCoverage = form.watch("packCoverageM2");
  const watchPlanks = form.watch("planksPerPack");

  const preview = useMemo(() => {
    if (!result) return null;
    const length = Number(watchLength);
    const width = Number(watchWidth);
    if (!Number.isFinite(length) || !Number.isFinite(width) || length <= 0 || width <= 0) {
      return null;
    }
    const planksPerPack = Number(watchPlanks);
    const coverage = Number(watchCoverage);
    let plankWidthM = DEFAULT_PLANK_WIDTH_M;
    let plankLengthM = DEFAULT_PLANK_LENGTH_M;
    if (
      Number.isFinite(planksPerPack) &&
      planksPerPack > 0 &&
      Number.isFinite(coverage) &&
      coverage > 0
    ) {
      plankWidthM = Math.sqrt(coverage / planksPerPack / 5);
      plankLengthM = plankWidthM * 5;
    }
    return buildLayoutPreview({
      layout: result.layout,
      lengthM: length,
      widthM: width,
      plankLengthM,
      plankWidthM,
    });
  }, [result, watchLength, watchWidth, watchCoverage, watchPlanks]);

  const selectProduct = (id: string) => {
    form.setValue("productId", id);
    const item = catalogProducts.find((entry) => entry.id === id);
    if (!item) return;
    form.setValue("packCoverageM2", String(item.packCoverageM2), { shouldValidate: true });
    form.setValue("packPriceRub", String(Math.round(item.price * item.packCoverageM2)), {
      shouldValidate: true,
    });
    form.setValue("planksPerPack", item.planksPerPack ? String(item.planksPerPack) : "");
  };

  const applyCalculation = useCallback(
    (values: CalculatorFormValues) => {
      try {
        setResult(
          calculateFlooring({
            lengthM: values.lengthM,
            widthM: values.widthM,
            layout: values.layout,
            wastePercent: values.wastePercent,
            packCoverageM2: values.packCoverageM2,
            packPriceRub: values.packPriceRub,
            planksPerPack: values.planksPerPack,
            underlayRollCoverageM2: values.underlayRollCoverageM2,
            underlayRollPriceRub: values.underlayRollPriceRub,
            skirtingPlankLengthM: values.skirtingPlankLengthM,
            skirtingPlankPriceRub: values.skirtingPlankPriceRub,
            installRateRubPerM2: values.installRateRubPerM2,
          }),
        );
      } catch (error) {
        form.setError("root", {
          message: error instanceof Error ? error.message : "Не удалось выполнить расчёт",
        });
      }
    },
    [form],
  );

  const onSubmit = (values: CalculatorFormValues) => {
    applyCalculation(values);
  };

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (areaMode === "area") {
        const areaRaw = values.areaM2;
        if (typeof areaRaw === "string" && areaRaw.trim() !== "") {
          const area = Number(areaRaw);
          if (Number.isFinite(area) && area > 0) {
            const side = String(Math.round(Math.sqrt(area) * 1000) / 1000);
            if (form.getValues("lengthM") !== side) {
              form.setValue("lengthM", side, { shouldValidate: true });
            }
            if (form.getValues("widthM") !== side) {
              form.setValue("widthM", side, { shouldValidate: true });
            }
          }
        }
      }
      const parsed = calculatorSchema.safeParse(form.getValues());
      if (parsed.success) {
        applyCalculation(parsed.data);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, applyCalculation, areaMode]);

  const switchMode = (mode: "sides" | "area") => {
    setAreaMode(mode);
    if (mode === "area") {
      const length = Number(form.getValues("lengthM"));
      const width = Number(form.getValues("widthM"));
      if (Number.isFinite(length) && Number.isFinite(width) && length > 0 && width > 0) {
        form.setValue("areaM2", String(Math.round(length * width * 100) / 100), {
          shouldValidate: true,
        });
      }
    }
  };

  const submitContact = () => {
    if (contactName.trim().length < 2) {
      setContactError("Укажите ваше имя");
      setContactSent(false);
      return;
    }
    if (!isValidPhone(contactPhone)) {
      setContactError("Укажите полный номер телефона");
      setContactSent(false);
      return;
    }
    setContactError(null);
    setContactSent(true);
  };

  return (
    <div className="catalog-page">
      <header className="site-header">
        <div className="site-container header-inner">
          <Link to="/" className="brand" aria-label="ПОЛЬ — на главную">
            <Layers3 className="brand-mark" strokeWidth={1.7} />
            <div>
              <div className="brand-name">
                ПОЛЬ<span className="text-primary">.</span>
              </div>
              <div className="brand-subtitle">напольные покрытия</div>
            </div>
          </Link>
          <div className="header-right">
            <nav className="desktop-nav">
              <Link to="/">Главная</Link>
              <Link to="/catalog">Каталог</Link>
              <Link to="/calculator" className="text-primary">
                Калькулятор
              </Link>
              <Link to="/faq">Вопросы</Link>
              <Link to="/about">О компании</Link>
              <Link to="/contacts">Контакты</Link>
            </nav>
            <Button asChild variant="cta" className="header-cta">
              <Link to="/" hash="request">
                Оставить заявку
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="site-container catalog-main">
        <div className="eyebrow">Калькулятор</div>
        <h1 className="page-title">Сколько покрытия нужно</h1>
        <p className="page-lead">
          Введите размеры комнаты — посчитаем упаковки с запасом на подрезку, плинтус, подложку и
          стоимость укладки.
        </p>

        <Form {...form}>
          <form className="calculator-layout" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="calculator-form">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Покрытие из каталога (необязательно)</FormLabel>
                    <Select
                      value={field.value ? field.value : undefined}
                      onValueChange={selectProduct}
                    >
                      <FormControl>
                        <SelectTrigger className="calculator-select w-full">
                          <SelectValue placeholder="Выберите покрытие" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {catalogProducts.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.type} · {item.title} — {item.price.toLocaleString("ru-RU")} ₽/м²
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Площадь и цена упаковки подставятся автоматически — можно изменить.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <div className="calculator-mode" role="group" aria-label="Способ ввода размеров">
                <button
                  type="button"
                  className={areaMode === "sides" ? "is-active" : undefined}
                  onClick={() => switchMode("sides")}
                >
                  Длина × ширина
                </button>
                <button
                  type="button"
                  className={areaMode === "area" ? "is-active" : undefined}
                  onClick={() => switchMode("area")}
                >
                  Площадь, м²
                </button>
              </div>

              {areaMode === "sides" ? (
                <div className="calculator-grid2">
                  <FormField
                    control={form.control}
                    name="lengthM"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Длина комнаты, м</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            min="0"
                            inputMode="decimal"
                            className="lead-input"
                            {...field}
                            value={String(field.value ?? "")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="widthM"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ширина комнаты, м</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            min="0"
                            inputMode="decimal"
                            className="lead-input"
                            {...field}
                            value={String(field.value ?? "")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="areaM2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Площадь комнаты, м²</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          min="0"
                          inputMode="decimal"
                          className="lead-input"
                          {...field}
                          value={String(field.value ?? "")}
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        Сторону комнаты примем как корень из площади.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="layout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Схема укладки</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        const layout = value as FloorLayout;
                        form.setValue("wastePercent", defaultWastePercent[layout], {
                          shouldValidate: true,
                        });
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="calculator-select w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="straight">Прямая — без смещения</SelectItem>
                        <SelectItem value="straightOffset">Прямая — со смещением</SelectItem>
                        <SelectItem value="diagonal">Диагональная — 45°</SelectItem>
                        <SelectItem value="herringbone">Ёлочка</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wastePercent"
                render={({ field }) => (
                  <FormItem className="calculator-slider-row">
                    <FormLabel>Запас на подрезку</FormLabel>
                    <div className="calculator-slider-value">
                      <strong>{Number(field.value ?? 10)}%</strong> по умолчанию — зависит от схемы
                      укладки
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={30}
                        step={1}
                        value={[Number(field.value ?? 10)]}
                        onValueChange={(values) => field.onChange(values[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="calculator-grid2">
                <FormField
                  control={form.control}
                  name="packCoverageM2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Упаковка, м²</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          min="0"
                          inputMode="decimal"
                          className="lead-input"
                          {...field}
                          value={String(field.value ?? "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="packPriceRub"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Цена упаковки, ₽</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          min="0"
                          inputMode="numeric"
                          className="lead-input"
                          {...field}
                          value={String(field.value ?? "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="planksPerPack"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Досок в упаковке, шт (необязательно)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        min="0"
                        inputMode="numeric"
                        className="lead-input"
                        {...field}
                        value={String(field.value ?? "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="calculator-extra">
                <label className="calculator-check-row">
                  <Checkbox
                    checked={useUnderlay}
                    onCheckedChange={(checked) => form.setValue("useUnderlay", checked === true)}
                  />
                  Добавить подложку
                </label>
                {useUnderlay && (
                  <div className="calculator-extra-grid">
                    <FormField
                      control={form.control}
                      name="underlayRollCoverageM2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Рулон, м²</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="any"
                              min="0"
                              inputMode="decimal"
                              className="lead-input"
                              {...field}
                              value={String(field.value ?? "")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="underlayRollPriceRub"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Цена рулона, ₽</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="any"
                              min="0"
                              inputMode="numeric"
                              className="lead-input"
                              {...field}
                              value={String(field.value ?? "")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <label className="calculator-check-row">
                  <Checkbox
                    checked={useSkirting}
                    onCheckedChange={(checked) => form.setValue("useSkirting", checked === true)}
                  />
                  Добавить плинтус
                </label>
                {useSkirting && (
                  <div className="calculator-extra-grid">
                    <FormField
                      control={form.control}
                      name="skirtingPlankLengthM"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Планка, м</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="any"
                              min="0"
                              inputMode="decimal"
                              className="lead-input"
                              {...field}
                              value={String(field.value ?? "")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="skirtingPlankPriceRub"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Цена планки, ₽</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="any"
                              min="0"
                              inputMode="numeric"
                              className="lead-input"
                              {...field}
                              value={String(field.value ?? "")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <label className="calculator-check-row">
                  <Checkbox
                    checked={needInstall}
                    onCheckedChange={(checked) => form.setValue("needInstall", checked === true)}
                  />
                  Нужна укладка
                </label>
                {needInstall && (
                  <FormField
                    control={form.control}
                    name="installRateRubPerM2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Укладка, ₽/м²</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            min="0"
                            inputMode="numeric"
                            className="lead-input"
                            {...field}
                            value={String(field.value ?? "")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="calculator-actions">
                <Button type="submit" variant="cta" size="cta">
                  Рассчитать
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="cta"
                  onClick={() => {
                    form.reset();
                    setAreaMode("sides");
                    setResult(null);
                    setContactError(null);
                    setContactSent(false);
                  }}
                >
                  Сбросить
                </Button>
              </div>
              {form.formState.errors.root?.message && (
                <div className="field-error" role="alert">
                  {form.formState.errors.root.message}
                </div>
              )}
            </div>

            <aside className="calculator-result" aria-live="polite">
              <h2 className="calculator-result-title">Смета</h2>
              {result ? (
                <>
                  {preview && (
                    <figure className="calculator-preview-card">
                      <figcaption className="calculator-preview-caption">
                        <span className="calculator-preview-label">Схема укладки</span>
                        <strong>{layoutLabels[result.layout]}</strong>
                      </figcaption>
                      <LayoutPreviewSvg model={preview} />
                    </figure>
                  )}
                  <div className="calculator-result-row">
                    <span>Площадь комнаты</span>
                    <strong>{formatArea(result.areaM2)}</strong>
                  </div>
                  <div className="calculator-result-row">
                    <span>Схема укладки</span>
                    <strong>
                      {layoutLabels[result.layout]} · запас {result.wastePercent}%
                    </strong>
                  </div>
                  <div className="calculator-result-row">
                    <span>Площадь с запасом</span>
                    <strong>{formatArea(result.areaWithWasteM2)}</strong>
                  </div>
                  <div className="calculator-result-row">
                    <span>Упаковок к покупке</span>
                    <strong>
                      {result.packs} уп. · {formatArea(result.purchasedCoverageM2)}
                    </strong>
                  </div>
                  {result.planks !== null && (
                    <div className="calculator-result-row">
                      <span>Досок</span>
                      <strong>{result.planks} шт</strong>
                    </div>
                  )}
                  <div className="calculator-result-row">
                    <span>Периметр комнаты</span>
                    <strong>{result.perimeterM.toLocaleString("ru-RU")} м</strong>
                  </div>
                  {result.skirtingPlanks !== null && (
                    <div className="calculator-result-row">
                      <span>Плинтус</span>
                      <strong>{result.skirtingPlanks} планок</strong>
                    </div>
                  )}
                  {result.underlayRolls !== null && (
                    <div className="calculator-result-row">
                      <span>Подложка</span>
                      <strong>{result.underlayRolls} рул.</strong>
                    </div>
                  )}
                  <div className="calculator-result-row">
                    <span>Материалы</span>
                    <strong>{formatRub(result.materialsCostRub)}</strong>
                  </div>
                  {result.installCostRub > 0 && (
                    <div className="calculator-result-row">
                      <span>Укладка</span>
                      <strong>{formatRub(result.installCostRub)}</strong>
                    </div>
                  )}
                  <div className="calculator-result-total">
                    <span>Итого</span>
                    <strong>{formatRub(result.totalCostRub)}</strong>
                  </div>
                  <div className="calculator-contact">
                    <h3 className="calculator-contact-title">Получить точный расчёт</h3>
                    <p className="calculator-contact-note">
                      Оставьте контакты — перезвоним и составим финальную смету после замера.
                    </p>
                    <Input
                      value={contactName}
                      onChange={(event) => setContactName(event.target.value)}
                      placeholder="Ваше имя"
                      aria-label="Ваше имя"
                      className="lead-input"
                    />
                    <Input
                      value={contactPhone}
                      onChange={(event) => setContactPhone(event.target.value)}
                      placeholder="Телефон"
                      aria-label="Телефон"
                      inputMode="tel"
                      className="lead-input"
                    />
                    <Button type="button" variant="cta" className="w-full" onClick={submitContact}>
                      Получить точный расчёт
                    </Button>
                    {contactError && (
                      <div className="field-error" role="alert">
                        {contactError}
                      </div>
                    )}
                    {contactSent && (
                      <div className="calculator-contact-success" role="status">
                        Отправка пока не подключена. Заявка не отправлена — для связи необходимо
                        добавить контакты магазина.
                      </div>
                    )}
                  </div>
                  <p className="calculator-result-note">
                    Расчёт предварительный: точное количество зависит от партии, раскладки и
                    размеров досок. Финальную смету составим после замера.
                  </p>
                </>
              ) : (
                <p className="calculator-result-note">
                  Заполните размеры комнаты и нажмите «Рассчитать» — здесь появится смета с
                  количеством упаковок, плинтуса и стоимостью.
                </p>
              )}
            </aside>
          </form>
        </Form>
      </main>
    </div>
  );
}
