import baseApi from "../../api/baseApi";

// Admin dashboard money board: who will give money to whom (CarryBee / vendor / admin / dropshipper) and the admin's final income.
const moneyBoardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMoneyBoard: builder.query({
      query: (params = {}) => ({ url: "/reports/money-board", params }),
    }),
  }),
});

export const { useGetMoneyBoardQuery, useLazyGetMoneyBoardQuery } = moneyBoardApi;
