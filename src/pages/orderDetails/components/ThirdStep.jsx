import TabHeading from "../../../components/shared/TabHeading";
const ThirdStep = ({ details }) => {
  console.log(details);
  const { start_date, end_date } = details;
  return (
    <div>
      <TabHeading
        title={"Duration Details Overview"}
        subTitle={
          "Review start and end dates, timelines, and relevant scheduling information."
        }
      />
      <div className="grid grid-cols-2 gap-5">
        <div>
          <h3 className="text-lg font-medium">Start Date</h3>
          <p>{start_date || "N/A"}</p>
        </div>
        <div>
          <h3 className="text-lg font-medium">End Date</h3>
          <p>{end_date || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};

export default ThirdStep;
