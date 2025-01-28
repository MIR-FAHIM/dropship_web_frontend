import { toast } from "sonner";
import { Form, Formik } from "formik";
import CustomTable from "../../../components/ui/CustomTable";
import { useGetWarehouseUserQuery } from "../../../redux/features/warehouse";
import { useCreateWarehouseUserMutation } from "../../../redux/features/warehouse";
import { useAssignWarehouseUserMutation } from "../../../redux/features/warehouse";
import FormikInput from "../../../components/formik/FormikInput";
import CustomButton from "../../../components/ui/CustomButton";
import { getFirstErrorMessage } from "../../../utils/error.utils";
const tableHead = ["Name", "Email", "Mobile", "Type"];
import FormikDropdown from "../../../components/formik/FormikDropdown";
import { transformArrayOfStringsIntoLabelAndValueArray } from "../../../utils";
import { industryTypes } from "../../../constants";

const WarehouseUser = ({ id }) => {
  const { data, refetch } = useGetWarehouseUserQuery(id);
  const [createWarehouseUser] = useCreateWarehouseUserMutation();
  const [assignWarehouseUser] = useAssignWarehouseUserMutation();

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
      const assignUser = {
        warehouse_id: id,
        user_id: res?.data?.user?.id,
      };
      const assignData = await assignWarehouseUser(assignUser).unwrap();

      const resMessage = `${res.message} && ${assignData.message}`;
      refetch();
      toast.success(resMessage, {
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
    industry_type: "",
    type: "owner",
  };

  return (
    <div className="p-5">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Create New User For This Warehouse
        </h2>

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
                  <FormikInput
                    name="password"
                    label="Password"
                    type="password"
                  />
                  <FormikInput name="company_name" label="Company Name" />
                  <FormikDropdown
                    options={transformArrayOfStringsIntoLabelAndValueArray(
                      industryTypes
                    )}
                    name="industry_type"
                    label="Industry Type"
                  />
                  {/* <FormikInput name="industry_type" label="Industry Type" /> */}
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
