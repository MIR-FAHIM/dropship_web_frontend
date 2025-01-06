import { useParams } from "react-router-dom";

const OrderDetails = () => {
  const { id } = useParams();
  return (
    <div>
      <p>Hello OrderDetails: {id}</p>
    </div>
  );
};

export default OrderDetails;
