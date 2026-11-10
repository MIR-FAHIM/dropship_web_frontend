import FormikForm from "../../../../../components/formik/FormikForm";
import FormikDropdown from "../../../../../components/formik/FormikDropdown";
import FormikInput from "../../../../../components/formik/FormikInput";
import ProductAttributeList from "../ProductAttributeList";

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
  loadingProdAttrList,
  prodAttrListError,
  refetchProdAttr,
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

    <ProductAttributeList
      items={prodAttrList?.data ?? []}
      isLoading={loadingProdAttrList}
      error={prodAttrListError}
      onRetry={refetchProdAttr}
    />
  </div>
);

export default ProductAttributeTab;
