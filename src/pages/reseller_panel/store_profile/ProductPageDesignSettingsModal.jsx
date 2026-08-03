/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Loader2, Palette, Plus, Save, Trash2, X } from "lucide-react";
import {
  defaultProductPageDesignSettings,
  fontOptions,
  getTemplateDesignSettings,
  heroAlignmentOptions,
  imagePositionOptions,
  layoutStyleOptions,
  normalizeDesignSettings,
  normalizeTemplateId,
  templateOptions,
} from "../../../utils/resellerProductPageDesign.utils";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500";

const sectionItems = [
  ["show_gallery", "Gallery"],
  ["show_benefits", "Benefits"],
  ["show_reviews", "Reviews"],
  ["show_faq", "FAQ"],
  ["show_delivery_info", "Delivery info"],
  ["show_whatsapp_button", "WhatsApp button"],
];

const cleanText = (value) => String(value || "").replace(/[<>]/g, "");

const getInitialForm = (page) => {
  const template_id = normalizeTemplateId(page?.template_id);
  return {
    template_id,
    design_settings: normalizeDesignSettings(page?.design_settings || defaultProductPageDesignSettings, template_id),
  };
};

const ProductPageDesignSettingsModal = ({ open, page, loading = false, onClose, onSubmit }) => {
  const [form, setForm] = useState(getInitialForm(page));

  useEffect(() => {
    if (open) setForm(getInitialForm(page));
  }, [open, page]);

  if (!open) return null;

  const settings = form.design_settings;

  const applyTemplate = (template_id) => {
    setForm({ template_id, design_settings: getTemplateDesignSettings(template_id) });
  };

  const updateTemplate = (event) => {
    applyTemplate(event.target.value);
  };

  const updateNested = (group, key, value) => {
    setForm((prev) => ({
      ...prev,
      design_settings: {
        ...prev.design_settings,
        [group]: {
          ...prev.design_settings[group],
          [key]: value,
        },
      },
    }));
  };

  const updateBenefit = (index, value) => {
    setForm((prev) => {
      const benefits = [...prev.design_settings.benefits];
      benefits[index] = cleanText(value);
      return { ...prev, design_settings: { ...prev.design_settings, benefits } };
    });
  };

  const addBenefit = () => {
    if (settings.benefits.length >= 8) return;
    setForm((prev) => ({
      ...prev,
      design_settings: { ...prev.design_settings, benefits: [...prev.design_settings.benefits, ""] },
    }));
  };

  const removeBenefit = (index) => {
    setForm((prev) => ({
      ...prev,
      design_settings: {
        ...prev.design_settings,
        benefits: prev.design_settings.benefits.filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  };

  const updateFaq = (index, key, value) => {
    setForm((prev) => {
      const faq = [...prev.design_settings.faq];
      faq[index] = { ...faq[index], [key]: cleanText(value) };
      return { ...prev, design_settings: { ...prev.design_settings, faq } };
    });
  };

  const addFaq = () => {
    if (settings.faq.length >= 10) return;
    setForm((prev) => ({
      ...prev,
      design_settings: {
        ...prev.design_settings,
        faq: [...prev.design_settings.faq, { question: "", answer: "" }],
      },
    }));
  };

  const removeFaq = (index) => {
    setForm((prev) => ({
      ...prev,
      design_settings: {
        ...prev.design_settings,
        faq: prev.design_settings.faq.filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.({
      template_id: form.template_id,
      design_settings: normalizeDesignSettings(form.design_settings, form.template_id),
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={loading ? undefined : onClose} />
      <form onSubmit={handleSubmit} className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <Palette className="h-5 w-5 text-blue-600" />
              Product Page Design Settings
            </div>
            <p className="mt-1 text-xs text-gray-500">Customize colors, layout, page copy, and visible sections.</p>
          </div>
          <button type="button" onClick={onClose} disabled={loading} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <section className="rounded-xl border border-gray-200 p-4">
              <h3 className="mb-4 text-sm font-black text-gray-800">Theme</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Template Style</label>
                  <select value={form.template_id} onChange={updateTemplate} className={inputClass}>
                    {templateOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Font Style</label>
                  <select value={settings.theme.font_style} onChange={(event) => updateNested("theme", "font_style", event.target.value)} className={inputClass}>
                    {fontOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Choose Theme</label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {templateOptions.map((option) => {
                      const preview = getTemplateDesignSettings(option.value);
                      const active = form.template_id === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => applyTemplate(option.value)}
                          className={`rounded-xl border p-3 text-left transition ${
                            active ? "border-blue-600 bg-blue-50 shadow-sm ring-2 ring-blue-100" : "border-gray-200 bg-white hover:border-blue-200 hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-sm font-black text-gray-800">{option.label}</span>
                          <span className="mt-3 flex gap-1.5">
                            {[
                              preview.theme.primary_color,
                              preview.theme.secondary_color,
                              preview.theme.background_color,
                              preview.theme.button_color,
                            ].map((color, index) => (
                              <span key={`${option.value}-${index}`} className="h-5 w-5 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
                            ))}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {[
                  ["primary_color", "Primary Color"],
                  ["secondary_color", "Secondary Color"],
                  ["background_color", "Background Color"],
                  ["text_color", "Text Color"],
                  ["button_color", "Button Color"],
                  ["button_text_color", "Button Text Color"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className={labelClass}>{label}</label>
                    <input type="color" value={settings.theme[key]} onChange={(event) => updateNested("theme", key, event.target.value)} className="h-11 w-full rounded-lg border border-gray-300 bg-white p-1" />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 p-4">
              <h3 className="mb-4 text-sm font-black text-gray-800">Layout & Hero</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className={labelClass}>Layout Style</label>
                  <select value={settings.layout.style} onChange={(event) => updateNested("layout", "style", event.target.value)} className={inputClass}>
                    {layoutStyleOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Hero Alignment</label>
                  <select value={settings.layout.hero_alignment} onChange={(event) => updateNested("layout", "hero_alignment", event.target.value)} className={inputClass}>
                    {heroAlignmentOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Image Position</label>
                  <select value={settings.layout.image_position} onChange={(event) => updateNested("layout", "image_position", event.target.value)} className={inputClass}>
                    {imagePositionOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Badge Text</label>
                  <input value={settings.hero.badge_text} onChange={(event) => updateNested("hero", "badge_text", cleanText(event.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>CTA Button Text</label>
                  <input value={settings.hero.cta_text} onChange={(event) => updateNested("hero", "cta_text", cleanText(event.target.value))} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Subtitle</label>
                  <textarea value={settings.hero.subtitle} onChange={(event) => updateNested("hero", "subtitle", cleanText(event.target.value))} rows={3} className={inputClass} />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 p-4">
              <h3 className="mb-4 text-sm font-black text-gray-800">Visible Sections</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sectionItems.map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-3 text-sm font-semibold text-gray-700">
                    <input type="checkbox" checked={settings.sections[key]} onChange={(event) => updateNested("sections", key, event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                    {label}
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-black text-gray-800">Benefits</h3>
                <button type="button" onClick={addBenefit} disabled={settings.benefits.length >= 8} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50">
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {settings.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <input value={benefit} onChange={(event) => updateBenefit(index, event.target.value)} className={inputClass} placeholder={`Benefit ${index + 1}`} />
                    <button type="button" onClick={() => removeBenefit(index)} className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-black text-gray-800">FAQ</h3>
                <button type="button" onClick={addFaq} disabled={settings.faq.length >= 10} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50">
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
              <div className="space-y-3">
                {settings.faq.map((item, index) => (
                  <div key={index} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-gray-500">Question {index + 1}</span>
                      <button type="button" onClick={() => removeFaq(index)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <input value={item.question} onChange={(event) => updateFaq(index, "question", event.target.value)} className={inputClass} placeholder="Question" />
                    <textarea value={item.answer} onChange={(event) => updateFaq(index, "answer", event.target.value)} rows={2} className={`${inputClass} mt-2`} placeholder="Answer" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="rounded-xl border border-gray-200 p-4 lg:sticky lg:top-4 lg:self-start">
            <p className="text-xs font-bold uppercase text-gray-500">Preview</p>
            <div className="mt-3 overflow-hidden rounded-xl border border-gray-200" style={{ backgroundColor: settings.theme.background_color, color: settings.theme.text_color }}>
              <div className="p-4">
                <span className="rounded-full px-3 py-1 text-xs font-black" style={{ backgroundColor: `${settings.theme.primary_color}18`, color: settings.theme.primary_color }}>
                  {settings.hero.badge_text || "Limited Offer"}
                </span>
                <h4 className="mt-4 text-xl font-black">{page?.custom_title || "Product title"}</h4>
                <p className="mt-2 text-sm opacity-75">{settings.hero.subtitle || "Best quality product at the best price"}</p>
                <button type="button" className="mt-4 w-full rounded-lg px-4 py-3 text-sm font-black" style={{ backgroundColor: settings.theme.button_color, color: settings.theme.button_text_color }}>
                  {settings.hero.cta_text || "Order Now"}
                </button>
              </div>
            </div>
          </aside>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-gray-100 bg-white px-5 py-4">
          <button type="button" onClick={onClose} disabled={loading} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Design
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductPageDesignSettingsModal;
