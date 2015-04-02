(function () {
//Inicio de lalibreria

    LineChart = function (raiz, opciones) {

        // ----------------------------- Definicion de las variables publicas--------------------
        self = this;
        self.raiz = raiz;
        self.opciones = opciones;
        self.default_options = {

            showArea: true, //muestra el area sombreada bajo la linea
            area: {color: 'lightsteelblue', opacity: '0.5'},

            showgridLines: true,
            gridLines: {color: 'lightgrey', horizontal: true, vertical: true},
            ticks: {x: 10, y: 6, vertical: 10, horizontal: 10}, //ticks del eje X and Y y la cantidad de grillas

            fontFamily: "Arial",// la Fuente
            fontSize: 12,// la Fuente

            dateFormat: "%Y-%m-%d", // Formato de la fecha

            animation: true, //Animada
            animacionType: '', // tipo de animacion
            responsive: true, //Responsiva

            tooltip: {fontFamily: 'Arial', fontColor: 'white', fontSize: 12, fillColor: 'black', borderColor: 'white'},

            showPoint: true,
            point: {radio: 2, bordeWidth: 0.5, color: 'black', borderColor: 'steelblue'},

            showPeriod: true,
            periodos: [
                {
                    texto: "1D",
                    cantidad: 1,
                    tipo: "dia",
                    activo: true
                }, {
                    texto: "5D",
                    cantidad: 5,
                    tipo: "dia",
                    activo: false
                }, {
                    texto: "1M",
                    cantidad: 1,
                    tipo: "mes",
                    activo: false
                }, {
                    texto: "3M",
                    cantidad: 3,
                    tipo: "mes",
                    activo: false
                }, {
                    texto: "6M",
                    cantidad: 6,
                    tipo: "mes",
                    activo: false
                }, {
                    texto: "YTD",
                    cantidad: 0,
                    tipo: "hasta_la_fecha",
                    activo: false
                }, {
                    texto: "1Y",
                    cantidad: 1,
                    tipo: "anno",
                    activo: false
                }, {
                    texto: "2Y",
                    cantidad: 2,
                    tipo: "anno",
                    activo: false
                }
            ],

            mouseLineIndicator: {horizontal: true, vertical: true} //muestra linea horizontal y vertical cuando se mueve el mouse por la grafica

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

        var margin = {top: 5, right: 0, bottom: 25, left: 30};
        var width = 800 - margin.left - margin.right, height = 400 - margin.top - margin.bottom;

        var colors;
        var parseDate;
        var formatFecha, formatDate, valueline;
        var x, y, xAxis, yAxis;
        var current_data; //representa los datos que se estan graficando actualemte
        var periodHeight; //height por defecto del div contenedor de los periodos
        var fechaInicio, fechaFin; //fecha inicial y fecha final selesccionada
        var inicioDominio, finDominio; //Inicio y fin de los datos cargados
        var area; //rellenar el area debajo de la grafica
        var animationTime;


        //Mezcla las opciones con las que pasa el usuario
        //Inicializa las variables y los elementos del DOM
        _init = function () {
            self.opciones = my_extend(self.default_options, self.opciones);
            _inicializarDOM_Variables_y_Eventos();
            function my_extend(options1, options2) {
                for (var key1 in options1)
                    for (var key2 in options2)
                        if (key1 == key2)
                            options1[key1] = options2[key2];
                return options1;
            }
        };


        //TODO METODO GRAFICAR
        self.graficar = function () {
            if (_DatosCorrectos()) {

                current_data = self.datos;

                var data = self.datos[0].data;

                //establece el dominio para el eje x (es decir, de donde a donde van los valores)
                x.domain(d3.extent(data, function (d) {
                    return d.date;
                }));

                //valor mayor y menos
                var min_max = d3.extent(data, function (d) {
                    return d.close;
                });

                //valor para agregarle a cada limite de la grafica en el eje Y
                //Esto es para que no quede tan pegada a los limites de la grafica la linea que se dibuja
                var add = 0;
                var tempTiksArray = y.ticks();
                if (tempTiksArray >= 2) {
                    //toma la diferencia entre 2 ticks para adicionar al limite del eje Y
                    add = tempTiksArray[1] - tempTiksArray[0];
                } else {
                    add = (min_max[1] - min_max[0]) / (parseInt(yAxis.ticks()[0]) + 1);
                }

                if (add == 0)
                    add = 1;

                min_max[0] = min_max[0] - add;
                min_max[1] = min_max[1] + add;
                y.domain(min_max);

                svg = d3.select("#" + self.raiz + " svg");

                g_main = svg.select('.g_main');

                if (self.default_options.showgridLines) {
                    if (self.default_options.gridLines.vertical) {
                        //Grillas verticales
                        g_main.append("g")
                            .attr("class", "grid x")
                            .attr("transform", "translate(0," + height + ")")
                            .call(_grillas_eje_x().tickSize(-height, 0, 0).tickFormat(""));
                    }

                    if (self.default_options.gridLines.horizontal) {
                        //Grillas horizontales
                        g_main.append("g")
                            .attr("class", "grid y")
                            .call(_grillas_eje_y().tickSize(-width, 0, 0).tickFormat(""));
                    }
                }

                if (self.default_options.showArea) {
                    //Dibuja el area debajo de la grafica
                    g_main.append("path")
                        .datum(data)
                        .attr("class", "area")
                        .style("fill", self.default_options.area.color)
                        .style("fill-opacity", +self.default_options.area.opacity)
                        .attr("d", area);
                }

                //Dibuja la linea
                g_main.append("path")
                    .datum(data)
                    .attr("clip-path", "url(#clip)")
                    .attr("class", "line line-main")
                    .attr("stroke", function (d, i) {
                        return colors(i)
                    })
                    //.attr("stroke", "#FF0066") rojo
                    //.attr("stroke", "#ff7f0e")
                    .attr("stroke-width", 1)
                    .attr("d", valueline);

                //  Adiciona el Eje Y
                g_main.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);

                //  Adiciona el eje X
                g_main.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                if (self.default_options.showPoint) {
                    g_main.selectAll('circle.mark').data(data).enter().append('circle')
                        .attr('class', 'mark')
                        .attr('fill', self.default_options.point.color)
                        .attr('stroke', self.default_options.point.borderColor)
                        .attr('stroke-width', self.default_options.point.bordeWidth)
                        .attr('cx', function (d) {
                            return x(d.date);
                        })
                        .attr('cy', function (d) {
                            return y(d.close);
                        })
                        .attr('r', self.default_options.point.radio)
                        .on('mouseover', function (d, i) {
                            d3.select(this).transition().attr('r', (self.default_options.point.radio + 4));
                        })
                        .on('mouseout', function (d, i) {
                            d3.select(this).transition().attr('r', self.default_options.point.radio);
                        })
                }

            } else {
                throw new Error("Formato de los datos incorrectos");
            }
        };

        _actualizar = function (data) {

        };

        //Inicializa el SVG, y todos los elementos necesarios para crear la grafica
        _inicializarDOM_Variables_y_Eventos = function () {

            Inicializar_Variables();


            //TODO Inicializando elemento raiz con sus propiedades
            var realWidth = width + margin.left + margin.right;
            d3.select("#" + self.raiz)
                .style("max-width", realWidth + 'px')
                .style('width', '100%');

            // TODO Crear los periodos
            if (self.default_options.showPeriod) {
                var periodos_grafica = d3.select("#" + self.raiz)
                    .append('div')
                    .attr('id', 'chart-periodos')
                    .attr('class', 'chart-periodos-container')
                    //.style('background', '#33CCCC')
                    .style('border', "1px solid #33CCCC")
                    .style('height', periodHeight + 'px');

                var periodos = periodos_grafica.append('div')
                    .attr('class', 'periodos');

                periodos.selectAll("misbotones")
                    .data(self.periodos)
                    .enter()
                    .append("button")
                    .attr("class", function (p) {
                        var clase = "btn_p btn_periodo";
                        return p.activo ? clase + " btn-active" : clase
                    })
                    .attr("type", "button")
                    .attr("data-value", function (p) {
                        return p.cantidad;
                    })
                    .attr("data-class", function (p) {
                        return p.tipo;
                    })
                    .text(function (p) {
                        return p.texto;
                    });

                //Inicializa los click en los periodos
                _click_periodos();

                var date_container = periodos_grafica.append('div')
                    .attr('class', 'date-container');

                //TODO Ponerle los eventos keypress a los input
                date_container
                    .append('input')
                    .attr('class', 'chart-input chart_start_date')
                    .attr('placeholder', '02-05-2010');

                date_container
                    .append('input')
                    .attr('class', 'chart-input chart_end_date');


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

                // TODO Tener en cuenta que si el usuario pone titulo a la grafica entonces hay que dejar mas margin.top


                //Temporalmente asigno a los periodos los que tengo por defecto
                self.periodos = self.default_options.periodos;
                periodHeight = 30; //height de los periodos

                //Para formatear Fechas a este formato
                formatFecha = d3.time.format("%Y-%m-%d");

                colors = d3.scale.category10();//escala de 10 colores de d3

                //Formato que viene la escala de tiempo en los datos
                parseDate = d3.time.format("%Y-%m-%d").parse;

                //Escala para eje X and Y
                x = d3.time.scale().range([0, width]);
                y = d3.scale.linear().range([height, 0]);

                //Eje X and Y
                xAxis = d3.svg.axis().scale(x).orient("bottom")
                    .ticks(self.default_options.ticks.x)
                    .tickFormat(d3.time.format(self.default_options.dateFormat));

                yAxis = d3.svg.axis().scale(y).orient("left")
                    .ticks(self.default_options.ticks.y);

                //Area debajo de la grafica
                area = d3.svg.area()
                    .x(function (d) {
                        return x(d.date);
                    })
                    .y0(height)
                    .y1(function (d) {
                        return y(d.close);
                    });

                // Define que valores va a graficar la linea para cada eje
                valueline = d3.svg.line()
                    .interpolate('monotone')
                    .x(function (d) {
                        return x(d.date);
                    })
                    .y(function (d) {
                        return y(d.close);
                    });

                animationTime = 750; //750 milisegundos

            }

        };

        _DatosCorrectos = function () {

            //Formatea las fechas y los valores numericos que vengan como string
            FormaterDatos();

            if (typeof(periodos) === 'array') {

            }
            return true;

            function FormaterDatos() {
                self.datos.forEach(function (dataset, i) {
                    dataset.data.forEach(function (d, pos) {
                        d.date = parseDate(d.date);
                        d.close = +d.close;
                        d.volume = +d.volume;
                    });
                });
            }

        };

        _click_periodos = function () {
            d3.select("#" + self.raiz).selectAll('.btn_p').on('click', function (periodo) {

            });
        };



        _grillas_eje_x = function () {
            return d3.svg.axis().scale(x).orient("bottom").ticks(self.default_options.ticks.vertical);
        };

        _grillas_eje_y = function () {
            return d3.svg.axis().scale(y).orient("left").ticks(self.default_options.ticks.horizontal);
        };

        //Llama a este metodo para inicializar las opciones de configuracion que sepasaron por parametro
        _init();
    };

//Fin de la libreria
})();