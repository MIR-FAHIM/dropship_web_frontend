import FormikForm from "../../../../../components/formik/FormikForm";
import FormikDropdown from "../../../../../components/formik/FormikDropdown";
import FormikInput from "../../../../../components/formik/FormikInput";

const ProductAttributeTab = ({
  prodAttrInitial,
  prodAttrSchema,
  handleProdAttrSubmit,
  attributeOptions,
  attributeValueOptions,
  selectedAttrId,
  setSelectedAttrId,
  loadingAttrDetails,
  creatingProdAttr,
  prodAttrList,
}) => (
  <div className="space-y-6">
    <h2 className="text-lg font-bold mb-2">Product Attribute</h2>
    <FormikForm
      initialValues={prodAttrInitial}
      validationSchema={prodAttrSchema}
      onSubmit={handleProdAttrSubmit}
    >
      <FormikDropdown
        name="attribute_id"
        label="Attribute"
        options={attributeOptions}
        onChange={(value, form) => {
          const numericValue = typeof value === "string" ? Number(value) : value;
          setSelectedAttrId(numericValue);
          form.setFieldValue("attribute_id", numericValue);
          form.setFieldValue("attribute_value_id", "");
        }}
      />
      <FormikDropdown
        name="attribute_value_id"
        label={loadingAttrDetails ? "Loading..." : "Attribute Value"}
        options={attributeValueOptions}
        disabled={selectedAttrId == null || loadingAttrDetails}
      />
      {selectedAttrId != null && !loadingAttrDetails && attributeValueOptions.length === 0 && (
        <div className="text-xs text-red-500 mt-1">No attribute values found for this attribute.</div>
      )}
      <FormikInput name="stock" label="Stock" type="number" required />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={creatingProdAttr}
      >
        {creatingProdAttr ? "Adding..." : "Add Attribute"}
      </button>
    </FormikForm>

    <div className="mt-6">
      <h3 className="font-semibold mb-2">Attribute List</h3>
      {prodAttrList?.data?.length > 0 ? (
        <ul className="list-disc ml-6">
          {prodAttrList.data.map((item) => (
            <li key={item.id}>
              Attribute: {item.attribute?.name} | Value: {item.attribute_value?.value} | Stock: {item.stock}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-400">No attributes added yet.</div>
      )}
    </div>
  </div>
);

export default ProductAttributeTab;
