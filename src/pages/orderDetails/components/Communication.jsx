import TabHeading from "../../../components/shared/TabHeading";
import { useGetNotesByReqQuery } from "../../../redux/features/communication";
import { format, parseISO } from "date-fns";

const Communication = ({details }) => {
 const { data, isLoading, error } = useGetNotesByReqQuery(details?.order.request_id); // Fetch logs using the API
 
   // If data is loading, show loading message
   if (isLoading) {
     return <p>Loading notes...</p>;
   }
 
   // If there is an error fetching logs, show error message
   if (error) {
     return <p>Error fetching notes: {error.message}</p>;
   }
 
   return (
     <div>
       <h2 className="text-xl font-semibold mb-4">Communications</h2>
      
       <table className="min-w-full table-auto border-collapse border border-gray-300">
         <thead>
           <tr>
             <th className="border p-2">ID</th>
             <th className="border p-2">Title</th>
             
             <th className="border p-2">Message</th>
             <th className="border p-2">User Type</th>
             <th className="border p-2">Name</th>
             <th className="border p-2">Time</th>
           </tr>
         </thead>
         <tbody>
           {/* Check if logs data is available */}
           {data?.data.map((log) => (
             <tr key={log.id}>
               <td className="border p-2">{log.id}</td>
               <td className="border p-2">{log.title}</td>
               <td className="border p-2">{log.notes}</td>
               <td className="border p-2">{log.type}</td>
               <td className="border p-2">{log.creator_name}</td>
               <td className="border p-2">
                 {log.created_at
                   ? format(parseISO(log.created_at), "dd-MMM-yyyy, hh:mm a")
                   : "N/A"} {/* Format the created_at date */}
               </td>
             </tr>
           ))}
         </tbody>
       </table>
     </div>
   );
};

export default Communication;
