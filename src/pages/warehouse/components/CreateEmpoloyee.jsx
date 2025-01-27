import { useState } from "react";
import { toast } from "sonner";
import { FieldArray, Form, Formik } from "formik";
import { Link } from "react-router-dom";
import CustomTable from "../../../components/ui/CustomTable";
import { useGetWarehouseUserQuery } from "../../../redux/features/warehouse";
import { useCreateWarehouseUserMutation } from "../../../redux/features/warehouse";
import {  useAssignWarehouseUserMutation } from "../../../redux/features/warehouse";
import FormikInput from "../../../components/formik/FormikInput";
import statusMeaning from "../../../utils/statusMeaning.utils";
import CustomButton from "../../../components/ui/CustomButton";
const tableHead = [
  "Name",
  "Email",
  "Mobile",
  "Type",
];

const WarehouseUser = ({ id }) => {
  const { data ,refetch} = useGetWarehouseUserQuery(id);
  const [details, setDetails] = useState({});
  const [createWarehouseUser] = useCreateWarehouseUserMutation();
  const [assignWarehouseUser] =  useAssignWarehouseUserMutation();

  const createUser = async (values) => {
    const toastId = toast.loading("User adding please wait...");
    const data = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      password: values.password,
      company_name: values.company_name,
      industry_type: values.industry_type,
      type: values.type,
    };

    try {
      const res = await createWarehouseUser(data).unwrap();
      const assignuser = {
        warehouse_id: 21,
    user_id: res.data.user.id,
      };
      const assignData = await assignWarehouseUser(assignuser).unwrap();
     
      toast.success(res.message, {
        id: toastId,
        duration: 2000,
      });
      
    } catch (error) {
      console.log("Error:", error);
      toast.error(getFirstErrorMessage(error), {
        id: toastId,
        duration: 2000,
      });
     
    }
  };

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    password: "",
    company_name: "",
    industry_type: "A", // Default industry type
    type: "owner", // Default user type
  };

  return (
    <div className="p-5">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Create New User For This Warehouse</h2>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <Formik
            initialValues={initialValues}
            onSubmit={createUser}
            enableReinitialize
          >
            {({ dirty, isSubmitting }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormikInput name="name" label="Name" />
                  <FormikInput name="email" label="Email" />
                  <FormikInput name="phone" label="Phone" />
                  <FormikInput name="password" label="Password" type="password" />
                  <FormikInput name="company_name" label="Company Name" />
                  <FormikInput name="industry_type" label="Industry Type" />
                  <FormikInput name="type" label="User Type" />
                </div>

                {/* Submit Button */}
                {dirty && !isSubmitting && (
                  <CustomButton
                    label="Create User"
                    type="submit"
                    size="lg"
                    className="mt-8 w-full"
                  />
                )}
              </Form>
            )}
          </Formik>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Warehouse Users</h2>
        <CustomTable tableHead={tableHead}>
          {data?.data?.map((item) => (
            <tr key={item?.id}>
              <td className="px-5 py-3 border">{item?.user.name}</td>
              <td className="px-5 py-3 border">{item?.user.email}</td>
              <td className="px-5 py-3 border">{item?.user.phone}</td>
              <td className="px-5 py-3 border">{item?.user.type}</td>
            </tr>
          ))}
        </CustomTable>
      </div>
    </div>
  );
};

export default WarehouseUser;
