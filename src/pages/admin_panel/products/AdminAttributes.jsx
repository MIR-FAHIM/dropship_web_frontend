import React, { useState } from "react";
import { SlidersHorizontal, Plus, Search } from "lucide-react";
import { useGetAttributesQuery, useCreateAttributeMutation, useCreateValueMutation } from "../../../redux/features/attribute";
import CustomModal from "../../../components/ui/CustomModal";
import CustomButton from "../../../components/ui/CustomButton";
import FormikForm from "../../../components/formik/FormikForm";
import FormikInput from "../../../components/formik/FormikInput";
import FormikDropdown from "../../../components/formik/FormikDropdown";
import * as Yup from "yup";


const AdminAttributes = () => {
  const [openAttrModal, setOpenAttrModal] = useState(false);
  const [openValueModal, setOpenValueModal] = useState(false);
  const [selectedAttr, setSelectedAttr] = useState(null); // {id, name} or null

  const { data, isLoading, isError, refetch } = useGetAttributesQuery();
  const [createAttribute, { isLoading: creatingAttr }] = useCreateAttributeMutation();
  const [createValue, { isLoading: creatingValue }] = useCreateValueMutation();

  // Attribute create form
  const attrInitial = { name: "", status: 1 };
  const attrSchema = Yup.object({
    name: Yup.string().required("আবশ্যক"),
    status: Yup.number().required(),
  });

  // Value create form
  const valueInitial = { attribute_id: "", value: "", status: 1 };
  const valueSchema = Yup.object({
    attribute_id: Yup.string().required("আবশ্যক"),
    value: Yup.string().required("আবশ্যক"),
    status: Yup.number().required(),
  });

  const handleAttrSubmit = async (values, { resetForm }) => {
    await createAttribute(values).unwrap();
    resetForm();
    setOpenAttrModal(false);
    refetch();
  };

  const handleValueSubmit = async (values, { resetForm }) => {
    // If opened from attribute, force attribute_id
    const submitData = { ...values };
    if (selectedAttr) submitData.attribute_id = selectedAttr.id.toString();
    await createValue(submitData).unwrap();
    resetForm();
    setOpenValueModal(false);
    setSelectedAttr(null);
    refetch();
  };

  // Prepare attribute options for dropdown
  const attrOptions = (data?.data || []).map((a) => ({ value: a.id.toString(), label: a.name }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800">অ্যাট্রিবিউট</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="অ্যাট্রিবিউট খুঁজুন..."
              className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
          <CustomButton
            label="অ্যাট্রিবিউট যোগ"
            onClick={() => setOpenAttrModal(true)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition shrink-0"
            startIcon={<Plus className="w-4 h-4" />}
          />
          <CustomButton
            label="অ্যাট্রিবিউট ভ্যালু যোগ"
            onClick={() => setOpenValueModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shrink-0"
            startIcon={<Plus className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Attribute List */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {isLoading ? (
          <div className="text-center py-16 text-gray-400">লোড হচ্ছে...</div>
        ) : isError ? (
          <div className="text-center py-16 text-red-500">লোড করতে সমস্যা হয়েছে।</div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-16">
            <SlidersHorizontal className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">এখনো কোনো অ্যাট্রিবিউট যোগ করা হয়নি।</p>
            <p className="text-gray-400 text-xs mt-1">উপরের বাটনে ক্লিক করে নতুন অ্যাট্রিবিউট যোগ করুন।</p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.data.map((attr) => (
              <div key={attr.id} className="border-b pb-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-800">{attr.name}</span>
                  <span className="text-xs text-gray-500">[{attr.status ? "Active" : "Inactive"}]</span>
                  <button
                    className="ml-2 text-xs text-blue-600 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50"
                    onClick={() => {
                      setSelectedAttr({ id: attr.id, name: attr.name });
                      setOpenValueModal(true);
                    }}
                  >
                    ভ্যালু যোগ
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 ml-4">
                  {attr.values?.length > 0 ? (
                    attr.values.map((val) => (
                      <span key={val.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700 border">
                        {val.value}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">No values</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Attribute Modal */}
      <CustomModal title="নতুন অ্যাট্রিবিউট" open={openAttrModal} setOpen={setOpenAttrModal}>
        <FormikForm initialValues={attrInitial} validationSchema={attrSchema} onSubmit={handleAttrSubmit}>
          <FormikInput name="name" label="নাম" required />
          <FormikDropdown
            name="status"
            label="স্ট্যাটাস"
            options={[
              { value: "1", label: "Active" },
              { value: "0", label: "Inactive" },
            ]}
          />
          <CustomButton label={creatingAttr ? "সাবমিট হচ্ছে..." : "সাবমিট"} type="submit" disabled={creatingAttr} />
        </FormikForm>
      </CustomModal>

      {/* Create Attribute Value Modal */}
      <CustomModal title="নতুন অ্যাট্রিবিউট ভ্যালু" open={openValueModal} setOpen={(v) => { setOpenValueModal(v); if (!v) setSelectedAttr(null); }}>
        <FormikForm
          initialValues={selectedAttr ? { attribute_id: selectedAttr.id.toString(), value: "", status: 1 } : valueInitial}
          validationSchema={valueSchema}
          onSubmit={handleValueSubmit}
        >
          <FormikDropdown
            name="attribute_id"
            label="অ্যাট্রিবিউট"
            options={attrOptions}
            disabled={!!selectedAttr}
          />
          <FormikInput name="value" label="ভ্যালু" required />
          <FormikDropdown
            name="status"
            label="স্ট্যাটাস"
            options={[
              { value: "1", label: "Active" },
              { value: "0", label: "Inactive" },
            ]}
          />
          <CustomButton label={creatingValue ? "সাবমিট হচ্ছে..." : "সাবমিট"} type="submit" disabled={creatingValue} />
        </FormikForm>
      </CustomModal>
    </div>
  );
};

export default AdminAttributes;
