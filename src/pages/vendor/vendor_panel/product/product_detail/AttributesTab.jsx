import React, { useState } from "react";
import * as Yup from "yup";
import { toast } from "sonner";
import { useGetAttributesQuery, useGetAttributeDetailsQuery } from "../../../../../redux/features/attribute";
import { useCreateProductAttributeMutation, useListByProductAttributesQuery } from "../../../../../redux/features/productAttribute";
import FormikForm from "../../../../../components/formik/FormikForm";
import FormikDropdown from "../../../../../components/formik/FormikDropdown";
import FormikInput from "../../../../../components/formik/FormikInput";

const prodAttrInitial = { attribute_id: "", attribute_value_id: "", stock: "" };
const prodAttrSchema = Yup.object({
  attribute_id: Yup.string().required("Required"),
  attribute_value_id: Yup.string().required("Required"),
  stock: Yup.number().required("Required"),
});

const AttributesTab = ({ productId }) => {
  const [selectedAttrId, setSelectedAttrId] = useState("");

  const { data: attrData } = useGetAttributesQuery();
  const { data: prodAttrList, refetch: refetchProdAttr } = useListByProductAttributesQuery(productId);
  const { data: selectedAttrDetails, isLoading: loadingAttrDetails } = useGetAttributeDetailsQuery(
    selectedAttrId ? Number(selectedAttrId) : undefined,
    { skip: selectedAttrId === "" }
  );
  const [createProductAttribute, { isLoading: creatingProdAttr }] = useCreateProductAttributeMutation();

  const attributeOptions = (attrData?.data || []).map((a) => ({
    value: String(a.id),
    label: a.name,
  }));

  const valuesArr = selectedAttrDetails?.data?.values || selectedAttrDetails?.data?.attribute_values || [];
  const attributeValueOptions = Array.isArray(valuesArr)
    ? valuesArr.map((v) => ({ value: String(v.id), label: v.value }))
    : [];

  const handleProdAttrSubmit = async (values, { resetForm }) => {
    const payload = {
      product_id: productId,
      attribute_id: Number(values.attribute_id),
      attribute_value_id: Number(values.attribute_value_id),
      stock: values.stock,
    };
    await createProductAttribute(payload).unwrap();
    toast.success("Product attribute added");
    resetForm();
    setSelectedAttrId("");
    refetchProdAttr();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold mb-2">Product Attributes</h2>
      <FormikForm
        initialValues={prodAttrInitial}
        validationSchema={prodAttrSchema}
        onSubmit={handleProdAttrSubmit}
      >
        <FormikDropdown
          name="attribute_id"
          label="Attribute"
          options={attributeOptions}
          onChange={(val, form) => {
            const strVal = val ? String(val) : "";
            setSelectedAttrId(strVal);
            form.setFieldValue("attribute_id", strVal);
            form.setFieldValue("attribute_value_id", "");
          }}
        />
        <FormikDropdown
          name="attribute_value_id"
          label={loadingAttrDetails ? "Loading..." : "Attribute Value"}
          options={attributeValueOptions}
          disabled={!selectedAttrId || loadingAttrDetails}
        />
        {selectedAttrId && !loadingAttrDetails && attributeValueOptions.length === 0 && (
          <div className="text-xs text-red-500 mt-1">
            No attribute values found for this attribute.
          </div>
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
                Attribute: {item.attribute?.name} | Value: {item.value?.value} | Stock: {item.stock}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-400">No attributes added yet.</div>
        )}
      </div>
    </div>
  );
};

export default AttributesTab;
