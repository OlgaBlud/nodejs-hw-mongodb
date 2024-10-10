const parseNumber = (number, defaultValue) => {
  if (typeof number !== 'string') return defaultValue;
  const parsedNumber = parseInt(number);
  return Number.isNaN(parsedNumber) ? defaultValue : parsedNumber;
};
export const parsePaginationParams = (query) => {
  const { page, perPage } = query;
  const parsedPage = parseNumber(page, 1);
  const parsedPerPage = parseNumber(perPage, 10);
  return {
    page: parsedPage,
    perPage: parsedPerPage,
  };
};
