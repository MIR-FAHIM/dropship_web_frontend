import PropTypes from "prop-types";
import { useField, ErrorMessage } from "formik";

const FileUpload = ({
  name,
  placeholder,
  required = false,
  multiple = false,
}) => {
  const [field, , helpers] = useField(name);
  const { value } = field;
  const { setValue } = helpers;

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files) {
      setValue(multiple ? Array.from(files) : files[0]);
    }
  };

  const currentFile =
    typeof value === "string"
      ? "Upload another or don't touch"
      : multiple
      ? `${value?.length || 0} file(s) selected`
      : value?.name || "";

  return (
    <div>
      <div className="flex items-stretch">
        {/* Upload Button */}
        <label
          htmlFor={name}
          className="bg-blue-100 text-black px-4 py-2 rounded-md cursor-pointer font-medium"
        >
          Upload
        </label>

        {/* File Name or Count Display */}
        <input
          placeholder={placeholder}
          type="text"
          className="border-b border-gray-400 w-full px-3 focus-visible:outline-none focus-visible:border-b-2 focus-visible:border-black"
          value={currentFile}
          readOnly
        />

        {/* Hidden File Input */}
        <input
          multiple={multiple}
          required={required}
          className="hidden"
          type="file"
          id={name}
          onChange={handleFileChange}
        />
      </div>

      {/* Error Message */}
      <ErrorMessage name={name} component="p" className="text-danger" />
    </div>
  );
};

FileUpload.propTypes = {
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  multiple: PropTypes.bool,
};

FileUpload.defaultProps = {
  placeholder: "",
  required: false,
  multiple: false,
};

export default FileUpload;
