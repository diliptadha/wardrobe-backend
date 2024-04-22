function getDaysDifference(date1, date2) {
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function compareNearestFutureDate(a, b, c) {
  const currentDate = new Date();
  const aDate = new Date(a);
  const bDate = new Date(b);

  // If both dates are in the past, return the more recent past date
  if (aDate < currentDate && bDate < currentDate) {
    return bDate - aDate;
  }

  // If both dates are in the future, return the closer future date
  if (aDate >= currentDate && bDate >= currentDate) {
    return (
      getDaysDifference(currentDate, aDate) -
      getDaysDifference(currentDate, bDate)
    );
  }

  // If one date is in the past and the other is in the future, return the future date
  return aDate >= currentDate ? -1 : 1;
}
