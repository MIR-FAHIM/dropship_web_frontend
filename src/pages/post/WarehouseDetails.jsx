
import WarehouseUser from "./components/CreateEmpoloyee";
import OverViewWarehouse from "./components/OverViewWarehouse";
import WarehouseGrid from "./components/WarehouseGrid";
import { useParams } from "react-router-dom";
import { Tabs, TabsHeader, TabsBody, Tab, TabPanel } from "@material-tailwind/react";
const WarehouseDetails = () => {
    const { id } = useParams();
    const data = [
      {
        label: "Overview",
        value: "dispatchItem",
        content: (
            <OverViewWarehouse
            id={id}
            />
        ),
      },
      {
        label: "Conecern Persons",
        value: "deliveryItems",
        content: (
            <WarehouseUser
            id={id}
            />
          ),
      },
      {
        label: "Grids",
        value: "delivered",
        content: (
            <WarehouseGrid
            id={id}
            />
        ),
      },
      {
        label: "Notes",
        value: "payment",
        content: (
          <div className="p-4">
            <h2 className="text-xl font-semibold">Note Content</h2>
            <p>Upcoming.</p>
          </div>
        ),
      },
    ];
  
    return (
      <div className="max-w-4xl mx-auto">
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

export default WarehouseDetails;
