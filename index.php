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
<div id="container" style="margin-left: 50px; margin-top: 30px">
    <div id="grafica"></div>
</div>

<script type="text/javascript">
    var parseDate = d3.time.format("%Y-%m-%d").parse;
    var formatFecha = d3.time.format("%Y-%m-%d");
    var chart = new Grafica({id: "#grafica"});
    var periodos = [
        {
            texto: "2D",
            cantidad: 2,
            tipo: "dia",
            seleccionado: false
        }, {
            texto: "4D",
            cantidad: 4,
            tipo: "dia",
            seleccionado: false
        }, {
            texto: "5D",
            cantidad: 5,
            tipo: "dia",
            seleccionado: false
        }, {
            texto: "10D",
            cantidad: 10,
            tipo: "dia",
            seleccionado: true
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
    var datos;

    jQuery(document).ready(function () {

        //http://marktdaten.herokuapp.com/historicos2/4.json?callback=callback
        jQuery.ajax({
            url: "http://marktdaten.herokuapp.com/historicos2/4.json?callback=callback",
            type: 'GET',
            dataType: 'jsonp',
            jsonpCallback: 'callback',
            success: function (result, testStatus) {

               /* var uno = '[{"date":"2013-01-02","open":"3.88","low":"3.79","hight":"3.9","value":"3.84","volume":515500},' +
                '{"date":"2013-01-03","open":"3.8","low":"3.79","hight":"3.89","value":"3.83","volume":749400},' +
                '{"date":"2013-01-04","open":"3.81","low":"3.79","hight":"3.85","value":"3.83","volume":286400},' +
                '{"date":"2013-01-07","open":"3.83","low":"3.78","hight":"3.85","value":"3.81","volume":233000},' +
                '{"date":"2013-01-08","open":"3.81","low":"3.73","hight":"3.82","value":"3.8","volume":485200},' +
                '{"date":"2013-01-09","open":"3.81","low":"3.79","hight":"3.98","value":"3.93","volume":848100}]';

                uno = JSON.parse(uno);*/

                datos = [
                    {
                        titulo: "MAXCOM",
                        data: result.precios,
                        color: "steelblue"
                    },
                    {
                        titulo: "IPC",
                        data: result.ipc,
                        color: "#ff7f0e"
                    }
                ];

                chart.datos = datos;
                chart.periodos = periodos;
                chart.m_graficar();
            }
            ,
            error: function (jqXHR, textStatus, errorThrow) {
                console.error(jqXHR['responseText']);
            }
        });
    });


    var chart = new Grafica({id: "#grafica"});
    //    chart.datos = datos;
    //    chart.periodos = periodos;
    //    chart.m_graficar();

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

    //http://marktdaten.herokuapp.com/historicos/3.json


</script>

</body>
</html>