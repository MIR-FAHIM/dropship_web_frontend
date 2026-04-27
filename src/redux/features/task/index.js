import baseApi from "../../api/baseApi";
import { API_ENDPOINTS } from "../../api/apiEndpoints";

const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTaskList: builder.query({
      query: (page = 1) => ({
        url: API_ENDPOINTS.tasks.list.path,
        params: { page },
      }),
      providesTags: ["Tasks"],
    }),

    createTask: builder.mutation({
      query: (formData) => ({
        url: API_ENDPOINTS.tasks.create.path,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Tasks"],
    }),
    assignTask: builder.mutation({
      query: (formData) => ({
        url: API_ENDPOINTS.tasks.assign.path,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Tasks"],
    }),

    updateTaskStatus: builder.mutation({
      query: ({ id, status_id }) => ({
        url: API_ENDPOINTS.tasks.updateStatus.path.replace("{id}", id),
        method: "PATCH",
        params: { status_id },
      }),
      invalidatesTags: ["Tasks"],
    }),

    getTaskStatusList: builder.query({
      query: () => API_ENDPOINTS.tasks.statusList.path,
    }),

    getTaskTypeList: builder.query({
      query: () => API_ENDPOINTS.taskTypes.list.path,
    }),
    getTaskDetails: builder.query({
      query: (id) => API_ENDPOINTS.tasks.details.path.replace("{id}", id),
    }),

    getTaskPriorityList: builder.query({
      query: () => API_ENDPOINTS.taskPriorities.list.path,
    }),
  }),
});

export const {
  useGetTaskListQuery,
  useAssignTaskMutation,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useGetTaskStatusListQuery,
  useGetTaskTypeListQuery,
  useGetTaskPriorityListQuery,
  useGetTaskDetailsQuery,
} = taskApi;

export default taskApi;
