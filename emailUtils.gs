function formatDate(inputDate) {
  const date = new Date(inputDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes().toString().padStart(2, "0");

  return `${year}年${month}月${day}日 ${hour}:${minute}`;
}

function constructEmailBody(weatherData, calendarData) {
  const [id, temp_min, temp_max, humidity, pressure] = weatherData;
  const { startTime, endTime, description, title, location } = calendarData;
  if (description === "") {
    description = "特になし";
  }
  const eventInfo = `【予定情報】
    
要件: ${title}
メモ: ${description}
場所: ${location}
時間: ${formatDate(startTime)}〜${
    endTime.getHours() + ":" + endTime.getMinutes().toString().padStart(2, "0")
  }`;

  const [weatherMessageFirst, weatherMessageSecond] = getWeatherMessage(id);

  const weatherInfo = `【天気情報】
${weatherMessageFirst}
最高気温: ${temp_max}℃
最低気温: ${temp_min}℃
湿度: ${humidity}%
気圧: ${pressure}hPa
${weatherMessageSecond}`;

  return `${eventInfo}\n\n${weatherInfo}`;
}

function createAndSendEmails(weatherDataList, calendarDataList) {
  for (let i = 0; i < weatherDataList.length; i++) {
    // エラーチェック: 場所や天気情報が適切に取得されているかどうか
    if (!weatherDataList[i] || weatherDataList[i].length === 0) {
      const errorMessage = `天気情報の取得に失敗しました (場所: ${titles[i]})`;
      GmailApp.sendEmail(
        RECIPIENT_EMAIL,
        "エラー: リマインドメール送信失敗",
        errorMessage
      );
      continue; // このイベントの処理をスキップして、次のイベントに進む
    }

    const body = constructEmailBody(weatherDataList[i], calendarDataList[i]);
    GmailApp.sendEmail(RECIPIENT_EMAIL, "リマインドメール", body);
  }
}
