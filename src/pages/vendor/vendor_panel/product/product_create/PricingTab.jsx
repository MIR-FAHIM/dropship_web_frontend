const PricingTab = ({ formData, handleChange, inputClass, labelClass }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    <div>
      <label className={labelClass}>Vendor Price *</label>
      <input
        type="number"
        name="unit_price"
        value={formData.unit_price}
        onChange={handleChange}
        placeholder="0"
        className={inputClass}
        required
      />
    </div>
    <div>
      <label className={labelClass}>বর্তমান স্টক</label>
      <input
        type="number"
        name="current_stock"
        value={formData.current_stock}
        onChange={handleChange}
        placeholder="0"
        className={inputClass}
      />
    </div>
  </div>
);

export default PricingTab;
