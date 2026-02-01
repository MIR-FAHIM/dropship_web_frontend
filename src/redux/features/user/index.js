import baseApi from "../../api/baseApi";

const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (userInfo) => ({
        url: "/admin/login",
        method: "POST",
        body: userInfo,
      }),
    }),
    
    buttonClick: builder.mutation({
      query: (data) => ({
        url: "/click-button-visit",
        method: "POST",
        body: {'button_name': data,}
      }),
    }),
    addContact: builder.mutation({
      query: (data) => ({
        url: "/add-queries",
        method: "POST",
        body: data
      }),
    }),
  }),
  
});

export const {

  useLoginMutation,
  useButtonClickMutation,
  useAddContactMutation,
 
} = userApi;

export default userApi;


