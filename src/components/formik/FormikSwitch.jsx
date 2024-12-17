import { Switch } from "@material-tailwind/react";
import { Field } from "formik";

const FormikSwitch = ({ name, label }) => {
  return (
    <div className="flex items-center justify-between">
      <label className="cursor-pointer" htmlFor={name}>
        {label}
      </label>
      <Field name={name}>
        {({ field }) => (
          <Switch
            id={name}
            name={name}
            crossOrigin=""
            checked={field.value}
            onChange={(e) => {
              field.onChange({
                target: { name: field.name, value: e.target.checked },
              });
            }}
            onBlur={field.onBlur}
          />
        )}
      </Field>
    </div>
  );
};

export default FormikSwitch;
