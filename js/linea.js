(function () {
//Inicio de lalibreria

    LineChart = function (raiz, opciones) {

        // ----------------------------- Definicion de las variables publicas--------------------
        self = this;
        self.raiz = raiz;
        self.opciones = opciones;
        self.default_options = {
            showgridLines: true,
            gridLines: {color: 'lightgrey', showHorizontal: true, showVertical: true},

            fontFamily: "Arial",// la Fuente
            fontSize: 12,// la Fuente

            dateFormat: "dd-mm-yy", // Formato de la fecha

            animation: true, //Animada
            animacionType: '', // tipo de animacion
            responsive: true, //Responsiva

            tooltip: {fontFamily: 'Arial', fontColor: 'white', fontSize: 12, fillColor: 'black', borderColor: 'white'},

            showPoint: true,
            point: {pointRadius: 3, pointBorderWidth: 1, fillColor: '', borderColor: 'blue'},

            showPeriod: true,
            periodos: [
                {
                    texto: "1D",
                    cantidad: 1,
                    tipo: "dia",
                    seleccionado: true
                }, {
                    texto: "5D",
                    cantidad: 5,
                    tipo: "dia",
                    seleccionado: false
                }, {
                    texto: "1m",
                    cantidad: 1,
                    tipo: "mes",
                    seleccionado: false
                }, {
                    texto: "3m",
                    cantidad: 3,
                    tipo: "mes",
                    seleccionado: false
                }, {
                    texto: "6m",
                    cantidad: 6,
                    tipo: "mes",
                    seleccionado: false
                }, {
                    texto: "YTD",
                    cantidad: 0,
                    tipo: "hasta_la_fecha",
                    seleccionado: false
                }, {
                    texto: "1y",
                    cantidad: 1,
                    tipo: "anno",
                    seleccionado: false
                }, {
                    texto: "2y",
                    cantidad: 2,
                    tipo: "anno",
                    seleccionado: false
                }, {
                    texto: "5y",
                    cantidad: 5,
                    tipo: "anno",
                    seleccionado: false
                }, {
                    texto: "10y",
                    cantidad: 10,
                    tipo: "anno",
                    seleccionado: false
                }
            ],

            mouseLineIndicator: {horizontal: true, vertical: true}, //muestra linea horizontal y vertical cuando se mueve el mouse por la grafica
            xTicks: 6,
            yTicks: 5
        };
        self.titulo = "LineChart by IRStrat";
        self.datos = [
            /*
             lineColor: "rgba(220,220,220,0.2)",
             strokeColor: "rgba(220,220,220,1)",
             pointColor: "rgba(220,220,220,1)",
             pointBorderColor: "#fff",
             pointColorFocus: "#fff",
             pointBorderFocus: "rgba(220,220,220,1)",
             data: [],
             dateFormat: "dd-mm-yy",
             animation: true,
             animationType:'easy'
             */

        ]; // Datos a graficar
        self.periodos = []; //Periodos personalizados

        //--------------------- Variables privadas aqui--------------------------

        var margin = {top: 5, right: 10, bottom: 25, left: 30};
        var width = 480 - margin.left - margin.right, height = 250 - margin.top - margin.bottom;

        var colors = d3.scale.category10();//escala de 10 colores de d3
        var parseDate = d3.time.format("%d-%b-%y").parse; //Formato por defecto de la fecha
        var formatFecha, formatDate, valueline;
        var x, y, xAxis, yAxis;
        var current_data; //representa los datos que se estan graficando actualemte
        var periodHeight; //height por defecto del div contenedor de los periodos
        var fechaInicio, fechaFin; //fecha inicial y fecha final selesccionada
        var inicioDominio, finDominio; //Inicio y fin de los datos cargados


        //Mezcla las opciones con las que pasa el usuario
        //Inicializa las variables y los elementos del DOM
        _init = function () {
            self.opciones = my_extend(self.default_options, self.opciones);
            _inicializarDOM_y_Variables();
            function my_extend(options1, options2) {
                for (var key1 in options1)
                    for (var key2 in options2)
                        if (key1 == key2)
                            options1[key1] = options2[key2];
                return options1;
            }
        };


        self.graficar = function () {
            if (_DatosCorrectos()) {

                var data = self.datos[0].data;

                //establece el dominio para el eje x (es decir, de donde a donde van los valores)
                x.domain(d3.extent(data, function (d) {
                    return d.date;
                }));

                //Dominio del eje Y
                y.domain([0, d3.max(data, function (d) {
                    return d.close;
                })]);

                svg = d3.select("#" + self.raiz + " svg");

                g_main = svg.select('.g_main');


                //  Adiciona el eje X
                g_main.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                //  Adiciona el Eje Y
                g_main.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);

                //Add the valueline path.
                g_main.append("path")
                    .datum(data)
                    .attr("clip-path", "url(#clip)")
                    .attr("class", "line line-main")
                    .attr("stroke", colors(0))
                    .attr("d", valueline);


            } else {
                throw new Error("Formato de los datos incorrectos");
            }
        };

        _actualizar = function (data) {

        };

        //Inicializa el SVG, y todos los elementos necesarios para crear la grafica
        _inicializarDOM_y_Variables = function () {

            Inicializar_Variables();

            //Inicializando elemento raiz con sus propiedades
            var realWidth = width + margin.left + margin.right;
            d3.select("#" + self.raiz)
                .style("max-width", realWidth + 'px')
                .style('width', '100%');

            if (self.default_options.showPeriod) {
                var periodos_grafica = d3.select("#" + self.raiz)
                    .append('div')
                    .attr('id', 'chart-periodos')
                    .attr('class', 'chart-periodos-container')
                    .style('background', '#33CCCC')
                    .style('height', periodHeight + 'px');
            }

            //Creando el SVG
            svg = d3.select("#" + self.raiz)
                .append('div')
                .attr('class', 'chart-container')
                .style('width', '100%')
                .append("svg")
                .attr("id", "chart-svg")
                //.style("background", "#F0F6FD")
                //.style("background", "rgba(51, 204, 204, 0.20)")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);


            g_main = svg.append("g")
                .attr('class', 'g_main')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            focus = g_main.append("g")
                .attr("class", "focus")
                .style("display", "none");


            function Inicializar_Variables() {

                // Tener en cuenta que si el usuario pone titulo a la grafica entonces hay que dejar mar margin.top


                //Temporalmente asigno a los periodos los que tengo por defecto
                self.periodos = self.default_options.periodos;
                periodHeight = 30; //height de los periodos

                //if (self.default_options.showPeriod)
                // margin.top = margin.top + periodHeight;

                formatFecha = d3.time.format("%Y-%m-%d");

                //Escala para eje X and Y
                x = d3.time.scale().range([0, width]);
                y = d3.scale.linear().range([height, 0]);

                //Eje X and Y
                xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(self.default_options.xTicks);
                yAxis = d3.svg.axis().scale(y).orient("left").ticks(self.default_options.yTicks);

                // Define que valores va a graficar la linea para cada eje
                valueline = d3.svg.line()
                    .x(function (d) {
                        return x(d.date);
                    })
                    .y(function (d) {
                        return y(d.close);
                    });
            }

            //Crear los periodos
            function crearPeriodos() {

                /*var rangos = d3.select(".chart-rangos");

                 rangos.selectAll("misbotones")
                 .data(self.periodos)
                 .enter()
                 .append("button")
                 .attr("class", "m btn btn-primary btn-md")
                 .attr("type", "button")
                 .attr("data-value", function (p) {
                 return p.cantidad;
                 })
                 .attr("data-class", function (p) {
                 return p.tipo;
                 })
                 .text(function (p) {
                 return p.texto;
                 });*/
            }
        };

        _DatosCorrectos = function () {
            if (typeof(periodos) === 'array') {

            }
            return true;

        };

        //Llama a este metodo para inicializar las opciones de configuracion que sepasaron por parametro
        _init();
    };

//Fin de la libreria
})();