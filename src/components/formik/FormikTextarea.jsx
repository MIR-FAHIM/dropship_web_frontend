import PropTypes from "prop-types";
import { Textarea } from "@material-tailwind/react";
import { ErrorMessage, Field } from "formik";

const FormikTextarea = ({ name, label, required = false }) => {
  return (
    <div>
      <Field name={name}>
        {({ field }) => (
          <Textarea
            {...field}
            variant="standard"
            label={label}
            placeholder={label}
            required={required}
            id={name}
          />
        )}
      </Field>
      <ErrorMessage name={name} component="p" className="text-danger" />
    </div>
  );
};

FormikTextarea.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  required: PropTypes.bool,
};

FormikTextarea.defaultProps = {
  label: "",
  required: false,
};

export default FormikTextarea;
