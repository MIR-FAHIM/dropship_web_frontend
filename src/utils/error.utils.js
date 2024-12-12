// format:
// {
//     "status": 422,
//     "data": {
//         "error": "Validation failed",
//         "messages": {
//             "email": [
//                 "The email has already been taken."
//             ],
//             "phone": [
//                 "The phone has already been taken."
//             ]
//         }
//     }
// }
export const getFirstErrorMessage = (error) => {
  const errorMessages = error?.data?.messages || error?.data?.message;

  if (errorMessages) {
    const firstErrorKey = Object.keys(errorMessages)[0];
    return errorMessages[firstErrorKey]?.[0] || "An unknown error occurred!";
  }

  return "Something went wrong!";
};
