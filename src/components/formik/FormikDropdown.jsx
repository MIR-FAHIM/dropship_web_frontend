import PropTypes from "prop-types";
import { Chip } from "@material-tailwind/react";
import { ErrorMessage, Field } from "formik";

const FormikDropdown = ({ name, label, options, onChange, disabled }) => {
  return (
    <div>
      {label && <div className="mb-1 text-sm font-medium text-gray-700">{label}</div>}
      <Field name={name}>
        {({ field, form }) => (
          <div className="flex flex-wrap gap-2">
            {options?.map((item) => {
              const selected = field.value === item.value;
              return (
                <button
                  type="button"
                  key={item.value}
                  className={`focus:outline-none ${selected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"} px-3 py-1 rounded-full border border-gray-200 text-sm transition`}
                  onClick={() => {
                    if (disabled) return;
                    form.setFieldValue(name, item.value);
                    if (onChange) onChange(item.value, form);
                  }}
                  disabled={disabled}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </Field>
      <ErrorMessage name={name} component="p" className="text-danger mt-1" />
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
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

FormikDropdown.defaultProps = {
  label: "",
  options: [],
  onChange: undefined,
  disabled: false,
};

export default FormikDropdown;
