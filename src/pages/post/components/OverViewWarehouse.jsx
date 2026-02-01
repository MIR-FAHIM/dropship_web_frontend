import { useGetWarehouseByIdQuery } from "../../../redux/features/warehouse";
import Loader from "../../../components/shared/Loader";
import { TbCurrencyTaka } from "react-icons/tb";
import { FaWarehouse, FaUserAlt, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";

const OverViewWarehouse = ({ id }) => {
  const { data, isLoading } = useGetWarehouseByIdQuery(id);

  if (isLoading) {
    return <Loader />;
  }

  const warehouse = data?.data;

  return (
    <div className="p-5 font-plex space-y-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-blue-100 p-5 rounded-md shadow-sm flex items-center space-x-4">
        <FaWarehouse className="text-blue-500 text-3xl" />
        <div>
          <h1 className="text-xl font-semibold">{warehouse?.name}</h1>
          <p className="text-sm text-gray-700">{warehouse?.district}, {warehouse?.area}</p>
        </div>
      </div>

      {/* Warehouse Details */}
      <div className="bg-white p-6 rounded-md shadow-sm space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Warehouse Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <p>
            <span className="font-medium">Size:</span> {warehouse?.size} sq ft
          </p>
          <p>
            <span className="font-medium">Grid Price per Day:</span> 
            <TbCurrencyTaka className="inline-block text-lg text-green-500" /> {warehouse?.grid_price_per_day}
          </p>
          <p>
            <span className="font-medium">Status:</span> 
            <span className={`ml-2 px-2 py-1 rounded ${warehouse?.is_active === "1" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
              {warehouse?.is_active === "1" ? "Active" : "Inactive"}
            </span>
          </p>
          <p>
            <span className="font-medium">Type:</span> {warehouse?.warehouse_type?.type_name}
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white p-6 rounded-md shadow-sm space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Contact Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <FaUserAlt className="text-gray-600" />
            <p>
              <span className="font-medium">Owner:</span> {warehouse?.owner_name}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <FaPhoneAlt className="text-gray-600" />
            <p>
              <span className="font-medium">Phone:</span> {warehouse?.owner_phone}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <FaUserAlt className="text-gray-600" />
            <p>
              <span className="font-medium">Contact Person:</span> {warehouse?.contact_person}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <FaPhoneAlt className="text-gray-600" />
            <p>
              <span className="font-medium">Contact Phone:</span> {warehouse?.contact_phone}
            </p>
          </div>
        </div>
      </div>

      {/* Grids Overview */}
      <div className="bg-white p-6 rounded-md shadow-sm space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Grid Overview</h2>
        <div className="grid grid-cols-2 gap-4">
          <p>
            <span className="font-medium">Total Grids:</span> {warehouse?.total_grids}
          </p>
          <p>
            <span className="font-medium">Occupied Grids:</span> Calculated dynamically
          </p>
          <p>
            <span className="font-medium">Free Grids:</span> Calculated dynamically
          </p>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white p-6 rounded-md shadow-sm space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Location</h2>
        <div className="flex items-center space-x-2">
          <FaMapMarkerAlt className="text-red-500" />
          <p>
            Latitude: {warehouse?.latitude}, Longitude: {warehouse?.longitude}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OverViewWarehouse;
