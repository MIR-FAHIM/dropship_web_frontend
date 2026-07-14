import Activity from "../pages/activity/Activity";
import Payments from "../pages/billing/pages/Payments";
import Transactions from "../pages/billing/pages/Transactions";
import PaymentPage from "../pages/billing/PaymentPage";
import FavProducts from "../pages/favproduct/FavProducts";
import Invoice from "../pages/billing/Invoice/Invoice";
import InvoiceInPDF from "../pages/billing/Invoice/InvoiceInPDF";
import ItemsCategory from "../pages/product/items/Items_category";
import ProfilePage from "../pages/reseller_panel/profile/Profile";
import CartPage from "../pages/reseller_panel/cart/Cart";
import SuccessPage from "../pages/product/items/order_success";
import ProductsList from "../pages/product/items/ProductsList";
import ProductDetails from "../pages/product/items/ProductDetails";
import AdminActivity from "../pages/activity/AdminActivity";
import OrderDetailsPage from "../pages/reseller_panel/orders/OrderDetails";
import Order from "../pages/reseller_panel/orders/Orders";
import Overview from "../pages/reseller_panel/overview/Overview";
import SalesAndProfit from "../pages/billing/saleandprofit/SaleAndProfit";
import Users from "../pages/reseller_panel/supports/SupportTicket";
import FAQPage from "../pages/reseller_panel/supports/GeneralQuestions";
import Post from "../pages/post/Post";
import WarehouseDetails from "../pages/post/WarehouseDetails";
import SalesGuidelines from "../pages/reseller_panel/saleguideline/saleguideline";
import WithdrawPage from "../pages/billing/withdraw/withdraw_req";
import AddPaymentAccount from "../pages/billing/payment_account/add_payment_account";

import ContactUsPage from "../pages/contactus/contact_us_form";
import CheckoutPage from "../pages/checkout/checkout";
import AllProductCategoryTab from "../pages/product/AllProductCategoryTab";
import ProductAssistantPage from "../pages/reseller_panel/product_assistant/product_assistant";
import AllStore from "../pages/reseller_panel/all_store/AllStore";
import StoreProducts from "../pages/reseller_panel/all_store/StoreProducts";
import StoreProfile from "../pages/reseller_panel/store_profile/StoreProfile";

export const pagePaths = [
  { path: "dashboard-new",          element: <Overview /> },
  { path: "dashboard",              element: <Overview /> },
  { path: "saleandprofit",          element: <SalesAndProfit /> },
  { path: "favproducts",            element: <FavProducts /> },
  { path: "order",                  element: <Order /> },
  { path: "contact-us-form",        element: <ContactUsPage /> },
  { path: "orders/invoice/:id",     element: <Invoice /> },
  { path: "billing/paymentpage/:id",element: <PaymentPage /> },
  { path: "payment/invoice-pdf/:id",element: <InvoiceInPDF /> },
  { path: "orders-details/:id",     element: <OrderDetailsPage /> },
  { path: "withdraw",               element: <WithdrawPage /> },
  { path: "warehousedetails/:id",   element: <WarehouseDetails /> },
  { path: "users",                  element: <Users /> },
  { path: "profile",                element: <ProfilePage /> },
  { path: "store-profile",          element: <StoreProfile /> },
  { path: "items/category",         element: <ItemsCategory /> },
  { path: "product-assistant",      element: <ProductAssistantPage /> },
  { path: "cart",                   element: <CartPage /> },
  { path: "checkout",               element: <CheckoutPage /> },
  { path: "productlist/:id",        element: <ProductsList /> },
  { path: "productdetails/:id",     element: <ProductDetails /> },
  { path: "billing",                element: <Payments /> },
  { path: "billing/payments",       element: <Payments /> },
  { path: "adminactivity",          element: <AdminActivity /> },
  { path: "billing/transactions",   element: <Transactions /> },
  { path: "activity",               element: <Activity /> },
  { path: "post",                   element: <Post /> },
  { path: "faq",                    element: <FAQPage /> },
  { path: "order-success",          element: <SuccessPage /> },
  { path: "sale-guide-line",        element: <SalesGuidelines /> },
  { path: "add-payment-account",    element: <AddPaymentAccount /> },
  { path: "all-product-category",   element: <AllProductCategoryTab /> },
  { path: "all-store",              element: <AllStore /> },
  { path: "store-products/:id",     element: <StoreProducts /> },

];
