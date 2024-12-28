const TabHeading = ({ title, subTitle }) => {
  return (
    <div className="mb-8">
      <h2 className="text-text-100 text-lg font-semibold mb-[10px]">{title}</h2>
      <h4 className="text-text-300 text-base">{subTitle}</h4>
    </div>
  );
};

export default TabHeading;
