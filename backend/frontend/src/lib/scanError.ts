export const formatScanFailure = (error: any) => {
  const data = error?.response?.data;
  const primaryMessage =
    data?.error ||
    error?.message ||
    error?.toString?.() ||
    'Extraction failed';

  const reason = data?.details?.reason;
  if (typeof reason !== 'string' || !reason.trim()) {
    return primaryMessage;
  }

  const trimmedPrimary = String(primaryMessage).trim();
  const trimmedReason = reason.trim();

  if (trimmedPrimary.toLowerCase().includes(trimmedReason.toLowerCase())) {
    return trimmedPrimary;
  }

  return `${trimmedPrimary} Details: ${trimmedReason}`;
};
