const SeventhStep = ({ details }) => {
  console.log("details", details);
  const userInfo = details?.order_request?.user;
  return (
    <div>
      <p>Hello SeventhStep</p>
    </div>
  );
};

export default SeventhStep;
