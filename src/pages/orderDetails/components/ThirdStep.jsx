import { format } from "date-fns";
const ThirdStep = ({ details }) => {
  const { start_date, end_date } = details;
  return (
    <div>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <h3 className="text-lg font-medium">Start Date</h3>
          <p>
            {start_date ? format(new Date(start_date), "MMMM dd, yyyy") : "N/A"}
          </p>
        </div>
        <div>
          <h3 className="text-lg font-medium">End Date</h3>
          <p>
            {end_date ? format(new Date(end_date), "MMMM dd, yyyy") : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThirdStep;
