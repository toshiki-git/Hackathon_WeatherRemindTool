function main() {
  const calendarDataList = getCalendarData();

  console.log(calendarDataList);

  // Fetch weather info for each location
  const weatherDataList = calendarDataList.map((event) =>
    getWeatherInfo(event.coordinate)
  );

  // Construct and send email for each event
  createAndSendEmails(weatherDataList, calendarDataList);
}
