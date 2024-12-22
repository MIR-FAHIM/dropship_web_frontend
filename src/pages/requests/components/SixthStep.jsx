import { useState } from "react";
import { useGetAllWarehouseQuery } from "../../../redux/features/warehouse";
import { Select, Option } from "@material-tailwind/react";
import { Checkbox } from "@material-tailwind/react";
import { useGetGridsByWarehouseIdQuery } from "../../../redux/features/grid";

const SixthStep = () => {
  const { data, isLoading } = useGetAllWarehouseQuery();
  const [warehouseId, setWarehouseId] = useState("");
  const { data: gridData } = useGetGridsByWarehouseIdQuery(warehouseId);
  if (isLoading) {
    return <p>Loading</p>;
  }
  const warehouseOptions = data?.warehouses?.map((item) => ({
    label: item?.district + "-" + item?.area + "-" + item?.location,
    value: String(item?.id),
  }));
  const allGrids = gridData?.grids;
  return (
    <div className="p-5 grid grid-cols-3 gap-5">
      <div className="col-span-2 border-r h-full"></div>
      <div className="space-y-5 col-span-1">
        <Select onChange={(e) => setWarehouseId(e)} label="Select warehouse">
          {warehouseOptions?.map((item) => {
            return (
              <Option key={item?.value} value={item?.value}>
                {item?.label}
              </Option>
            );
          })}
        </Select>
        <div className="grid grid-cols-2">
          {allGrids?.map((item) => {
            return (
              <Checkbox
                key={item?.id}
                id={item?.id}
                label={item?.grid_code}
                ripple={true}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SixthStep;
