import { Form, Formik } from "formik";

const FormikForm = ({
  className,
  onSubmit,
  initialValues,
  validationSchema,
  children,
}) => {
  return (
    <div className={className}>
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
      >
        {({ values }) => {
          // console.log(values);
          return <Form className="space-y-5 font-dmSans">{children}</Form>;
        }}
      </Formik>
    </div>
  );
};

export default FormikForm;
