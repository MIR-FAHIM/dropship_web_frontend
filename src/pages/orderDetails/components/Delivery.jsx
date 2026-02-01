import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import Delivered from "./DManagement/Delivered";
import ItemDispatch from "./DManagement/ItemDispatch";
import RequestedItemDelivery from "./DManagement/RequestedItemDelivery";
import Payment from "./DManagement/Payment";

const Delivery = ({ details }) => {
  const data = [
    {
      label: "Dispatch Item",
      value: "dispatchItem",
      content: (
        <ItemDispatch
          details={details?.order?.request?.assigned_grids}
          request={details?.order}
        />
      ),
    },
    {
      label: "Delivery Items",
      value: "deliveryItems",
      content: <RequestedItemDelivery details={details} />,
    },
    {
      label: "Delivered",
      value: "delivered",
      content: <Delivered details={details} />,
    },
    {
      label: "Payment",
      value: "payment",
      content: <Payment />,
    },
  ];
  return (
    <div>
      <Tabs value="delivered">
        <TabsHeader>
          {data.map(({ label, value }) => (
            <Tab key={value} value={value}>
              {label}
            </Tab>
          ))}
        </TabsHeader>
        <TabsBody>
          {data.map(({ value, content }) => (
            <TabPanel key={value} value={value}>
              {content}
            </TabPanel>
          ))}
        </TabsBody>
      </Tabs>
    </div>
  );
};

export default Delivery;
