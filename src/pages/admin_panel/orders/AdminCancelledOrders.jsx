import AdminOrders from "./AdminOrders";

// Cancelled orders (status 7) are kept off the main order list; this page shows
// only them, using the same list UI without status tabs or bulk invoice actions.
const AdminCancelledOrders = () => <AdminOrders cancelledOnly />;

export default AdminCancelledOrders;
