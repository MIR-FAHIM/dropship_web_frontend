import { Button } from "@material-tailwind/react";
import FormikForm from "../../components/formik/FormikForm";
import FormikInput from "../../components/formik/FormikInput";
import { useLoginMutation } from "../../redux/features/user";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setToken } from "../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { saveToLocalstorage } from "../../utils/localstorage.utils";

const initialValues = {
  email: "jayga@gmail.com",
  password: "12345678",
};

const Login = () => {
  const [loginFunc] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogin = async (values) => {
    const toastId = toast.loading("Login processing!");
    try {
      const res = await loginFunc(values).unwrap();
      toast.success(res?.message, { id: toastId, duration: 2000 });
      dispatch(setToken({ token: res?.token }));
      saveToLocalstorage("token", res?.token);
      navigate("/");
    } catch (error) {
      console.log("error:", error);
      toast.error(error.data.message, { id: toastId, duration: 2000 });
    }
  };
  return (
    <div className="flex border h-screen items-center justify-center bg-gray-100">
      <FormikForm
        initialValues={initialValues}
        onSubmit={handleLogin}
        className="w-1/3 bg-white p-10 rounded-lg shadow-lg"
      >
        <h3 className="text-center text-2xl font-bold text-gray-800">Login</h3>
        <FormikInput name="email" type="email" label="Email" />
        <FormikInput name="password" type="password" label="Password" />
        <Button type="submit" fullWidth>
          Login
        </Button>
      </FormikForm>
    </div>
  );
};

export default Login;
