import { Button, IconButton } from "@material-tailwind/react";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set([
      1,
      totalPages,
      currentPage,
      Math.max(1, currentPage - 1),
      Math.min(totalPages, currentPage + 1),
    ]);

    return Array.from(pages)
      .sort((a, b) => a - b)
      .reduce((items, page, index, sortedPages) => {
        if (index > 0 && page - sortedPages[index - 1] > 1) {
          items.push(`ellipsis-${page}`);
        }
        items.push(page);
        return items;
      }, []);
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handlePageClick = (page) => {
    onPageChange(page);
  };

  return (
    <div className="flex w-full max-w-full flex-wrap items-center justify-center gap-2 mt-4 overflow-hidden">
      <Button
        variant="text"
        className="flex shrink-0 items-center gap-1 px-2 py-2 text-xs sm:gap-2 sm:px-3 sm:text-sm"
        onClick={handlePrev}
        disabled={currentPage === 1}
      >
        <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" /> Previous
      </Button>
      <div className="flex min-w-0 flex-wrap items-center justify-center gap-1 sm:gap-2">
        {getVisiblePages().map((page) =>
          typeof page === "number" ? (
            <IconButton
              key={page}
              variant={currentPage === page ? "filled" : "text"}
              color="gray"
              className="h-8 w-8 shrink-0 text-xs sm:h-9 sm:w-9 sm:text-sm"
              onClick={() => handlePageClick(page)}
            >
              {page}
            </IconButton>
          ) : (
            <span key={page} className="shrink-0 px-1 text-sm text-gray-400">
              ...
            </span>
          )
        )}
      </div>
      <Button
        variant="text"
        className="flex shrink-0 items-center gap-1 px-2 py-2 text-xs sm:gap-2 sm:px-3 sm:text-sm"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        Next
        <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Pagination;
