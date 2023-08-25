function extractRelevantWeatherInfo(jsonData) {
  if (
    !jsonData ||
    !jsonData.weather ||
    !jsonData.weather[0] ||
    !jsonData.main
  ) {
    console.error("Invalid weather data structure received.");
    return [];
  }

  return [
    jsonData.weather[0].id,
    jsonData.main.temp_min,
    jsonData.main.temp_max,
    jsonData.main.humidity,
    jsonData.main.pressure,
  ];
}

function getWeatherInfo(coordinate) {
  const weatherData = fetchWeatherData(coordinate);
  return extractRelevantWeatherInfo(weatherData);
}

function getWeatherMessage(id) {
  const weatherMessageObj = {
    rain: ["雨が予想されます。", "傘をお忘れなく！"],
    snow: ["雪が予想されます。", "安全運転を心掛けてください。"],
    atmosphere: ["天気が荒れる予想です。", "外出時は十分な注意が必要です。"],
    sun: [
      "晴れの天気となるでしょう。",
      "日差しが強くなる場合がありますので、帽子や日焼け止めを準備したほうがいいかもしれません。",
    ],
    cloud: [
      "曇りの天気が予想されます。",
      "雨の可能性も考慮して、折りたたみ傘の携帯をおすすめします。",
    ],
  };

  let weatherType;
  if (id <= 500) weatherType = "rain";
  else if (id > 600 && id < 700) weatherType = "snow";
  else if (id > 700 && id < 800) weatherType = "atmosphere";
  else if (id === 800) weatherType = "sun";
  else weatherType = "cloud";

  return weatherMessageObj[weatherType];
}
