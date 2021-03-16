
$(function () {


  // *** APIs ***
  // clima, previsão 12 horas e previsão 5 dias: https://developer.accuweather.com/apis
  // pegar coordenadas geográficas pelo nome da cidade: https://docs.mapbox.com/api/
  // pegar coordenadas do IP: http://www.geoplugin.net
  // gerar gráficos em JS: https://www.highcharts.com/demo  


  var AccuWheatheApiKey = "YAP4G2tbqftjrffj1GuScRUyg2ns3JJo";
  var mapBoxToken = "pk.eyJ1IjoiZnJhbmNpc2xlaXNvdXphIiwiYSI6ImNrZHp6ZjQwZTFod2cyeG9hbm53MTBkaXYifQ.TajtXdC97oBUzmSjP7Wqpw";
  var tipoGrafico = 'line';
  var wheatherObject = {
    cidade: "",
    estado: "",
    pais: "",
    temperatura: "",
    texto_clima: "",
    icone_clima: ""
  };

  function preencher_climaAgora(cidade, estado, pais, temperatura, texto_clima, icone_clima) {

    var texto_local = cidade + ", " + estado + "-" + pais;
    $("#texto_local").text(texto_local);
    $("#texto_clima").text(texto_clima);
    $("#texto_temperatura").html(String(temperatura) + "&deg;");
    $("#icone_clima").css("background-image", "url('" + wheatherObject.icone_clima + "')");
  }


  function gerarGrafico(horas, temperaturas) {

    if (tipoGrafico == '') {
      tipoGrafico = 'line'
    }


    Highcharts.chart('hourly_chart', {
      chart: {
        type: tipoGrafico
        // type: 'line'
      },
      title: {
        text: 'Temperatura Hora a Hora'
      },
      xAxis: {
        categories: horas
      },
      yAxis: {
        title: {
          text: 'Temperatura (°C)'
        }
      },
      plotOptions: {
        line: {
          dataLabels: {
            enabled: false
          },
          enableMouseTracking: false
        }
      },
      series: [{
        showInLegend: false,
        data: temperaturas
      }]
    });
  }

  function pegarPrevisaoHoraHora(localCode) {

    $.ajax({
      url: "http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/" + localCode + "?apikey=" + AccuWheatheApiKey + "&language=pt-br&metric=true",
      type: "GET",
      dataType: "json",
      success: function (data) {
        var horarios = [];
        var temperaturas = [];

        for (var a = 0; a < data.length; a++) {

          var hora = new Date(data[a].DateTime).getHours();

          horarios.push(String(hora) + "h");
          temperaturas.push(data[a].Temperature.Value);
          gerarGrafico(horarios, temperaturas);
          $(".refresh-loader").fadeOut();

        }

      },
      error: function () {
        console.log("Erro na requisição");
        gerarErro("Erro na Previsão de Hora a Hora");
      }
    });

  }

  function preecherPrevisao5Dias(previsoes) {

    $("#info_5dias").html("");
    var diasSemana = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"];

    for (var a = 0; a < previsoes.length; a++) {
      var dataHoje = new Date(previsoes[a].Date);
      var dia_semana = diasSemana[dataHoje.getDay()];
      var IconNumber = previsoes[a].Day.Icon <= 9 ? "0" + String(previsoes[a].Day.Icon) : String(previsoes[a].Day.Icon);
      iconeclima = "https://developer.accuweather.com/sites/default/files/" + IconNumber + "-s.png";
      var maxima = String(previsoes[a].Temperature.Maximum.Value);
      var minima = String(previsoes[a].Temperature.Minimum.Value);

      var elementoHtmlDia = '<div class="day col">';
      elementoHtmlDia += '<div class="day_inner">';
      elementoHtmlDia += '<div class="dayname">';
      elementoHtmlDia += dia_semana;
      elementoHtmlDia += '</div>';
      elementoHtmlDia += '<div style="background-image: url(\'' + iconeclima + '\')"class="daily_weather_icon"></div>';
      elementoHtmlDia += '<div class="max_min_temp">';
      elementoHtmlDia += minima + '&deg; /' + maxima + '&deg;';
      elementoHtmlDia += '</div>';
      elementoHtmlDia += '</div>';
      elementoHtmlDia += '</div>';
      $("#info_5dias").append(elementoHtmlDia);
      elementoHtmlDia = "";
    }

  }

  function pegarPrevisao5Dias(localCode) {
    $.ajax({
      url: "http://dataservice.accuweather.com/forecasts/v1/daily/5day/" + localCode + "?apikey=" + AccuWheatheApiKey + "&language=pt-br&metric=true",
      type: "GET",
      dataType: "json",
      success: function (data) {
        $("#texto_max_min").html(String(data.DailyForecasts[0].Temperature.Minimum.Value) + "&deg; / " + String(data.DailyForecasts[0].Temperature.Maximum.Value) + "&deg;");
        preecherPrevisao5Dias(data.DailyForecasts);

      },
      error: function () {
        console.log("Erro na requisição");
        gerarErro("Erro na Previsão dos 5 Dias");
      }
    });

  }

  function pegarTempoAtual(localCode) {
    $.ajax({
      url: "http://dataservice.accuweather.com/currentconditions/v1/" + localCode + "?apikey=" + AccuWheatheApiKey + "&language=pt-br",
      type: "GET",
      dataType: "json",
      success: function (data) {
        wheatherObject.temperatura = data[0].Temperature.Metric.Value;
        wheatherObject.texto_clima = data[0].WeatherText;


        var IconNumber = data[0].WeatherIcon <= 9 ? "0" + String(data[0].WeatherIcon) : String(data[0].WeatherIcon);
        wheatherObject.icone_clima = "https://developer.accuweather.com/sites/default/files/" + IconNumber + "-s.png";

        preencher_climaAgora(wheatherObject.cidade, wheatherObject.estado, wheatherObject.pais, wheatherObject.temperatura, wheatherObject.texto_clima, wheatherObject.icone_clima)
      },
      error: function () {
        console.log("Erro na requisição");
        gerarErro("Erro na Previsão de Tempo Atual");
      }
    });
  }

  function pegarLocalUsuario(lat, long) {
    $.ajax({
      url: "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=" + AccuWheatheApiKey + "&q=" + lat + "%2C%20" + long + "&language=pt-br",
      type: "GET",
      dataType: "json",
      success: function (data) {
        try {
          wheatherObject.cidade = data.ParentCity.LocalizedName;
        } catch {
          wheatherObject.cidade = data.LocalizedName;
        }
        wheatherObject.estado = data.AdministrativeArea.LocalizedName;
        wheatherObject.pais = data.Country.LocalizedName;

        var localCode = data.Key;
        pegarTempoAtual(localCode);
        pegarPrevisao5Dias(localCode);
        pegarPrevisaoHoraHora(localCode);
      },
      error: function () {
        console.log("Erro na requisição");
        gerarErro("Erro no Código do local - accuWeather");
      }
    });
  }



  function pegarCoordenadasDaPesquisa(input) {
    input = encodeURI(input);
    $.ajax({
      url: "https://api.mapbox.com/geocoding/v5/mapbox.places/" + input + ".json?access_token=" + mapBoxToken,
      type: "GET",
      dataType: "json",
      success: function (data) {

        try {

          var long = data.features[0].geometry.coordinates[0];
          var lat = data.features[0].geometry.coordinates[1];
          pegarLocalUsuario(lat, long);

        } catch{
          gerarErro("Erro na pesquisa de local - MapBox");
        }

      },
      error: function () {
        console.log("Erro na requisição");
        gerarErro("Erro na pesquisa de local - MapBox");
      }
    });
  }




  function pegarCoordenadasDoIp() {
    var latPadrao = -22.981361;
    var LongPadrao = -43.223176;

    $.ajax({
      url: "http://www.geoplugin.net/json.gp",
      type: "GET",
      dataType: "json",
      success: function (data) {
        if (data.geoplugin_latitude && data.geoplugin_longitude) {
          pegarLocalUsuario(data.geoplugin_latitude, data.geoplugin_longitude);
        } else {
          pegarLocalUsuario(latPadrao, LongPadrao);

        }
      },
      error: function () {
        console.log("Erro na requisição");
        pegarLocalUsuario(latPadrao, LongPadrao);

      }
    });
  }

  function gerarErro(mensagem) {

    if (!mensagem) {
      mensagem = "Erro na solicitação!";
    }

    $(".refresh-loader").hide();
    $("#aviso-erro").text(mensagem);
    $("#aviso-erro").slideDown();

    window.setTimeout(function () {
      $("#aviso-erro").slideUp();
    }, 4000);


  }

  pegarCoordenadasDoIp();

  $("#search-button").click(function () {
    $(".refresh-loader").show();
    var local = $("input#local").val();
    if (local) {
      pegarCoordenadasDaPesquisa(local);
    } else {
      gerarErro("Erro na pesquisa de local - MapBox");
    }
  });



  $("input#local").on("keypress", function (e) {
    if (e.which == 13) {
      $(".refresh-loader").show();
      var local = $("input#local").val();
      if (local) {
        pegarCoordenadasDaPesquisa(local);
      } else {
        gerarErro("Erro na pesquisa de local - MapBox");
      }
    }
  });


  $("input[name='opcao']").click(function () {
    $(".refresh-loader").show();
    tipoGrafico = $("input[name='opcao']:checked").val();
    var local = $("input#local").val();
    if (local) {
      pegarCoordenadasDaPesquisa(local);
    } else {
      pegarCoordenadasDoIp();
    }
  });






});