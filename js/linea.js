(function () {
//Inicio de lalibreria

    LineChart = function (raiz, opciones) {

        // ----------------------------- Definicion de las variables publicas--------------------
        self = this;
        self.raiz = raiz;
        self.opciones = opciones;
        self.default_options = {

            background: "#F0F6FD",
            width: 550,
            height: 300,

            showArea: true, //muestra el area sombreada bajo la linea
            area: {color: 'lightsteelblue', opacity: 0.1},

            showgridLines: true,
            gridLines: {color: 'lightgrey', horizontal: true, vertical: true},
            ticks: {x: 5, y: 5, vertical: 5, horizontal: 5}, //ticks del eje X and Y y la cantidad de grillas

            fontFamily: "Arial",// la Fuente
            fontSize: 12,// la Fuente

            /*Formatos de la escala de tiempo de los datos*/
            dateFormat: "%Y-%m-%d", // Formato de la fecha

            //Formato de la fecha del indicador cuando se mnueve el mouse
            current_dateFormat_indicator: "%b %d, %Y",

            animation: true, //Animada
            animacionType: '', // tipo de animacion
            responsive: true, //Responsiva

            showToolTip: true,
            tooltip: {
                fontFamily: 'Arial', // Fuente
                fontColor: 'white', // color de la fuente
                fontSize: "12px", // tamano de la fuente
                background: 'black', // background
                opacidad: 1,
                borderColor: 'red', // color de borde
                borderWidth: "0px" // ancho del borde
            },

            //Si no se especifican, salen del color de la linea
            showPoint: true,
            point: {radio: 3.5, bordeWidth: 1.5, color: 'steelblue', borderColor: 'white'},

            showLineIndicator: true,
            mouseLineIndicator: {horizontal: true, vertical: true}, //muestra linea horizontal y vertical cuando se mueve el mouse por la grafica
            lineWeight: 2, //grosor de la linea

            // Valor que se va a graficar de los datos.
            mapValue: 'close',

            // Valor que representa la escala de tiempo en los datos
            mapDate: 'date'

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

        var margin, width, height;

        var colors;
        var parseDate;
        var valueline;
        var x, y, xAxis, yAxis;
        var current_data; //representa los datos que se estan graficando actualemte
        var area; //rellenar el area debajo de la grafica
        var animationTime;
        var current_date_width, current_date_height;
        var svg;
        var bisectDate;


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

                //Determiar el valor minimo para el eje x, de todos los datos
                var minDate = d3.min(current_data, function (dataset) {
                    return d3.min(dataset.data, function (d) {
                        return d.date
                    });
                });

                //Determina el valor maximo para el eje x
                var maxDate = d3.max(current_data, function (dataset) {
                    return d3.max(dataset.data, function (d) {
                        return d.date
                    });
                });

                //establece el dominio para el eje x (es decir, de donde a donde van los valores)
                x.domain([minDate, maxDate]);

                //Determiar el valor minimo para el eje y, de todos los datos
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

                //Dibujar las lineas
                var lineas = g_main.selectAll('.g_line')
                    .data(self.datos)
                    .enter() //entra a los datos one by one
                    .append('g')
                    .attr('class', function (d, i) {
                        return 'g_line line_container_' + i;
                    });

                lineas.transition();

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
                    .datum(function (d) {
                        return d.data;
                    })
                    .attr("clip-path", "url(#clip)")
                    .attr("class", function (d, i) {
                        return "line line_" + i;
                    })
                    .attr('d', valueline)
                    .attr("stroke", function (d, i) {
                        return colors(i);
                    })
                    .style("stroke-width", function (d, i) {
                        if (d.lineWeight)
                            return +d.lineWeight;
                        return +self.default_options.lineWeight
                    });

                yAxis.tickFormat(d3.format("s"));

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
                            //Si esta definida la propiedad
                            if (d.showPoint || d.showPoint === undefined)
                                return d.data;
                            return [];
                        })
                        .enter()
                        .append('circle')
                        .attr('class', function (d, i) {
                            //Oculata el 1er punto de la linea
                            return 'mark circle_' + i;
                        })
                        .attr('fill', function (d, i, posData) {
                            return _getPointFill(posData);
                        })
                        .attr('stroke', function (d, i, posData) {
                            return _getPointBorderColor(posData);
                        })
                        .attr('stroke-width', function (d, i, posData) {
                            return _getPointBorderWidth(posData);
                        })
                        .attr('cx', function (d) {
                            return x(d.date);
                        })
                        .attr('cy', function (d) {
                            return y(d.close);
                        })
                        .attr('r', function (d, i, posData) {
                            return _getPointRadio(posData);
                        });
                }

                var focus = g_main.select(".focus");

                // append the circle para moverlo en la interseccion
                //focus.append("circle")
                //    .attr("class", "y")
                //    .style("fill", "none")
                //    .style("stroke", "blue")
                //    .attr("r", 4);

                //Rectangulo para mostrar las lineas discontinuas y capturar
                //el mouse cuando se mueve
                g_main.append("rect")
                    .attr("class", "mouse-move")
                    .attr("width", width)
                    .attr("height", height)
                    .style("fill", "none")
                    .style("pointer-events", "all") //captura todos los eventos del mouse
                    .on("mouseover", function () {
                        focus.style("display", null);
                        d3.select('.current_date').classed('hidden', false);
                        d3.select("#" + self.raiz).select(".info").classed('hidden', false);
                    })
                    .on("mouseout", function () {
                        focus.style("display", "none");
                        d3.select('.current_date').classed('hidden', true);
                        d3.select("#" + self.raiz).select(".info").classed('hidden', true);
                    })
                    .on("mousemove", _mousemove);

                _resize();
            }
            else {
                throw new Error("Formato de los datos incorrectos");
            }
        };


        _mousemove = function () {
            var g_main = svg.select('.g_main');
            var focus = g_main.select(".focus");
            var g_lines = null;

            var x0 = x.invert(d3.mouse(this)[0]);
            var dd = null;

            var current_info = d3.select("#" + self.raiz).select(".current_info");
            self.datos.forEach(function (dataset, posData) {
                g_lines = g_main.select('.line_container_' + posData);
                var posx = 0;
                var ii = bisectDate(dataset.data, x0, 1);
                var d0 = dataset.data[ii - 1];
                var d1 = dataset.data[ii];
                var d = x0 - d0.date > d1.date - x0 ? d1 : d0;

                //Le sume 1 para obtener la pos exacta
                if (x0 - d0.date > d1.date - x0) {
                    posx = (ii);
                    dd = d1;
                } else {
                    posx = (ii - 1);
                    dd = d0;
                }

                if (self.default_options.showPoint) {
                    var current_circle = g_lines.select(".circle_" + posx);

                    if (current_circle.attr('class').indexOf('activo') == -1) {
                        /*Desactivo el que estaba y activo el nuevo*/
                        var estaba = g_lines.select('circle.activo');
                        estaba.classed('activo', false); //le quito la clase activo
                        estaba.transition().attr('r', _getPointRadio(posData)); //le actualizo su radio

                        //Activo el nuevo y le pongo su nuevo radio
                        current_circle.classed('activo', true);
                        current_circle.transition().attr('r', 6);
                    }
                }

                if (self.default_options.showToolTip) {
                    var value = d3.format(",.2f")(dd.close);
                    var result = current_info.select("div[data-titulo='" + dataset.titulo + "']");
                    if (result.empty()) {
                        current_info.append('div')
                            .attr('data-titulo', dataset.titulo)
                            .html('<b>' + dataset.titulo + ':</b> ' + value);
                    } else {
                        result.html('<b>' + dataset.titulo + ':</b> ' + value);
                    }
                } // fin de show Tooltips


                if (self.default_options.showLineIndicator) {
                    //Mover las lineas indicadoras
                    if (self.default_options.mouseLineIndicator.vertical) {
                        focus.select(".x")
                            .attr("transform", "translate(" + x(d.date) + ",0)")
                            .attr("y2", height);
                    }

                    if (self.default_options.mouseLineIndicator.horizontal) {
                        focus.select(".y")
                            .attr("transform", "translate(" + width * -1 + "," + y(d.close) + ")")
                            .attr("x2", width + width);
                    }
                } //fin mostrar lineas discontinuas

            }); //Fin del foreach

            var tooltip_date = d3.select("#" + self.raiz).select('.tooltip');

            var parser = d3.time.format(self.default_options.current_dateFormat_indicator);
            tooltip_date.select('div').text(parser(dd.date));
            var tooltip_date_width = parseInt(tooltip_date.style('width'));

            tooltip_date
                .style('left', (x(dd.date) + margin.left + 7 - (tooltip_date_width / 2)) + "px")
                .style('top', (height + 13 ) + "px");

            if (self.default_options.showToolTip) {
                d3.select("#" + self.raiz).select('.info').style('left', (x(dd.date) + margin.left + 20) + "px")
                    .style('top', (y(dd.close) + margin.top - (45 / 2)) + "px");
            }
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
                //.style('border', '1px solid black')
                .style('width', '100%')
                .append("svg")
                .attr("id", "chart-svg")
                .style("background", self.default_options.background)
                //.style("background", "rgba(51, 204, 204, 0.20)")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

            svg.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width)
                .attr("height", height);

            g_main = svg.append("g")
                .attr('class', 'g_main')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            focus = g_main.append("g")
                .attr("class", "focus")
                .style("display", "none");

            //Lineas discontinuas Indicadores cuando se mueve el mouse.
            focus.append("line")
                .attr("class", "x")
                .style("stroke", "black")
                .style("stroke-dasharray", "3,3")
                //.style("opacity", 0.5)
                .attr("y1", 0)
                .attr("y2", height);

            // append the y line
            focus.append("line")
                .attr("class", "y")
                .style("stroke", "black")
                .style("stroke-dasharray", "3,3")
                //.style("opacity", 0.5)
                .attr("x1", width)
                .attr("x2", width);

            /*--------------- Tooltips ---------------*/
            // Current Date Indicator
            d3.select("#" + self.raiz)
                .append('div')
                .attr('class', 'tooltip current_date hidden')
                .style('left', '100%')
                .append('div')
                .attr('class', 'current_date_text');

            // Current Date Indicator
            d3.select("#" + self.raiz)
                .append('div')
                .attr('class', 'tooltip info hidden')
                .style('left', '100%')
                .style("background", self.default_options.tooltip.background)
                .style("font-family", self.default_options.tooltip.fontFamily)
                .style("font-size", self.default_options.tooltip.fontSize)
                .style("opacity", self.default_options.tooltip.opacidad)
                .style("border-width", self.default_options.tooltip.borderWidth)
                .style("border-color", self.default_options.tooltip.borderColor)
                .append('div')
                .attr('class', 'current_info');

            function Inicializar_Variables() {

                margin = {top: 5, right: 8, bottom: 25, left: 40};
                width = (+self.default_options.width) - margin.left - margin.right, height = (+self.default_options.height) - margin.top - margin.bottom;


                // TODO Tener en cuenta que si el usuario pone titulo a la grafica entonces hay que dejar mas margin.top

                current_date_width = 100;
                current_date_height = 25;

                colors = d3.scale.category10();//escala de 10 colores de d3

                //Formato que viene la escala de tiempo en los datos
                parseDate = d3.time.format(self.default_options.dateFormat).parse;

                bisectDate = d3.bisector(function (d) {
                    return d.date;
                }).left;

                //Escala para eje X and Y
                x = d3.time.scale().range([0, width]);
                y = d3.scale.linear().range([height, 0]);

                //Eje X and Y
                xAxis = d3.svg.axis().scale(x).orient("bottom")
                    .ticks(self.default_options.ticks.x);

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
                    if (dataset.dateFormat) //si esta definida
                        parseDate = d3.time.format(dataset.dateFormat).parse;
                    dataset.data.forEach(function (d) {
                        if (dataset.mapDate) //si esta definida
                            d.date = parseDate(d[dataset.mapDate]);
                        else
                            d.date = parseDate(d[self.default_options.mapDate]);

                        if (dataset.mapValue)
                            d.close = +d[dataset.mapValue];
                        else
                            d.close = +d[self.default_options.mapValue];
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

        /*-------------------- datos de los PUNTOS --------------------*/
        _getPointFill = function (posData) {
            if (self.datos[posData].point) {
                if (self.datos[posData].point.color)//si esta definida
                    return self.datos[posData].point.color;
                else if (self.datos[posData].color)
                    return self.datos[posData].color;
            }
            return colors(posData);
        };
        _getPointRadio = function (posData) {
            if (self.datos[posData].point)
                if (self.datos[posData].point.radio) //si esta definida para esa linea
                    return self.datos[posData].point.radio;
            return self.default_options.point.radio;
        };

        _getPointBorderColor = function (posData) {
            if (self.datos[posData].point)
                if (self.datos[posData].point.borderColor)
                    return self.datos[posData].point.borderColor;
            return self.default_options.point.borderColor;
        };

        _getPointBorderWidth = function (posData) {
            if (self.datos[posData].point)
                if (self.datos[posData].point.borderWidth)
                    return self.datos[posData].point.borderWidth;
            return self.default_options.point.borderWidth;
        };

        //Responsive chart
        _resize = function () {
            d3.select(window).on('resize', resize);
            var w = parseInt(d3.select("#" + self.raiz).select('.chart-container').style("width")) - margin.left;
            var ticksCalculator = d3.scale.linear().domain([0, w]).range([0, +self.default_options.ticks.x]);
            resize();

            function resize() {

                w = parseInt(d3.select("#" + self.raiz).select('.chart-container').style("width"));

                var wr = (w - margin.left - margin.right);

                //Actualizo el ancho del svg
                svg.attr('width', w);
                svg.select('defs').select('rect').attr('width', wr);

                // Cambiar ancho del mouse-move
                svg.select(".mouse-move")
                    .attr("width", wr);

                //Actualizo el rango de los datos
                x.range([0, wr]);
                y.range([height, 0]);

                //Actializo la cantidad de ticks
                xAxis.ticks(parseInt(ticksCalculator(wr)));

                //Actualizo el eje X
                svg.selectAll('.x.axis')
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                svg.selectAll('.line')
                    .attr("d", valueline);

                // Actualizo las grillas
                if (self.default_options.showgridLines) {
                    if (self.default_options.gridLines.vertical) {
                        //Actualizar lineas tranparentes
                        svg.select(".g_main").select("g.grid.x")
                            .call(_grillas_eje_x()
                                .tickSize(-height, 0, 0)
                                .tickFormat("")
                        );
                    }

                    if (self.default_options.gridLines.horizontal) {
                        svg.select(".g_main").select("g.grid.y")
                            .call(_grillas_eje_y()
                                .tickSize(-wr, 0, 0)
                                .tickFormat("")
                        );
                    }
                }

                //Actualizar area
                svg.select('.g_main').selectAll('.area')
                    .attr('d', area);

            }
        };

        //Llama a este metodo para inicializar las opciones de configuracion que sepasaron por parametro
        _init();

    };

//Fin de la libreria
})
();