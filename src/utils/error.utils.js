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
// {
//   "status": 422,
//   "data": {
//       "success": false,
//       "status": 422,
//       "message": "Validation failed",
//       "data": null,
//       "errors": {
//           "password": [
//               "The password field must be at least 8 characters."
//           ]
//       }
//   }
// }
export const getFirstErrorMessage = (error) => {
  if (!error?.data) return "Something went wrong!";

  // Check for the first format
  const messages = error.data.messages || error.data.errors;
  if (messages && typeof messages === "object") {
    const firstErrorKey = Object.keys(messages)[0];
    return messages[firstErrorKey]?.[0] || "An unknown error occurred!";
  }

  // If no errors, return the generic message
  return error.data.message || "Something went wrong!";
};
