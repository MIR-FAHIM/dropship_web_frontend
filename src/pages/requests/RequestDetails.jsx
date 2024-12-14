import { useParams } from "react-router-dom";
import { useGetOrderRequestByIdQuery } from "../../redux/features/request";

const RequestDetails = () => {
  const { id } = useParams();
  const { data } = useGetOrderRequestByIdQuery(id);
  console.log(data);
  return (
    <div>
      <p>Request details of: {id} </p>
    </div>
  );
};

export default RequestDetails;
