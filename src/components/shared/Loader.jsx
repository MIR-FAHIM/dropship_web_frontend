import { Spinner } from "@material-tailwind/react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <Spinner className="size-14" />
    </div>
  );
};

export default Loader;
