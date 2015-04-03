(function () {
//Inicio de lalibreria

    LineChart = function (raiz, opciones) {

        // ----------------------------- Definicion de las variables publicas--------------------
        self = this;
        self.raiz = raiz;
        self.opciones = opciones;
        self.default_options = {

            showArea: true, //muestra el area sombreada bajo la linea
            area: {color: 'lightsteelblue', opacity: '0.1'},

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

            mouseLineIndicator: {horizontal: true, vertical: true}, //muestra linea horizontal y vertical cuando se mueve el mouse por la grafica
            lineWeight: 2 //grosor de la linea

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

        //--------------------- Variables privadas aqui--------------------------

        var margin = {top: 5, right: 0, bottom: 25, left: 30};
        var width = 800 - margin.left - margin.right, height = 400 - margin.top - margin.bottom;

        var colors;
        var parseDate;
        var formatFecha, formatDate, valueline;
        var x, y, xAxis, yAxis;
        var current_data; //representa los datos que se estan graficando actualemte
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


        //TODO METODO GRAFICAR dgfuentes
        self.graficar = function () {
            if (_DatosCorrectos()) {

                current_data = self.datos;

                var data = self.datos[0].data;

                //establece el dominio para el eje x (es decir, de donde a donde van los valores)
                x.domain(d3.extent(data, function (d) {
                    return d.date;
                }));

                //console.info(x.domain());

                ////valor mayor y menos
                //var min_max = d3.extent(data, function (d) {
                //    return d.close;
                //});

                //Determiar el valor minimo de todas las graficas
                var min = d3.min(current_data, function (dataset) {
                    return d3.min(dataset.data, function (d) {
                        return d.close
                    });
                });

                //Determina el valor maximo para el eje y
                var max = d3.max(current_data, function (dataset) {
                    return d3.max(dataset.data, function (d) {
                        return d.close
                    });
                });

                //valor para agregarle a cada limite de la grafica en el eje Y
                //Esto es para que no quede tan pegada a los limites de la grafica la linea que se dibuja
                var add = 0;
                var tempTiksArray = y.ticks();
                if (tempTiksArray >= 2) {
                    //toma la diferencia entre 2 ticks para adicionar al limite del eje Y
                    add = tempTiksArray[1] - tempTiksArray[0];
                } else {
                    add = (max - min) / (parseInt(yAxis.ticks()[0]) + 1);
                }

                if (add == 0)
                    add = 1;

                y.domain([min - add, max + add]);

                svg = d3.select("#" + self.raiz + " svg");

                g_main = svg.select('.g_main');
                var lineas = g_main.selectAll('.g_line')
                    .data(self.datos)
                    .enter() //entra a los datos one by one
                    .append('g')
                    .attr('class', function (d, i) {
                        return 'g_line line_container_' + i;
                    });


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

                //Dibuja el area debajo de la linea
                if (self.default_options.showArea) {

                    //Dibuja el area debajo de la grafica
                    lineas.append("path")
                        .datum(function (d, i) {
                            //si no esta definida o esta definida y es verdadera muestro el area
                            if (self.datos[i].showArea === undefined || self.datos[i].showArea)
                                return d.data;
                            return [];
                        })
                        .attr("class", "area")
                        .style("stroke", function (d, i) {
                            return colors(i);
                        })
                        .style("fill", function (d, i) {
                            if (self.datos[i].area) //si tiene definido la propiedad area
                                return self.datos[i].area.color;
                            else
                                return colors(i);
                        })
                        .style("fill-opacity", function (d, i) {
                            if (self.datos[i].area)
                                return +self.datos[i].area.opacity;
                            else
                                return +self.default_options.area.opacity;
                        })
                        .attr("d", area);
                }

                //Dibuja la linea
                lineas.append("path")
                    .attr("clip-path", "url(#clip)")
                    .attr("class", function (d, i) {
                        return "line line_" + i;
                    })
                    .attr('d', function (d, i) {
                        return valueline(d.data);
                    })
                    .attr("stroke", function (d, i) {
                        return colors(i);
                    })
                    .style("stroke-width", function (d, i) {
                        console.info(d.lineWeight);
                        if (d.lineWeight)
                            return +d.lineWeight;
                        return +self.default_options.lineWeight
                    });

                //  Adiciona el Eje Y
                g_main.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);

                //  Adiciona el eje X
                g_main.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                //Adicionar los puntos
                if (self.default_options.showPoint) {

                    lineas.selectAll('circle.mark')
                        .data(function (d) {
                            return d.data;
                        })
                        .enter()
                        .append('circle')
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
                        });
                }

            }
            else {
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

            //Creando el SVG
            svg = d3.select("#" + self.raiz)
                .append('div')
                .attr('class', 'chart-container')
                .style('border', '1px solid black')
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

            //TODO Comprobar para datos y default que lineWeight va de 1 a 5

            //Formatea las fechas y los valores numericos que vengan como string
            formaterDatos();

            if (typeof(self.datos) === 'array') {

            }
            return true;

            function formaterDatos() {
                self.datos.forEach(function (dataset) {
                    dataset.data.forEach(function (d) {
                        d.date = parseDate(d[dataset.mapDate]);
                        d.close = +d[dataset.mapValue];
                    });
                });
            }

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
})
();