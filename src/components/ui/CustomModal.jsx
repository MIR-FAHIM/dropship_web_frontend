import PropTypes from "prop-types";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

const CustomModal = ({
  title,
  open = false,
  setOpen,
  footer = false,
  scroll = false,
  onClick,
  children,
}) => {
  const handleOpen = () => setOpen(!open);

  return (
    <div>
      <Dialog open={open} handler={handleOpen}>
        {title && <DialogHeader className="px-5">{title}</DialogHeader>}
        <DialogBody
          className={`${scroll ? "max-h-[95vh] overflow-y-scroll" : ""} p-5`}
        >
          {children}
        </DialogBody>
        {footer && (
          <DialogFooter>
            <Button
              variant="gradient"
              color="red"
              onClick={handleOpen}
              className="mr-3"
            >
              <span>Cancel</span>
            </Button>
            <Button
              variant="gradient"
              color="green"
              type="submit"
              onClick={onClick}
            >
              <span>Confirm</span>
            </Button>
          </DialogFooter>
        )}
      </Dialog>
    </div>
  );
};

CustomModal.propTypes = {
  title: PropTypes.string,
  onClick: PropTypes.func,
  setOpen: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  footer: PropTypes.bool,
  scroll: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default CustomModal;
