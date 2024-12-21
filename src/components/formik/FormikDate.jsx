import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse, format } from "date-fns";
import { Field } from "formik";

const convertToDateObject = (dateString) => {
  return parse(dateString, "dd-MM-yyyy", new Date());
};

const FormikDate = ({ label, name }) => {
  return (
    <div className="mb-4">
      {label && <label className="block mb-2 font-medium">{label}</label>}
      <Field name={name}>
        {({ field, form }) => (
          <DatePicker
            id={name}
            selected={
              field.value ? convertToDateObject(field.value) : new Date()
            }
            onChange={(date) => {
              const formattedDate = date ? format(date, "dd-MM-yyyy") : null;
              form.setFieldValue(name, formattedDate);
            }}
            className="border rounded px-3 py-2"
            dateFormat="dd-MM-yyyy"
          />
        )}
      </Field>
    </div>
  );
};

FormikDate.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
};

FormikDate.defaultProps = {
  label: "",
};

export default FormikDate;
