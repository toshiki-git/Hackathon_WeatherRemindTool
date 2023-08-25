function getTomorrowDate() {
  let today = new Date();
  let tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return tomorrow;
}

function getStartAndEndOfDate(date) {
  let startOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0
  );
  let endOfDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59
  );
  return { start: startOfDay, end: endOfDay };
}

function getEventsForDate(start, end) {
  return CalendarApp.getDefaultCalendar().getEvents(start, end);
}

function extractEventData(events) {
  return events.map((event) => ({
    startTime: event.getStartTime(),
    endTime: event.getEndTime(),
    title: event.getTitle(),
    description: event.getDescription() || "特になし",
    location: event.getLocation(),
    coordinate: getCoordinates(event.getLocation()),
  }));
}

function getCalendarData() {
  const tomorrow = getTomorrowDate();
  const { start, end } = getStartAndEndOfDate(tomorrow);
  const events = getEventsForDate(start, end);
  return extractEventData(events);
}
