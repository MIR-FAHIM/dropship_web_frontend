import { AlertCircle, CalendarClock, Loader2, Megaphone } from "lucide-react";
import { useGetResellerNoticesQuery } from "../../../redux/features/notice";
import { formatNoticeDate, formatNoticeLabel, getNoticeList, noticePriorityClass } from "../../../utils/notice.utils";

const NoticeCard = ({ notice }) => {
  const priority = String(notice.priority || "normal").toLowerCase();

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-gray-900">{notice.title || "Untitled notice"}</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">{notice.message || "-"}</p>
        </div>
        <span className={`w-fit shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${noticePriorityClass[priority] || noticePriorityClass.normal}`}>
          {formatNoticeLabel(priority)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
        <span className="rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-600">
          {formatNoticeLabel(notice.notice_type || "general")}
        </span>
        {notice.published_at && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
            <CalendarClock className="h-3.5 w-3.5" />
            Published: {formatNoticeDate(notice.published_at)}
          </span>
        )}
        {notice.expires_at && (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 font-semibold text-orange-700">
            <CalendarClock className="h-3.5 w-3.5" />
            Expires: {formatNoticeDate(notice.expires_at)}
          </span>
        )}
      </div>
    </article>
  );
};

const NoticeBoard = () => {
  const { data, isLoading, isFetching, isError, error } = useGetResellerNoticesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const notices = getNoticeList(data);

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="rounded-xl border border-[#BDEAD8] bg-[#E1F5EE] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#CDEFE1] text-[#085041]">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#085041]">Notice Board</h1>
            <p className="text-sm text-[#085041]/70">Latest reseller updates and announcements.</p>
          </div>
        </div>
      </div>

      {isLoading || isFetching ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          {error?.data?.message || "Failed to load notices"}
        </div>
      ) : notices.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-semibold text-gray-500">No notices available</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
