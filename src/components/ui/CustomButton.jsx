import PropTypes from "prop-types";
import { Button } from "@material-tailwind/react";

const CustomButton = ({
  label,
  type = "button",
  variant = "filled",
  disabled = false,
  className,
  onClick,
}) => {
  return (
    <Button
      size="sm"
      disabled={disabled}
      onClick={onClick}
      type={type}
      fullWidth
      variant={variant}
      className={`font-medium ${
        variant === "filled"
          ? "bg-primary hover:bg-primary-500"
          : "text-primary border-primary font-semibold"
      } hover:shadow-none text-base capitalize ${className || ""}`}
    >
      {label}
    </Button>
  );
};

// Add PropTypes for validation
CustomButton.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  variant: PropTypes.oneOf(["outlined", "filled"]),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default CustomButton;
