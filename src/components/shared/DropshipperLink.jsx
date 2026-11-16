import { Link } from "react-router-dom";

export const dropshipperDetailsPath = (id) => `/admin-panel/dropshippers/${id}`;

/**
 * Dropshipper name that opens the admin dropshipper details page.
 * Falls back to plain text when there is no id, or when userType says it is not a dropshipper.
 * Stops the click from reaching clickable rows (e.g. a ticket row that opens a panel).
 */
const DropshipperLink = ({ id, userType, children, className = "", title }) => {
  const isDropshipper = !userType || String(userType).toLowerCase() === "dropshipper";
  if (!id || !isDropshipper) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      to={dropshipperDetailsPath(id)}
      onClick={(e) => e.stopPropagation()}
      title={title || "ড্রপশিপারের বিস্তারিত দেখুন"}
      className={`hover:text-blue-700 hover:underline ${className}`}
    >
      {children}
    </Link>
  );
};

export default DropshipperLink;
