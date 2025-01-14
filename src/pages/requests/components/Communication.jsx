import { toast } from "sonner";
import FormikForm from "../../../components/formik/FormikForm";
import FormikInput from "../../../components/formik/FormikInput";
import CustomButton from "../../../components/ui/CustomButton";
import {
  useCreateNoteMutation,
  useGetNotesByReqQuery,
} from "../../../redux/features/communication";
import { format, parseISO } from "date-fns";
import { getFirstErrorMessage } from "../../../utils/error.utils";
import Loader from "../../../components/shared/Loader";

const Communication = ({ details }) => {
  const { data, isLoading, error } = useGetNotesByReqQuery(
    details?.order_request?.id
  );
  const [createNoteFn] = useCreateNoteMutation();

  // If data is loading, show loading message
  if (isLoading) {
    return <Loader />;
  }

  // If there is an error fetching logs, show error message
  if (error) {
    return <p>Error fetching notes: {error.message}</p>;
  }

  const handleCreateNote = async (values) => {
    const toastId = toast.loading("Note creating please wait...");
    const data = {
      title: values?.title,
      notes: values?.notes,
      request_id: details?.order_request?.id,
      type: "admin",
    };
    const formdata = new FormData();
    Object.keys(data).forEach((key) => {
      formdata.append(key, data[key]);
    });
    try {
      const res = await createNoteFn(formdata).unwrap();
      toast.success(res.message, {
        id: toastId,
        duration: 2000,
      });
    } catch (error) {
      console.log("error:", error);
      toast.error(getFirstErrorMessage(error), {
        id: toastId,
        duration: 2000,
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold">Communications</h2>

      <div className="mb-10 mt-5 border rounded-md p-5">
        <FormikForm
          onSubmit={handleCreateNote}
          initialValues={{ title: "", notes: "" }}
        >
          <FormikInput name="title" label={"Title"} />
          <FormikInput name="notes" label={"Notes"} />
          <CustomButton label="Submit" type="submit" />
        </FormikForm>
      </div>

      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Title</th>

            <th className="border p-2">Message</th>
            <th className="border p-2">User Type</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {/* Check if logs data is available */}
          {data?.data.map((log) => (
            <tr key={log.id}>
              <td className="border p-2">{log.id}</td>
              <td className="border p-2">{log.title}</td>
              <td className="border p-2">{log.notes}</td>
              <td className="border p-2">{log.type}</td>
              <td className="border p-2">{log.creator_name}</td>
              <td className="border p-2">
                {log.created_at
                  ? format(parseISO(log.created_at), "dd-MMM-yyyy, hh:mm a")
                  : "N/A"}{" "}
                {/* Format the created_at date */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Communication;
