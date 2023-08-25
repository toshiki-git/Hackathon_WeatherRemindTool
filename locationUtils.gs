function getCoordinates(address) {
  const baseUrl = "https://maps.googleapis.com/maps/api/geocode/json";
  const queryUrl = `${baseUrl}?address=${encodeURIComponent(
    address
  )}&key=${GOOGLE_MAPS_API_KEY}`;

  const response = UrlFetchApp.fetch(queryUrl);
  const data = JSON.parse(response.getContentText());

  if (data.status !== "OK") {
    Logger.log(`Error geocoding address: ${address}. Error: ${data.status}`);
    return null;
  }

  const coordinate = data.results[0].geometry.location;
  return coordinate;
}
