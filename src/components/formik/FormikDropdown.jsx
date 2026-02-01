import PropTypes from "prop-types";
import { Option, Select } from "@material-tailwind/react";
import { ErrorMessage, Field } from "formik";

const FormikDropdown = ({ name, label, options }) => {
  return (
    <div>
      <Field name={name}>
        {({ field, form }) => (
          <Select
            variant="standard"
            label={label}
            value={field.value}
            onChange={(e) => form.setFieldValue(name, e)}
          >
            {options?.map((item) => (
              <Option key={item.value} value={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
        )}
      </Field>
      <ErrorMessage name={name} component="p" className="text-danger" />
    </div>
  );
};

FormikDropdown.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
};

FormikDropdown.defaultProps = {
  label: "",
  options: [],
};

export default FormikDropdown;
