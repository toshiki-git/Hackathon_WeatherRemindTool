function getCalendardata() {
  // 明日の日付を取得
  let today = new Date(); //今日の日付を取得
  let tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // 明日の開始と終了の日時をセット
  let startOfDay = new Date(
    tomorrow.getFullYear(),
    tomorrow.getMonth(),
    tomorrow.getDate(),
    0,
    0,
    0
  );
  let endOfDay = new Date(
    tomorrow.getFullYear(),
    tomorrow.getMonth(),
    tomorrow.getDate(),
    23,
    59,
    59
  );

  // ユーザーのカレンダーから明日のイベントを取得
  let events = CalendarApp.getDefaultCalendar().getEvents(startOfDay, endOfDay);

  let locations = [];
  let startTimes = [];
  let endTimes = [];
  let title = [];
  let description = [];

  // イベントの詳細と場所を取得
  events.forEach((event, index) => {
    //Logger.log(typeof event.getTitle())

    //Logger.log(typeof event.getStartTime())
    startTimes.push(event.getStartTime());

    //Logger.log(typeof event.getEndTime())
    endTimes.push(event.getEndTime());

    title.push(event.getTitle());
    description.push(event.getDescription());
    //Logger.log(event.getDescription())
    //Logger.log(event.getTitle())

    const regular_location = regularExpression(event.getLocation());
    const translated_regular_location = translatePlaceName(regular_location);
    locations.push(translated_regular_location);
  });

  return {
    locations: locations,
    startTimes: startTimes,
    endTimes: endTimes,
    title: title,
    description: description,
  };
}

function getWeatherInfo(city) {
  //Open Weather MapのAPIキーを定義する(各自APIキーで書き換え)
  let apiKey = "<Your Api key>";
  let apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=";

  //スプレッドシートに書き込むための配列を初期化する
  let weatherInfo = [];

  //APIリクエストするURLにAPIキーと取得都市のパラメータをセット
  let requestUrl = apiUrl + city + "&appid=" + apiKey + "&lang=ja&units=metric";
  //UrlFetchAppでOpen Weather MapのAPIから天気データを取得する
  let response = UrlFetchApp.fetch(requestUrl).getContentText();
  //取得したデータはJSON形式のため、JSONとして変換する
  let json = JSON.parse(response);
  //Open Weather Mapから取得した天気情報の中から必要な情報を2次元配列に書き込み
  weatherInfo[0] = json["name"];
  weatherInfo[1] = json["weather"][0]["id"];
  weatherInfo[2] = json["main"]["temp_min"];
  weatherInfo[3] = json["main"]["temp_max"];
  weatherInfo[4] = json["main"]["humidity"];
  weatherInfo[5] = json["main"]["pressure"];

  return weatherInfo;
}

function translatePlaceName(placeName) {
  var sourceLanguage = "ja"; // 元の言語（日本語）
  var targetLanguage = "en"; // 翻訳先の言語（英語）

  const url =
    "https://script.google.com/macros/s/AKfycbzTH51KL6m6vZn14gZCL1IFE5dh0owfF5p51IwvtijxZWSIpaynv5sXTrGQOi4RnYWclA/exec?" +
    "text=" +
    placeName +
    "&source=" +
    sourceLanguage +
    "&target=" +
    targetLanguage;

  var response = UrlFetchApp.fetch(url);
  var json = response.getContentText();
  var translatedText = JSON.parse(json).text;

  return translatedText;
}

function createBody(
  location_weather_list,
  time_list,
  error_message,
  title,
  description
) {
  let body = "";

  let titlename = title;
  let descriptionname = description;

  //Logger.log(title);
  //Logger.log(description)

  if (error_message != null) {
    const mailTo = "<Your Mail Address>";
    const title = "リマインドメール";
    body = error_message;
    GmailApp.sendEmail(mailTo, title, body);
    return;
  } else {
    //1日に日程が2つ以上ある場合はどうする？メールを2つにする？1つのメールにまとめる？
    location_weather_list.forEach((location_weather, index) => {
      //Logger.log(titlename);
      //Logger.log(descriptionname)
      let place = location_weather[0]; // json['name'];
      let id = location_weather[1]; // json['weather'][0]['id'];
      let temp_min = location_weather[2]; // json['main']['temp_min'];
      let temp_max = location_weather[3]; // json['main']['temp_max'];
      let humidity = location_weather[4]; // json['main']['humidity'];
      let pressure = location_weather[5]; // json['main']['pressure'];

      let event = titlename[index];
      let memo = descriptionname[index];
      let startTime = time_list[index][0];
      let endTime = time_list[index][1];

      let weather_message_first;
      let weather_message_second;

      const weather_message_obj = {
        cloud: [
          "明日のご予定がある地域の天気は曇りです。\n",
          "\n折りたたみ傘があると良いかもしれません。\n",
        ],
        rain: [
          "明日のご予定がある地域の天気は雨です。\n",
          "\n傘を持って出かけましょう。\n",
        ],
        sun: ["明日のご予定がある地域の天気は曇りです。\n", ""],
        atmosphere: ["天気が荒れるので十分ご注意ください。\n", ""],
        snow: ["積雪に注意して下さい。\n", ""],
      };

      const weather = "cloudy";

      if (parseInt(id) <= 500) {
        weather_message_first = weather_message_obj["rain"][0];
        weather_message_second = weather_message_obj["rain"][1];
      } else if (parseInt(id) > 600 && parseInt(id) < 700) {
        weather_message_first = weather_message_obj["snow"][0];
        weather_message_second = weather_message_obj["snow"][1];
      } else if (parseInt(id) > 700 && parseInt(id) < 800) {
        weather_message_first = weather_message_obj["atmosphere"][0];
        weather_message_first = weather_message_obj["atmosphere"][1];
      } else if (parseInt(id) == 800) {
        weather_message_first = weather_message_obj["sun"][0];
        weather_message_second = weather_message_obj["sun"][1];
      } else {
        weather_message_first = weather_message_obj["cloud"][0];
        weather_message_second = weather_message_obj["cloud"][1];
      }

      body =
        weather_message_first +
        "\n" +
        "最高気温: " +
        temp_max +
        "℃\n最低気温: " +
        temp_min +
        "℃\n湿度: " +
        humidity +
        "%\n気圧: " +
        pressure +
        "hPa" +
        weather_message_second +
        "予定内容は以下の通りです。\n" +
        "要件: " +
        event +
        "\nメモ:" +
        memo +
        "\n場所: " +
        place +
        "\n時間: " +
        startTime +
        "~" +
        endTime +
        "\n";

      const mailTo = "<Your Mail Address>";
      const title = "リマインドメール";
      GmailApp.sendEmail(mailTo, title, body);
    });
  }
}

function regularExpression(inputString) {
  var regex = /^[^,]+/;
  var match = inputString.match(regex);

  if (match) {
    return match[0];
  } else {
    return "";
  }
}

function main() {
  const calendar_data = getCalendardata();

  const locations = calendar_data["locations"];

  const title = calendar_data["title"];
  //Logger.log(title);

  const description = calendar_data["description"];

  //Logger.log(description);
  let info = [];

  const time_list = [calendar_data["startTimes"], calendar_data["endTimes"]];

  if (
    locations.includes(null) ||
    locations.includes("") ||
    locations.length == 0 ||
    locations.includes("Bad Request")
  ) {
    const error_message = "「場所」が不適切な予定があります !";
    return [null, null, error_message];
  }

  let location_weather_list = locations.map((location, index) => {
    return getWeatherInfo(location);
  });

  Logger.log(location_weather_list);
  createBody(location_weather_list, time_list, null, title, description);
}
