import TabHeading from "../../../components/shared/TabHeading";

const FirstStep = ({ user }) => {
  return (
    <div>
      <TabHeading
        title={"User Information"}
        subTitle={"Your Profile at a Glance"}
      />
      <div className="grid grid-cols-2 gap-5 font-plex">
        <div>
          <h3 className="text-lg font-medium">Name</h3>
          <p>{user?.name || "N/A"}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium">Phone</h3>
          <p>{user?.phone || "N/A"}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium">Email</h3>
          <p>{user?.email || "N/A"}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium">Address</h3>
          <p>{user?.address || "N/A"}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium">Company Name</h3>
          <p>{user?.company_name || "N/A"}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium">Industry Type</h3>
          <p>{user?.industry_type || "N/A"}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium">Description</h3>
          <p>{user?.description || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};

export default FirstStep;
