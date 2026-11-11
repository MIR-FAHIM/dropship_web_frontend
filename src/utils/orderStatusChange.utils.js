// Shared status-change flow for admin and vendor pages.
// The API refuses changes that break the CarryBee status journey (going backwards,
// changing a final order, setting a courier status on a consignment order).
// Admins can retry with a written reason; vendors just see why it was refused.

export const getStatusChangeError = (err) => ({
  code: err?.data?.errors?.code || null,
  message: err?.data?.message || err?.message || "Status update failed.",
});

/**
 * @returns {Promise<{ok: boolean, cancelled?: boolean, message?: string}>}
 */
export const changeOrderStatus = async ({ updateStatus, id, statusId, isAdmin = false, changedBy }) => {
  const base = { id, status_id: Number(statusId), changed_by: changedBy || undefined };

  try {
    await updateStatus(base).unwrap();
    return { ok: true };
  } catch (err) {
    const { code, message } = getStatusChangeError(err);
    if (!isAdmin || code !== "override_required") {
      return { ok: false, message };
    }

    const reason = window.prompt(`${message}\n\nReason for this override (saved in the order history):`);
    if (reason === null || reason.trim() === "") {
      return { ok: false, cancelled: true, message: "Status not changed." };
    }

    try {
      await updateStatus({ ...base, override_reason: reason.trim() }).unwrap();
      return { ok: true, message: "Status changed by override." };
    } catch (retryErr) {
      return { ok: false, message: getStatusChangeError(retryErr).message };
    }
  }
};
