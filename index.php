<!DOCTYPE html>
<html>
<head>
    <title></title>
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/jquery-ui.css">

    <link rel="stylesheet" href="css/grafica.css">

    <script src="js/jquery-1.11.0.min.js"></script>
    <script src="js/jquery-ui.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/d3.v3.min.js" charset="utf-8"></script>
    <script src="js/grafica.js"></script>

</head>
<body>

<div id="grafica"></div>

<script type="text/javascript">
    var cant = 350;
    var chart = new Grafica({id: "#grafica"});

    var periodos = [
        {
            texto: "2D",
            cantidad: 2,
            tipo: "dia",
            seleccionado: false
        }, {
            texto: "5D",
            cantidad: 5,
            tipo: "dia",
            seleccionado: true
        }, {
            texto: "10D",
            cantidad: 10,
            tipo: "dia",
            seleccionado: false
        }, {
            texto: "1M",
            cantidad: 1,
            tipo: "mes",
            seleccionado: false
        }, {
            texto: "3M",
            cantidad: 3,
            tipo: "mes",
            seleccionado: false
        }, {
            texto: "6M",
            cantidad: 6,
            tipo: "mes",
            seleccionado: false
        }, {
            texto: "YTD",
            cantidad: 0,
            tipo: "hasta_la_fecha",
            seleccionado: false
        }, {
            texto: "1Y",
            cantidad: 1,
            tipo: "anno",
            seleccionado: false
        },
        {
            texto: "2Y",
            cantidad: 2,
            tipo: "anno",
            seleccionado: false
        }
    ];

    var parseDate = d3.time.format("%Y-%m-%d").parse;
    var formatFecha = d3.time.format("%Y-%m-%d");

    var uno = '[{ "date": "2015-02-25","close": "4.88","volume": 1607130},' +
        '{"date": "2015-02-26","close": "2.02","volume": 2547970},' +
        '{"date": "2015-02-27","close": "0.4","volume": 1524110}]';

    uno = JSON.parse(uno);
    uno = uno.map(function (d) {
        return {
            date: parseDate(d.date),
            close: +d.close,
            volume: d.volume
        }
    });

    datos = [
        {
            titulo: "MAXCOM",
            data: generar_datos_aleatorios(cant),
            color: "#FF7F0E",
            color: "steelblue"
        },
        {
            titulo: "BBVA",
            data: generar_datos_aleatorios(cant),
            color: "green",
            color: "#1f77b4",
            color: "#2ca02c",
            color: "#ff7f0e",
        },
        {
            titulo: "Yahoo",
            data: generar_datos_aleatorios(cant),
            color: "green"
        },
        {
            titulo: "NASDAQ",
            data: generar_datos_aleatorios(cant),
            color: "red"
        }
    ];

    var chart = new Grafica({id: "#grafica"});
    chart.datos = datos;
    chart.periodos = periodos;
    chart.m_graficar();

    function generar_datos_aleatorios(cantidad_elementos) {
        cantidad_elementos || (cantidad_elementos = 10);
        var random_data = [];
        var fecha = null;
        for (var i = 0; i < cantidad_elementos; i++) { /*n dias para atras a partir de la fecha de hoy*/
            fecha = new Date();
            fecha.setDate(fecha.getDate() - i);
            fecha.setHours(0, 0, 0, 0);

            var low = Math.random() * 5;
            var open = Math.random() * 5;
            var high = Math.random() * 5;
            var close = Math.random() * 5;

            random_data.push({
                date: formatFecha(fecha),
                open: Math.round(open * 100) / 100,
                high: (Math.round(high * 100) + 1.5 ) / 100,
                low: Math.round(low * 100) / 100,
                close: Math.round(close * 100) / 100,
                volume: Math.floor(Math.random() * 1000) + 350
            });
        }
        return random_data.reverse();
    }
</script>

</body>
</html>