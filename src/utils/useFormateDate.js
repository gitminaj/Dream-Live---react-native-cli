export const useFormateDate = (isoDateString) => {
  const date = new Date(isoDateString);
  const options = { day: '2-digit', month: 'short', year: 'numeric' }; // e.g., 01 May 2025
  return date.toLocaleDateString('en-US', options);
};