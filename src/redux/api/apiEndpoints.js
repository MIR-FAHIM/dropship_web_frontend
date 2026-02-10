// Centralized API endpoint definitions derived from backend routes.php
// Base URL is configured in baseApi.js as `${imgBaseUrl}/api`

const define = (method, path) => ({ method, path });

export const API_ENDPOINTS = {
  auth: {
    login: define("POST", "/auth/login"),
    logout: define("POST", "/auth/logout"),
    listTokens: define("GET", "/auth/tokens"),
    revokeToken: define("DELETE", "/auth/tokens/{id}"),
  },

  users: {
    create: define("POST", "/users/create"),
    list: define("GET", "/users/list"),
    customers: define("GET", "/users/customers"),
    vendors: define("GET", "/users/vendors"),
    deliveryMen: define("GET", "/users/delivery-men"),
    details: define("GET", "/users/details/{id}"),
    update: define("PUT", "/users/update/{id}"),
    ban: define("PATCH", "/users/ban/{id}"),
    unban: define("PATCH", "/users/unban/{id}"),
    delete: define("DELETE", "/users/delete/{id}"),
  },

  categories: {
    create: define("POST", "/categories/create"),
    list: define("GET", "/categories/list"),
    listWithChildren: define("GET", "/categories/with-children"),
    details: define("GET", "/categories/details/{id}"),
    children: define("GET", "/categories/children/{id}"),
    update: define("PUT", "/categories/update/{id}"),
    delete: define("DELETE", "/categories/delete/{id}"),
  },

  brands: {
    create: define("POST", "/brands/create"),
    list: define("GET", "/brands/list"),
    details: define("GET", "/brands/details/{id}"),
    update: define("PUT", "/brands/update/{id}"),
    delete: define("DELETE", "/brands/delete/{id}"),
  },

  products: {
    create: define("POST", "/products/create"),
    imageUpload: define("POST", "/products/images/upload/{productId}"),
    list: define("GET", "/products/list"),
    categoryWise: define("GET", "/products/category/wise"),
    listFeatured: define("GET", "/products/list/featured"),
    listTodayDeal: define("GET", "/products/list/today-deal"),
    details: define("GET", "/products/details/{id}"),
    update: define("POST", "/products/update/{id}"),
    delete: define("DELETE", "/products/delete/{id}"),
    addImage: define("POST", "/products/images/add/{id}"),
    deleteImage: define("DELETE", "/products/images/delete/{imageId}"),
  },

  shops: {
    create: define("POST", "/shops/create"),
    list: define("GET", "/shops/list"),
    details: define("GET", "/shops/details/{id}"),
    products: define("GET", "/shops/products/{id}"),
    update: define("POST", "/shops/update/{id}"),
    updateStatus: define("PATCH", "/shops/status/{id}"),
    delete: define("DELETE", "/shops/delete/{id}"),
  },

  carts: {
    active: define("GET", "/carts/active/{userId}"),
    addItem: define("POST", "/carts/items/add"),
    updateItemQty: define("PUT", "/carts/items/update/{itemId}"),
    removeItem: define("DELETE", "/carts/items/delete/{itemId}"),
    clear: define("DELETE", "/carts/clear/{userId}"),
  },

  orders: {
    checkout: define("POST", "/orders/checkout"),
    listByUser: define("GET", "/orders/list/{userId}"),
    allOrders: define("GET", "/orders/all/orders"),
    completed: define("GET", "/orders/completed"),
    completedByUser: define("GET", "/orders/completed/{userId}"),
    details: define("GET", "/orders/details/{id}"),
    updateStatus: define("PATCH", "/orders/status/{id}"),
    updateItemStatus: define("PATCH", "/orders/item/status/{id}"),
  },

  addresses: {
    add: define("POST", "/addresses/add"),
    byUser: define("GET", "/addresses/user/{userId}"),
    delete: define("DELETE", "/addresses/delete/{id}"),
    inactive: define("PATCH", "/addresses/inactive/{id}"),
    update: define("PUT", "/addresses/update/{id}"),
  },

  wishlists: {
    add: define("POST", "/wishlists/add"),
    list: define("GET", "/wishlists/list/{userId}"),
    delete: define("DELETE", "/wishlists/delete/{id}"),
  },

  relatedProducts: {
    add: define("POST", "/related-products/add"),
    list: define("GET", "/related-products/list/{productId}"),
    remove: define("DELETE", "/related-products/remove/{id}"),
  },

  reviews: {
    add: define("POST", "/reviews/add"),
    list: define("GET", "/reviews/list"),
    byProduct: define("GET", "/reviews/product/{productId}"),
    byUser: define("GET", "/reviews/user/{userId}"),
    updateByUser: define("PUT", "/reviews/update-by-user/{id}"),
    remove: define("DELETE", "/reviews/remove/{id}"),
  },

  banners: {
    add: define("POST", "/banners/add"),
    active: define("GET", "/banners/active"),
    remove: define("DELETE", "/banners/remove/{id}"),
  },

  attributes: {
    create: define("POST", "/attributes/create"),
    list: define("GET", "/attributes/list"),
    details: define("GET", "/attributes/details/{id}"),
    update: define("PUT", "/attributes/update/{id}"),
    delete: define("DELETE", "/attributes/delete/{id}"),
    valuesCreate: define("POST", "/attributes/values/create"),
    valuesUpdate: define("PUT", "/attributes/values/update/{id}"),
    valuesDelete: define("DELETE", "/attributes/values/delete/{id}"),
  },

  productAttributes: {
    create: define("POST", "/product-attributes/create"),
    list: define("GET", "/product-attributes/list"),
    details: define("GET", "/product-attributes/details/{id}"),
    update: define("PUT", "/product-attributes/update/{id}"),
    delete: define("DELETE", "/product-attributes/delete/{id}"),
  },

  reports: {
    dashboard: define("GET", "/reports/dashboard"),
  },

  productDiscounts: {
    create: define("POST", "/product-discounts/create"),
    list: define("GET", "/product-discounts/list"),
    details: define("GET", "/product-discounts/details/{id}"),
    update: define("PUT", "/product-discounts/update/{id}"),
    delete: define("DELETE", "/product-discounts/delete/{id}"),
  },

  uploads: {
    image: define("POST", "/uploads/image"),
    list: define("GET", "/uploads/list"),
    get: define("GET", "/uploads/{id}"),
    delete: define("DELETE", "/uploads/{id}"),
  },

  deliveries: {
    assign: define("POST", "/deliveries/assign"),
    unassign: define("POST", "/deliveries/unassign"),
    allByDeliveryMan: define("GET", "/deliveries/all/{deliveryManId}"),
    assignedByDeliveryMan: define("GET", "/deliveries/assigned/{deliveryManId}"),
    completedByDeliveryMan: define("GET", "/deliveries/completed/{deliveryManId}"),
  },

  transactions: {
    credit: define("GET", "/transactions/credit"),
    debit: define("GET", "/transactions/debit"),
    report: define("GET", "/transactions/report"),
  },
};

export const buildEndpointPath = (template, params = {}) =>
  template.replace(/\{(\w+)\}/g, (_, key) =>
    params[key] === undefined ? `{${key}}` : encodeURIComponent(params[key])
  );

export default API_ENDPOINTS;
