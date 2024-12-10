import PropTypes from "prop-types";
import { Input } from "@material-tailwind/react";
import { ErrorMessage, Field } from "formik";

const FormikInput = ({ name, label, type = "text", required = false }) => {
  return (
    <div>
      <Field name={name}>
        {({ field }) => (
          <Input
            className="px-3"
            {...field}
            type={type}
            variant="standard"
            label={label}
            placeholder={label}
            crossOrigin={undefined}
            required={required}
            id={name}
          />
        )}
      </Field>
      <ErrorMessage name={name} component="p" className="text-danger" />
    </div>
  );
};

FormikInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.string,
  required: PropTypes.bool,
};

FormikInput.defaultProps = {
  label: "",
  type: "text",
  required: false,
};

export default FormikInput;
