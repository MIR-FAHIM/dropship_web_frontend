import baseApi from "../../api/baseApi";
import API_ENDPOINTS, { buildEndpointPath } from "../../api/apiEndpoints";

const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addSupportTicket: builder.mutation({
      query: (payload) => {
        const formData = new FormData();
        Object.entries(payload || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            formData.append(key, value);
          }
        });
        return {
          url: API_ENDPOINTS.supportTickets.add.path,
          method: API_ENDPOINTS.supportTickets.add.method,
          body: formData,
        };
      },
      invalidatesTags: ["SupportTickets"],
    }),

    getSupportTicketsByUser: builder.query({
      query: (userId) =>
        buildEndpointPath(API_ENDPOINTS.supportTickets.byUser.path, { userId }),
      providesTags: ["SupportTickets"],
    }),

    editSupportTicket: builder.mutation({
      query: ({ id, ...payload }) => {
        const formData = new FormData();
        Object.entries(payload || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
        return {
          url: buildEndpointPath(API_ENDPOINTS.supportTickets.edit.path, { id }),
          method: API_ENDPOINTS.supportTickets.edit.method,
          body: formData,
        };
      },
      invalidatesTags: ["SupportTickets"],
    }),

    getAllSupportTickets: builder.query({
      query: () => API_ENDPOINTS.supportTickets.all.path,
      providesTags: ["SupportTickets"],
    }),

    changeTicketStatus: builder.mutation({
      query: ({ id, status, admin_note }) => {
        const formData = new FormData();
        formData.append("status", status);
        if (admin_note) formData.append("admin_note", admin_note);
        return {
          url: buildEndpointPath(API_ENDPOINTS.supportTickets.statusChange.path, { id }),
          method: API_ENDPOINTS.supportTickets.statusChange.method,
          body: formData,
        };
      },
      invalidatesTags: ["SupportTickets"],
    }),

  }),
});

export const {
  useAddSupportTicketMutation,
  useGetSupportTicketsByUserQuery,
  useEditSupportTicketMutation,
  useGetAllSupportTicketsQuery,
  useChangeTicketStatusMutation,
} = supportApi;

export default supportApi;
