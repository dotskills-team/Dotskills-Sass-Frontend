import { baseApi } from "@/store/api/base-api";
import { normalizeItemsEnvelope, type ListResult } from "@/types/list-result";
import type { Notification } from "@/types/notification";

export interface ListNotificationsParams {
  companyId: string;
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

/** `companies/:companyId/notifications` — Owner/Admin only (NOTIFICATION_READ). */
export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listNotifications: builder.query<ListResult<Notification>, ListNotificationsParams>({
      query: ({ companyId, page, limit, unreadOnly }) => ({
        url: `/companies/${companyId}/notifications`,
        params: { page, limit, unreadOnly },
      }),
      transformResponse: (response: { data: Notification[]; pagination: ListResult<Notification>["meta"] }) =>
        normalizeItemsEnvelope({ items: response.data, meta: response.pagination! }),
      providesTags: ["Notification", "CompanyScoped"],
    }),

    getUnreadNotificationCount: builder.query<number, string>({
      query: (companyId) => `/companies/${companyId}/notifications/unread-count`,
      transformResponse: (response: { data: { count: number } }) => response.data.count,
      providesTags: ["Notification", "CompanyScoped"],
    }),

    markNotificationRead: builder.mutation<Notification, { companyId: string; id: string }>({
      query: ({ companyId, id }) => ({
        url: `/companies/${companyId}/notifications/${id}/read`,
        method: "PATCH",
      }),
      transformResponse: (response: { data: Notification }) => response.data,
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useListNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
} = notificationApi;
