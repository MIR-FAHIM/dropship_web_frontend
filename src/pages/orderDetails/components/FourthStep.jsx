import TabHeading from "../../../components/shared/TabHeading";

const FourthStep = ({ files }) => {
  return (
    <div>
      <TabHeading
        title={"Challan Details & Records"}
        subTitle={
          "Track challan information, including issued details and associated items."
        }
      />
      <div>
        <div className="flex flex-col">
          {files?.length > 0 && (
            <div className="mb-5">
              <p>
                <span className="Text-medium">Total files: </span>
                {files?.length}
              </p>
              <div className="flex flex-col">
                {files?.map((item) => (
                  <a
                    key={item?.id}
                    href={
                      "https://adminwarehouse.jayga.io/public/storage/" +
                      item?.file
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 underline"
                  >
                    View/Download
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FourthStep;
