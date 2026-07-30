const colorPattern = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export const templateOptions = [
  { value: "default", label: "Default" },
  { value: "modern", label: "Modern" },
  { value: "classic", label: "Classic" },
  { value: "minimal", label: "Minimal" },
  { value: "bold", label: "Bold" },
];

export const fontOptions = [
  { value: "clean", label: "Clean" },
  { value: "system", label: "System" },
  { value: "friendly", label: "Friendly" },
  { value: "elegant", label: "Elegant" },
];

export const layoutStyleOptions = [
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "minimal", label: "Minimal" },
  { value: "bold", label: "Bold" },
];

export const heroAlignmentOptions = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
];

export const imagePositionOptions = [
  { value: "top", label: "Top" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

export const defaultProductPageDesignSettings = {
  theme: {
    primary_color: "#2563eb",
    secondary_color: "#16a34a",
    background_color: "#ffffff",
    text_color: "#111827",
    button_color: "#2563eb",
    button_text_color: "#ffffff",
    font_style: "clean",
  },
  layout: {
    style: "classic",
    hero_alignment: "center",
    image_position: "top",
  },
  hero: {
    badge_text: "Limited Offer",
    cta_text: "Order Now",
    subtitle: "Best quality product at the best price",
  },
  sections: {
    show_gallery: true,
    show_benefits: true,
    show_reviews: true,
    show_faq: true,
    show_delivery_info: true,
    show_whatsapp_button: true,
  },
  benefits: ["High quality product", "Fast delivery", "Cash on delivery available"],
  faq: [
    {
      question: "Is cash on delivery available?",
      answer: "Yes, cash on delivery is available.",
    },
  ],
};

export const defaultProductPageDesign = defaultProductPageDesignSettings;

const templateDesigns = {
  default: defaultProductPageDesignSettings,
  modern: {
    ...defaultProductPageDesignSettings,
    theme: {
      ...defaultProductPageDesignSettings.theme,
      primary_color: "#0f766e",
      secondary_color: "#2563eb",
      button_color: "#0f766e",
    },
    layout: { style: "modern", hero_alignment: "left", image_position: "left" },
  },
  classic: {
    ...defaultProductPageDesignSettings,
    theme: {
      ...defaultProductPageDesignSettings.theme,
      primary_color: "#7c2d12",
      secondary_color: "#166534",
      background_color: "#fafaf9",
      text_color: "#1c1917",
      button_color: "#7c2d12",
      font_style: "elegant",
    },
    layout: { style: "classic", hero_alignment: "left", image_position: "right" },
  },
  minimal: {
    ...defaultProductPageDesignSettings,
    theme: {
      ...defaultProductPageDesignSettings.theme,
      primary_color: "#111827",
      secondary_color: "#64748b",
      background_color: "#ffffff",
      text_color: "#111827",
      button_color: "#111827",
    },
    layout: { style: "minimal", hero_alignment: "left", image_position: "top" },
  },
  bold: {
    ...defaultProductPageDesignSettings,
    theme: {
      ...defaultProductPageDesignSettings.theme,
      primary_color: "#dc2626",
      secondary_color: "#2563eb",
      background_color: "#fff7ed",
      text_color: "#111827",
      button_color: "#dc2626",
    },
    layout: { style: "bold", hero_alignment: "center", image_position: "left" },
  },
};

export const normalizeTemplateId = (value) => {
  if (value === 1 || value === "1") return "default";
  if (value === 2 || value === "2") return "modern";
  if (value === 3 || value === "3") return "classic";
  if (value === 4 || value === "4") return "bold";
  return templateOptions.some((option) => option.value === value) ? value : "default";
};

export const parseDesignSettings = (value) => {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value !== "string") return {};

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const safeColor = (value, fallback) => {
  const color = String(value || "").trim();
  return colorPattern.test(color) ? color : fallback;
};

const optionValue = (options, value, fallback) =>
  options.some((option) => option.value === value) ? value : fallback;

const normalizeTextList = (value, fallback, maxItems) => {
  const source = Array.isArray(value) ? value : fallback;
  return source.map((item) => String(item || "").trim()).filter(Boolean).slice(0, maxItems);
};

const normalizeFaqList = (value, fallback) => {
  const source = Array.isArray(value) ? value : fallback;
  return source
    .map((item) => ({
      question: String(item?.question || "").trim(),
      answer: String(item?.answer || "").trim(),
    }))
    .filter((item) => item.question || item.answer)
    .slice(0, 10);
};

export const getTemplateDesignSettings = (templateId = "default") =>
  JSON.parse(JSON.stringify(templateDesigns[normalizeTemplateId(templateId)] || templateDesigns.default));

export const normalizeDesignSettings = (settingsValue, templateId = "default") => {
  const template = getTemplateDesignSettings(templateId);
  const settings = parseDesignSettings(settingsValue);

  const themeSource = settings.theme || settings;
  const layoutSource = settings.layout || settings;
  const heroSource = settings.hero || settings;
  const sectionsSource = settings.sections || settings;

  return {
    theme: {
      primary_color: safeColor(themeSource.primary_color, template.theme.primary_color),
      secondary_color: safeColor(themeSource.secondary_color || themeSource.accent_color, template.theme.secondary_color),
      background_color: safeColor(themeSource.background_color, template.theme.background_color),
      text_color: safeColor(themeSource.text_color, template.theme.text_color),
      button_color: safeColor(themeSource.button_color || themeSource.primary_color, template.theme.button_color),
      button_text_color: safeColor(themeSource.button_text_color, template.theme.button_text_color),
      font_style: optionValue(fontOptions, themeSource.font_style, template.theme.font_style),
    },
    layout: {
      style: optionValue(layoutStyleOptions, layoutSource.style || layoutSource.button_style, template.layout.style),
      hero_alignment: optionValue(heroAlignmentOptions, layoutSource.hero_alignment, template.layout.hero_alignment),
      image_position: optionValue(
        imagePositionOptions,
        layoutSource.image_position || (layoutSource.hero_layout === "image_right" ? "right" : layoutSource.hero_layout === "image_left" ? "left" : null),
        template.layout.image_position,
      ),
    },
    hero: {
      badge_text: String(heroSource.badge_text ?? template.hero.badge_text),
      cta_text: String(heroSource.cta_text ?? template.hero.cta_text),
      subtitle: String(heroSource.subtitle ?? template.hero.subtitle),
    },
    sections: {
      show_gallery: sectionsSource.show_gallery !== false,
      show_benefits: sectionsSource.show_benefits !== false,
      show_reviews: sectionsSource.show_reviews !== false,
      show_faq: sectionsSource.show_faq !== false,
      show_delivery_info: sectionsSource.show_delivery_info !== false,
      show_whatsapp_button: sectionsSource.show_whatsapp_button !== false,
    },
    benefits: normalizeTextList(settings.benefits, template.benefits, 8),
    faq: normalizeFaqList(settings.faq, template.faq),
  };
};

export const getProductPageDesign = (page = {}) => {
  const template_id = normalizeTemplateId(page?.template_id);
  const settings = normalizeDesignSettings(page?.design_settings, template_id);

  return {
    template_id,
    ...settings,
    primary_color: settings.theme.primary_color,
    accent_color: settings.theme.secondary_color,
    background_color: settings.theme.background_color,
    text_color: settings.theme.text_color,
    card_background: "#ffffff",
    button_color: settings.theme.button_color,
    button_text_color: settings.theme.button_text_color,
    font_style: settings.theme.font_style,
    button_style: settings.layout.style,
    hero_layout: settings.layout.image_position === "right" ? "image_right" : "image_left",
    show_store_card: true,
    show_stock_badge: true,
  };
};

export const getButtonRadiusClass = (buttonStyle) => {
  if (buttonStyle === "minimal") return "rounded-md";
  if (buttonStyle === "bold") return "rounded-md";
  if (buttonStyle === "modern") return "rounded-2xl";
  return "rounded-lg";
};

export const getFontFamily = (fontStyle) => {
  if (fontStyle === "friendly") return "Inter, ui-sans-serif, system-ui, sans-serif";
  if (fontStyle === "elegant") return "Georgia, Cambria, Times New Roman, serif";
  return "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
};
