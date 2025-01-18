import { useGetAllOverviewQuery } from "../../redux/features/overview";
import Loader from "../../components/shared/Loader";
import { TbCurrencyTaka } from "react-icons/tb";

const Overview = () => {
  const { data, isLoading } = useGetAllOverviewQuery();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="font-plex p-5 space-y-5">
        {/* grids */}
        <h2 className="text-2xl font-semibold">Grids</h2>
        <div className="grid grid-cols-3 gap-5">
          <div className="overview-card bg-green-100">
            <h3 className="overview-card-title">Total Grids</h3>
            <p className="overview-card-value">
              {data?.grid_stats?.free_grids}
            </p>
          </div>
          <div className="overview-card bg-yellow-100">
            <h3 className="overview-card-title">Occupied Grids</h3>
            <p className="overview-card-value">
              {data?.grid_stats?.occupied_grids}
            </p>
          </div>
          <div className="overview-card bg-blue-100">
            <h3 className="overview-card-title">Free Grids</h3>
            <p className="overview-card-value">
              {data?.grid_stats?.total_grids}
            </p>
          </div>
        </div>
        {/* warehouse */}
        <h2 className="text-2xl font-semibold">Warehouse</h2>
        <div className="grid grid-cols-3 gap-5">
          <div className="overview-card bg-[#e5c3c6]">
            <h3 className="overview-card-title">Total Warehouses</h3>
            <p className="overview-card-value">
              {data?.warehouse_stats?.active_warehouses}
            </p>
          </div>
          <div className="overview-card bg-[#e1e9b7]">
            <h3 className="overview-card-title">Active Warehouses</h3>
            <p className="overview-card-value">
              {data?.warehouse_stats?.inactive_warehouses}
            </p>
          </div>
          <div className="overview-card bg-[#9bedff]">
            <h3 className="overview-card-title">Inactive Warehouses</h3>
            <p className="overview-card-value">
              {data?.warehouse_stats?.total_warehouses}
            </p>
          </div>
        </div>
        {/* Billing */}
        <h2 className="text-2xl font-semibold">Billing</h2>
        <div className="grid grid-cols-3 gap-5">
          <div className="overview-card bg-[#bcd2d0]">
            <h3 className="overview-card-title">Total Payments</h3>
            <p className="overview-card-value">
              {data?.payment_stats?.total_payments}
            </p>
          </div>
          <div className="overview-card bg-[#d8f55d]">
            <h3 className="overview-card-title">Total Payment Amount</h3>
            <p className="overview-card-value flex items-center">
              <TbCurrencyTaka />{" "}
              {Number(data?.payment_stats?.total_amount || 0).toFixed(2)}
            </p>
          </div>
          <div className="overview-card bg-[#ffdab9]">
            <h3 className="overview-card-title">Total Transactions</h3>
            <p className="overview-card-value">
              {data?.transaction_stats?.total_transactions}
            </p>
          </div>
          <div className="overview-card bg-[#fdbcb4]">
            <h3 className="overview-card-title">Total Transaction Amount</h3>
            <p className="overview-card-value flex items-center">
              <TbCurrencyTaka /> {data?.transaction_stats?.total_amount}
            </p>
          </div>
        </div>
        {/* Clients */}
        <h2 className="text-2xl font-semibold">Clients</h2>
        <div className="grid grid-cols-3 gap-5">
          <div className="overview-card bg-[#ffda8b]">
            <h3 className="overview-card-title">Total Clients</h3>
            <p className="overview-card-value">
              {data?.client_stats?.total_clients}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Overview;
