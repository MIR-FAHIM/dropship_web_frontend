import {
  Popover,
  PopoverContent,
  PopoverHandler,
} from "@material-tailwind/react";
import CustomButton from "./CustomButton";

const CustomPopover = ({ label, icon, children }) => {
  return (
    <div>
      <Popover placement="bottom">
        <PopoverHandler>
          {label ? (
            <CustomButton type="button" variant="outlined" label={label} />
          ) : (
            <button className="bg-gray-100 px-1 py-2 rounded-md">{icon}</button>
          )}
        </PopoverHandler>
        <PopoverContent className="p-2 bg-gray-100">{children}</PopoverContent>
      </Popover>
    </div>
  );
};

export default CustomPopover;
