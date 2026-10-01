import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const BasicInfoTab = ({
  formData,
  setFormData,
  handleChange,
  categories,
  brands,
  inputClass,
  labelClass,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    <div className="md:col-span-2">
      <label className={labelClass}>পণ্যের নাম *</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="পণ্যের নাম লিখুন"
        className={inputClass}
        required
      />
    </div>
    <div>
      <label className={labelClass}>ক্যাটাগরি *</label>
      <select
        name="category_id"
        value={formData.category_id}
        onChange={handleChange}
        className={inputClass}
        required
      >
        <option value="">ক্যাটাগরি নির্বাচন করুন</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
    <div>
      <label className={labelClass}>ব্র্যান্ড</label>
      <select
        name="brand_id"
        value={formData.brand_id}
        onChange={handleChange}
        className={inputClass}
      >
        <option value="">ব্র্যান্ড নির্বাচন করুন</option>
        {brands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>
    </div>
    <div>
      <label className={labelClass}>ট্যাগ</label>
      <input
        type="text"
        name="tags"
        value={formData.tags}
        onChange={handleChange}
        placeholder="কমা দিয়ে আলাদা করুন"
        className={inputClass}
      />
    </div>
    <div className="md:col-span-2">
      <label className={labelClass}>বিবরণ</label>
      <ReactQuill
        theme="snow"
        value={formData.description}
        onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
        placeholder="পণ্যের বিবরণ লিখুন..."
        className="bg-white rounded-lg border border-gray-300"
        style={{ minHeight: 120 }}
      />
    </div>
  </div>
);

export default BasicInfoTab;
