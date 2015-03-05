if (typeof Object.create !== 'function') {
    Object.create = function (obj) {
        function F() {
        };
        F.prototype = obj;
        return new F();
    };
}

(function () {
    var mi_grafica = {

        configuracion: {
            id: "#chart", // id del elemento contenedor de la grafica, Debe estar creado previamente en el html de la pagina
            colores: [],
            valor: 5,
            width: 850, //ancho de la grafica por defecto
            height: 500, // alto de la grafica de linea
            margin: {top: 5, right: 50, bottom: 150, left: 80},

            height2: 100, // alto de la grafica de barra
            margin2: {top: 50, realtop: 0, bottom: 0},

            margin3: {top: 50, realtop: 0, bottom: 0},
            height3: 80, // alto del brush
            titulo: "Acciones"
        },
        datos: [], // cada uno tiene un objeto con titulo, datos, color
        comparaciones: [], //aqui van las comparaciones que se realizan entre acciones de empresas
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
        ], //cada periodo tiene texto, cantidad,seleccionado,
        init: function (configuracion) {
            this.configuracion = jQuery.extend({}, this.configuracion, configuracion);
            return this;
        },

        _m_graficar_comparaciones: function () {
            var maxValue_porciento = 0, minValue_porciento = 0;

            var wrapper = d3.select(".leyenda>.wrapper");
            //Dominio para el eje Y
            self.comparaciones["datos"].forEach(function (data, i) {
                var tempMaxValue = d3.max(data, function (d) {
                    return +d.porciento;
                });

                maxValue_porciento = maxValue_porciento < tempMaxValue ? tempMaxValue : maxValue_porciento;

                var tempMinValue = d3.min(data, function (d) {
                    return +d.porciento;
                });
                minValue_porciento = minValue_porciento > tempMinValue ? tempMinValue : minValue_porciento;

                //Agregando leyenda para cada uno de los simbolos
                var sel = wrapper.select('span[data_simbolo="' + self.comparaciones["simbolos"][i] + '"]');
                if (sel.empty()) {
                    var p = wrapper.append("p");
                    p.append("span").attr("data_simbolo", self.comparaciones["simbolos"][i]);
                }
            });

            //valor adicional para sumarle a los ejes
            var add = 0;
            var tempTiksArray = y.ticks();
            if (tempTiksArray > 2) {
                //toma la diferencia entre 2 ticks para adicionar a la grafica uno mas
                add = tempTiksArray[1] - tempTiksArray[0];
            } else {
                add = (maxValue_porciento - minValue_porciento) / (parseInt(yAxis.ticks()[0]) + 1);
            }

            //Actualizo el dominio del eje x
            x.domain(d3.extent(self.comparaciones["datos"][0], function (d) {
                return d.date;
            }));

            y.domain([minValue_porciento - add, maxValue_porciento + add]);

            yAxis.tickFormat(function (tickValue) {
                if (tickValue == "0")
                    return tickValue + "%";
                else if (parseFloat(tickValue.toFixed(2)) == '-0')
                    return "0%";
                else
                    return tickValue.toFixed(2) + "%";
            });

            //Dominio para la grafica de barra
            x2.domain(self.comparaciones["datos"][0].map(function (d) {
                return d.date;
            }));

            //Borrar las lineas que estaban, actualmente, pero luego las voy a ocultar simplemente
            svg.selectAll("path.line-porciento").remove();

            //Oculto el circulo de la grafica principal
            focus.select('circle.y').classed("hidden", true);

            // Selecciono el elemento donde voy a comenzar la transicion
            main_svg = d3.select("#chart-container>svg");
            //.transition()
            //.duration(animation_time);

            //Repinta las lineas de la grilla para el eje X
            main_svg.select("g.grid.x")
                .call(dibujar_eje_x(x)
                    .tickSize(-self.configuracion.height, 0, 0)
                    .tickFormat("")
            );

            //Repinta las lineas de la grilla para el eje Y
            main_svg.select("g.grid.y")
                .call(dibujar_eje_y(y)
                    .tickSize(-self.configuracion.width, 0, 0)
                    .tickFormat("")
            );

            var linea_porciento = d3.svg.line()
                .x(function (d) {
                    return x(d.date);
                })
                .y(function (d) {
                    return y(d.porciento);
                });

            //oculto la linea que estaba dibujada, la principal
            main_svg.select(".line-main").classed("hidden", true);

            //construct an ordinal scale with 10 categorical colors.
            var color = d3.scale.category10();

            var g_main = main_svg.select(".g-main");

            self.comparaciones["datos"].forEach(function (data, i) {
                //agregando las lineas
                g_main.append("path")
                    .datum(data)
                    .attr("class", "line line-porciento")
                    .attr("data_titulo", self.comparaciones['simbolos'][i])
                    .attr("stroke", self.comparaciones['colores'][i])
                    .attr("d", linea_porciento);

                //agregando el punto que se va a mover por cada linea, cuando se mueva el mouse
                var circulo = focus.select('circle[data_simbolo="' + self.comparaciones['simbolos'][i] + '"]');
                if (circulo.empty()) {
                    focus.append("circle")
                        .attr("class", "circle-porciento")
                        .attr("data_simbolo", self.comparaciones['simbolos'][i])
                        .style("fill", self.comparaciones['colores'][i]) //color de relleno del circulo
                        .attr("r", 4);
                }
            });

            //Actualizo el eje X
            svg.select(".x.axis")
                .call(xAxis);

            //Actualizo el eje Y
            svg.select(".y.axis")
                .call(yAxis);

            var total = self.comparaciones["datos"][0].length - 1;
            var fechaInicio = self.comparaciones["datos"][0][0].date;
            var fechaFin = self.comparaciones["datos"][0][total].date;
            var data = self._m_obtener_datos_de_intervalo(fechaInicio, fechaFin, self.datos[0].titulo);

            y2.domain([0, d3.max(data, function (d) {
                return d.volume;
            })]);

            y2_1.domain(y2.domain());

            focus_barra.select(".y.axis")
                .call(yAxis2);

            //Actualizar grafica de barras
            self._m_graficar_barras(data);

            //// Seleccionar los elementos, y los enlazo con los datos
            //var bars = focus_barra.selectAll("rect")
            //    .data(data, function (d) {
            //        return d.volume;
            //    });
            //
            //// Aplico los nuevos datos
            //bars.enter()
            //    .append("rect")
            //    .attr("fill", "steelblue")
            //    .attr("class", "bar")
            //    .attr("x", function (d) {
            //        return x2(d.date);
            //    })
            //    .attr("y", function (d) {
            //        return y2(d.volume);
            //    })
            //    .attr("width", x2.rangeBand())
            //    .attr("height", function (d) {
            //        return self.configuracion.height2 - y2(d.volume);
            //    });
            //
            //bars.exit().remove();
            //
            //// Inica la actualizacion de los datos
            //bars
            //    .transition()
            //    .duration(animation_time)
            //    .attr("x", function (d) {
            //        return x2(d.date);
            //    })
            //    .attr("y", function (d) {
            //        return y2(d.volume);
            //    })
            //    .attr("width", x2.rangeBand())
            //    .attr("height", function (d) {
            //        return self.configuracion.height2 - y2(d.volume);
            //    });

            //Lo elimino y lo dibujo nuevamente
            //focus_barra.select(".x.axis").remove();
            //focus_barra.append("g")
            //    .attr("class", "x axis")
            //    .attr("transform", "translate(0," + self.configuracion.height2 + ")")
            //    .append("line")
            //    .attr("class", "line-bottom")
            //    .attr("x1", "0")
            //    .attr("x2", self.configuracion.width)
            //    .style("stroke", "black")
            //    .style("opacity", "1");

            //MOUSE MOVE COMPARACIONES
            var rectangulo = self._m_crear_rect_mouse_move_datos(svg);
            self._m_mouse_move_comparaciones(rectangulo, data);
        },
        /** Calcula los datos de las comparaciones para la empresa que se le pase por parametro */
        _m_calcular_porciento: function (fechaInicio, fechaFin, pos, simbolo) {
            /** Coger los datos de esa empresa en el periodo seleccionado */
            var data = self._m_obtener_datos_de_intervalo(fechaInicio, fechaFin, simbolo);
            self.comparaciones["datos"][pos] = []; //limpio los datos que habian
            var baseValue = +data[0].close; //dia 0 del periodo que voy a analizar
            data.forEach(function (d, i) {
                var tempValue = +data[i].close;
                var t = (tempValue / baseValue) - 1;
                self.comparaciones["datos"][pos].push({
                    porciento: +t.toFixed(2), //redondeo a 2 lugares
                    date: d.date,
                    close: d.close
                });
            });
        },

        //Calcula el porciento solo para la empresa base, la 1ra de la grafica
        _m_calcular_porciento1: function (data) {
            self.comparaciones["datos"][0] = [];
            var baseValue = +data[0].close; //dia 0 del periodo que voy a analizar
            data.forEach(function (d, i) {
                var tempValue = +data[i].close;
                var t = (tempValue / baseValue) - 1;
                self.comparaciones["datos"][0].push({
                    porciento: +t.toFixed(2), //redondeo a 2 lugares
                    date: d.date,
                    close: d.close
                });
            });
        },

        _m_btn_comparar: function () {
            d3.selectAll("a.comparadores").on("click", function () {
                self.comparando = true;
                var valor = parseInt(d3.select(this).attr("data-value"));
                var simbolo = d3.select(this).attr("data-empresa");

                //Revisar que no este entre los comparadores que tengo
                var pos = self.comparaciones["simbolos"].indexOf(simbolo);
                if (pos == -1) {
                    //Agrego el simbolo y preparo arreglo apra sus datos
                    self.comparaciones["simbolos"].push(simbolo);
                    self.comparaciones["colores"].push(self.datos[valor].color);
                    self.comparaciones["datos"].push([]);
                    pos = self.comparaciones['simbolos'].length - 1;
                }
                var start = jQuery("#chart_start").val();
                var end = jQuery("#chart_end").val();
                var fechaInicio = parseDate(start);
                var fechaFin = parseDate(end);

                var span = d3.select(this).select("span");
                var dataOperacion = span.attr("data-operacion");
                if (dataOperacion == "+") {

                    for (var i = 0; i < self.comparaciones['simbolos'].length; i++)
                        self._m_calcular_porciento(fechaInicio, fechaFin, i, self.comparaciones['simbolos'][i]);

                    span.style("background", "red");
                    span.attr("data-operacion", "-");
                    span.text("-");
                    self._m_graficar_comparaciones();
                } else {
                    span.style("background", "green");
                    span.attr("data-operacion", "+");
                    span.text("+");

                    // Elimina la linea que se selecciono
                    //Elimino la linea y su circulo
                    chart_container.select('path.line-porciento[data_titulo="' + simbolo + '"]').remove();
                    d3.selectAll('circle[data_simbolo="' + simbolo + '"]').remove();

                    //Eliminarlo tambien de la leyenda
                    chart_container.selectAll('span[data_simbolo="' + simbolo + '"]').remove();

                    //Elimino los datos para esa linea del arreglo de comparaciones
                    pos = self.comparaciones["simbolos"].indexOf(simbolo);
                    if (pos > -1) {
                        self.comparaciones["simbolos"].splice(pos, 1);
                        self.comparaciones["datos"].splice(pos, 1);
                        self.comparaciones["colores"].splice(pos, 1);
                    }

                    //Si queda 1 sola comparacion
                    if (self.comparaciones["simbolos"].length == 1) {
                        var simbolo_base = self.datos[0].titulo;

                        // Actualizo la variable comparando a false
                        self.comparando = false;

                        // Elimino el circulo
                        focus.select('circle[data_simbolo="' + simbolo_base + '"]').remove();

                        // Eliminarle el span de la leyenda
                        chart_container.select('span[data_simbolo="' + simbolo_base + '"]').remove();

                        // Eliminar la linea de porciento
                        chart_container.select('path[data_titulo="' + simbolo_base + '"]').remove();

                        // Obtengo los datos de ese periodo y los grafico
                        var data = self._m_obtener_datos_de_intervalo(fechaInicio, fechaFin, self.datos[0].titulo);
                        self._m_actualizar_grafica(data);
                    } else {
                        self._m_graficar_comparaciones();
                    }

                }
            });
        },

        _m_actualizar_cambio_fecha: function () {
            var start = jQuery("#chart_start").val();
            var end = jQuery("#chart_end").val();
            var fechaInicio = parseDate(start);
            var fechaFin = parseDate(end);
            // Obtener los datos de ese intervalo y luego actualizar la grafica
            var data = self._m_obtener_datos_de_intervalo(fechaInicio, fechaFin, self.datos[0].titulo);
            if (data.length > 0) {
                if (!self.comparando) {
                    self._m_calcular_porciento1(data);
                    self._m_actualizar_grafica(data);
                }
                else {
                    //En este cqaso cambia el intervalo por lo que hay que calcular nuevamente todos los porcientos de las empresas
                    // e indicadores que se estban comparando.
                    self.comparaciones["simbolos"].forEach(function (simbolo, i) {
                        self._m_calcular_porciento(fechaInicio, fechaFin, i, simbolo);
                    });
                    self._m_graficar_comparaciones();
                }
            }
            return false;
        },

        _m_actualizar_grafica: function (data) {

            //Actualizo el dominio de los ejes
            x.domain(d3.extent(data, function (d) {
                return d.date;
            }));

            var min = d3.min(data, function (d) {
                return d.close;
            });

            var max = d3.max(data, function (d) {
                return d.close;
            });

            //valor adicional para sumarle a los ejes
            var add = 0;
            var tempTiksArray = y.ticks();
            if (tempTiksArray > 2) {
                //toma la diferencia entre 2 ticks para adicionar a la grafica uno mas
                add = tempTiksArray[1] - tempTiksArray[0];
            } else
                add = (max - min) / (parseInt(yAxis.ticks()[0]) + 1);

            y.domain([min - add, max + add]);


            //Dominio para la grafica de barra
            x2.domain(data.map(function (d) {
                return d.date;
            }));

            y2.domain([0, d3.max(data, function (d) {
                return d.volume;
            })]);

            y2_1.domain(y2.domain());

            // Actualizando rango del brush
            brush.extent(x.domain());

            //Esto es porque para las comparaciones le habia puesto un porciento
            yAxis.tickFormat(function (tickValue) {
                
                return tickValue;
            });

            // MOSTRAR TODAS LAS COSAS QUE ESTABAN OCULTAS, SI HAY
            //SI la linea esta oculta la muestra, para luego actualizarla
            focus.select('circle.y').classed("hidden", false);
            chart_container.select(".line-main").classed("hidden", false);
            /*Este elemento anterior lo seleccione a partir del chart container para que se pudiera animar,
             * si lo senalo con el main_svg se cancela el transition y da error.
             * */


            chart_container.select(".line-main").datum(data);

            main_svg = d3.select("#chart-container>svg")
                .transition()
                .duration(animation_time)
                .ease('elastic');

            //Actualiza los valores del eje x en las grillas
            main_svg.select("g.grid.x")
                .call(dibujar_eje_x(x)
                    .tickSize(-self.configuracion.height, 0, 0)
                    .tickFormat("")
            );

            //Repinta las lineas de la grilla para el eje Y
            main_svg.select("g.grid.y")
                .call(dibujar_eje_y(y)
                    .tickSize(-self.configuracion.width, 0, 0)
                    .tickFormat("")
            );

            //Actualizo los valores de la linea
            main_svg.select(".line-main")
                //.datum(data)
                .attr("d", valueline);

            //Actualizo el eje X
            main_svg.select(".x.axis")
                .call(xAxis);

            //Actualizo el eje Y
            main_svg.select(".y.axis")
                .call(yAxis);

            //Actualizo el brush
            //main_svg.select(".brush").transition().duration(animation_time).call(brush);
            //d3.select("g.brush").transition().duration(animation_time).call(brush);
            chart_container.select(".brush").transition().call(brush);


            //Actualiza la grafic ade barras
            self._m_graficar_barras(data);

            //Mouse move por DATOS
            var rectangulo = self._m_crear_rect_mouse_move_datos(svg);
            self._m_mouse_move_datos(rectangulo, data);
        },

        _m_evento_click_periodos: function () {
            //Click en los botones
            d3.selectAll(".m").on("click", function () {
                var cant = parseInt(d3.select(this).attr('data-value'));
                var tipo = d3.select(this).attr('data-class');
                var fechaInicio = self._m_obtener_fechaInicio(tipo, cant);
                var data = self._m_obtener_datos_de_intervalo(fechaInicio, null, self.datos[0].titulo);
                if (data == null || data.length == 0)
                    return; //Aqui no tengo que dar el mensaje de error
                var fechaFin = data[data.length - 1].date;
                if (data.length > 0) {
                    jQuery("#chart_start").val(formatFecha(fechaInicio));
                    jQuery("#chart_end").val(formatFecha(fechaFin));
                    if (!self.comparando) {
                        self._m_calcular_porciento1(data);
                        self._m_actualizar_grafica(data);
                    }
                    else {
                        self.comparaciones["simbolos"].forEach(function (simbolo, i) {
                            self._m_calcular_porciento(fechaInicio, fechaFin, i, simbolo);
                        });
                        self._m_graficar_comparaciones();
                    }
                }
                return false;
            });
        },

        /** Dev los datos de el intervalo selccionado*/
        _m_obtener_datos_de_intervalo: function (fechaInicio, fechaFin, simbolo) {
            //Si no se pasa la fecha final, se toma el fin de los datos
            var pos = self.comparaciones["simbolos"].indexOf(simbolo);
            if (pos == -1) {
                console.error("_m_obtener_datos_de_intervalo -> Simbolo '" + simbolo + "' no encontrado");
                return;
            }
            var data = self.datos[pos].data;
            var total = data.length - 1;
            if (!fechaFin || fechaFin == null) {
                fechaFin = data[total].date;
            }

            var inicioDominio = data[0].date;
            var finDominio = data[total].date;

            //Si es valido el intervalo
            if (fechaInicio >= inicioDominio && fechaFin <= finDominio) {
                if (fechaInicio < fechaFin) {

                    var posStart = -1, posEnd = -1;
                    for (var i = 0; i < data.length; i++) {
                        if (posStart != -1 && posEnd != -1)
                            break;

                        var d = data[i];
                        // Si no ha encontrado el valor de posStart
                        if (posStart == -1)
                            posStart = formatFecha(d.date) == formatFecha(fechaInicio) ? i : -1;

                        //Si no ha encontrado el valor de posEnd
                        if (posEnd == -1)
                            posEnd = formatFecha(d.date) == formatFecha(fechaFin) ? i : -1;
                    }

                    /**Cuando termina este ciclo si todavia no ha encontrado la posicion entoences
                     * Si posStart = -1 todavia es porque pidieron una fecha de la cual no hay datos
                     * por lo tanto hay que buscar para atras la fecha mas cercana a esta, ejemplo.
                     *
                     * Si tengo datos del dia 1,2,3,4,8 y 9. y me piden los datos del día 7 al 9
                     * entonces debo mostrar los del dia 4 al 9, porque los anteriores (7,6,5) no tienen datos.
                     *
                     * Si postEnd = -1  y me piden por ejemplo del dia 4 al 6, entoences tengo que buscar para adelante
                     * por lo que luego de aplicar el algoritmo que tengo que implementar, se mostrarian los datos del 4 al 8,
                     * ya que no hay datos ni el 6, ni el dia 7
                     * */

                    if (posStart == -1) { //busco la fecha anterior a ella mas cercana
                        posStart = _buscar_fecha_correcta(inicioDominio, finDominio, data, fechaInicio, false);
                    }

                    if (posEnd == -1) { //busco la fecha posterior mas cercana
                        posEnd = _buscar_fecha_correcta(inicioDominio, finDominio, data, fechaInicio, true);
                    }

                    if (posStart != -1 && posEnd != -1) {
                        return data.slice(posStart, posEnd + 1);
                    } else {
                        //devuelve un arreglo vacio porque para ese intervalo no hay datos,
                        //debido a que el intervalo esta fuera del dominio.
                        console.error("_m_obtener_datos_de_intervalo -> No hay datos para este intervalo");
                        return [];
                    }
                }
                else {
                    console.error("_m_obtener_datos_de_intervalo -> Fecha inicio mayor que fecha final");
                    return [];
                }

            }
            else {
                console.error("_m_obtener_datos_de_intervalo -> No hay datos para este intervalo");
                return [];
            }

            // Buscar fecha correcta, hacia alante o hacia atrás, en dependencia de la varaible direccion
            // direccion = false, busca hacia atras, direccion = true, busca hacia adelante

            function _buscar_fecha_correcta(inicioDominio, finDominio, datos, fecha, direccion) {

                /*Direccion me dice si busco hacia adelante o hacia atras la nueva fecha
                 Resumen
                 Cuando no tengo datos para el dia de la fecha inicial, entonces busco la fecha anterior mas cercana
                 Cuando no tengo datos para la fecha final que me dieron enteonces busco la fecha posterir mas cercana.
                 */

                var newFecha = fecha; // nueva fecha a encontrar
                var dias = direccion ? 1 : -1; //si direccion es true voy a buscar hacia adelante, si no, hacia atras
                var pos = -1;
                newFecha.setDate(newFecha.getDate() + dias);  // sumo o resto un dia dependiendo del valor bandera

                //mientras la fecha sea valida, este en el dominio de los datos que tengo
                while (newFecha >= inicioDominio && newFecha <= finDominio) {
                    //Busco la nuevaFecha en el arreglo
                    for (var i = 0; i < datos.length; i++) {
                        var d = datos[i];
                        if (formatFecha(d.date) == formatFecha(newFecha)) {
                            return i;
                        }
                    }
                    //Si llega aqui es porque no encontro la fecha
                    newFecha.setDate(newFecha.getDate() + dias);
                }
                return pos;
            }
        },

        /** Devuelve la fecha inicial del intervalo que se va a graficar */
        _m_obtener_fechaInicio: function (tipo, cant) {
            var total = self.datos[0].data.length - 1;
            var fechaInicio = new Date(self.datos[0].data[total].date);
            cant = parseInt(cant);
            switch (tipo) {
                case "dia":
                    fechaInicio.setDate(fechaInicio.getDate() - cant);
                    break;
                case "semana":
                    fechaInicio.setDate(fechaInicio.getDate() - cant * 7);
                    break;
                case "mes":
                    fechaInicio.setMonth(fechaInicio.getMonth() - cant);
                    break;
                case "anno":
                    fechaInicio.setYear(fechaInicio.getFullYear() - cant);
                    break;
                case "hasta_la_fecha":
                    /** hasta la 1ra fecha registrada del anno actual*/
                        // puse el 1ro de enero del anno actual, por el momento.
                    fechaInicio = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0);
                    break;
            }
            return fechaInicio;
        },

        /** Esta funcion se ejecunta inicialmente y revisa que todos los datos esten correctos*/
        _m_datos_correctos: function () {
            /** aqui hay que validar todas las opciones de configuracion,
             *  que todas tengas los datos correctos */
            return true;
        }
        ,
        /** Este metodo, devuelve un arreglo con los datos del periodo que selecciono el usuario. Ver periodos.*/
        _m_seleccionar_datos_a_graficar: function () {
            /** Entre todos los periodos, debe haber siempre 1 seleccionado*/
            var pos_selected = -1;
            for (var i = 0; i < self.periodos.length; i++) {
                if (self.periodos[i].seleccionado) {
                    pos_selected = i;
                    break;
                }
            }

            if (pos_selected == -1) { //si no habia aninguno seleccionado
                pos_selected = 0; //toma el 1er elemento de la lista y lomarca como seleccionado
                self.periodos[0].seleccionado = true;
            }
            var tipo = self.periodos[pos_selected].tipo;
            var cant = self.periodos[pos_selected].cantidad;
            //este metodo lleva 2 parametros, si no pasas la fecha final. revisar el metodo para ver que pasa.
            return self._m_obtener_datos_de_intervalo(self._m_obtener_fechaInicio(tipo, cant), null, self.datos[0].titulo);
        },

        _m_graficar_barras: function (data) {

            focus_barra.select('.y.axis').remove();
            focus_barra.append("g")
                .attr("class", "y axis")
                .call(yAxis2);

            //Elimina todos los rect que haya en la grafica
            focus_barra.selectAll("rect").remove();

            //agregando las barras a la grafica
            var bars = focus_barra.selectAll("bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("data-pos", function (d, i) {
                    return i;
                })
                .attr("fill", self.datos[0].color)
                .attr("width", x2.rangeBand())
                .attr("x", function (d) {
                    return x2(d.date);
                })
                .attr("y", self.configuracion.height2)
                .attr("height", 0);

            bars.on('mouseover', function (d) {
                tooltip.transition().style('opacity', .9);
                tooltip.html('<span class="tooltip-text">' + formatDate(d.date) + '<br/>Volume: <b>' + formato_numero(d.volume, 3, ".", ",") + '</b></span>')
                    .style('left', (d3.event.pageX ) + 'px')
                    .style('top', (d3.event.pageY - 50) + 'px');

                tempColor = this.style.fill;
                d3.select(this)
                    .transition()
                    .style('opacity', .5);
            }).on("mouseout", function (d) {
                tooltip.transition().style('opacity', 0);
                d3.select(this).transition().style('opacity', 1).style('fill', tempColor);
            });

            bars.transition()
                .duration(animation_time)
                .attr("height", function (d) {
                    return y2(d.volume);
                })
                .attr("y", function (d) {
                    return self.configuracion.height2 - y2(d.volume);
                })
                .delay(function (d, i) {
                    return i * 10;
                })
                .ease('elastic');

            //En caso de que este la borro y la creo nuevamente
            focus_barra.select('.x.axis').remove();

            //Linea final de la grafica
            focus_barra.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + self.configuracion.height2 + ")")
                .append("line")
                .attr("class", "line-bottom")
                .attr("x1", "0")
                .attr("x2", self.configuracion.width)
                .style("stroke", "black")
                .style("opacity", "1");
        },

        _m_evento_click_reset: function () {
            d3.select("#btn_reiniciar").on("click", function () {
                if (self.comparando) {
                    self.comparando = false;
                    var simbolos = self.comparaciones["simbolos"];
                    self.comparaciones["simbolos"] = simbolos.splice(0, 1);
                    self.comparaciones["colores"] = self.comparaciones["colores"].splice(0, 1);
                    self.comparaciones["datos"] = self.comparaciones["datos"].splice(0, 1);

                    for (var i = 0; i < simbolos.length; i++) {
                        chart_container.select('path.line-porciento[data_titulo="' + simbolos[i] + '"]').remove();
                        focus.select('circle[data_simbolo="' + simbolos[i] + '"]').remove();
                        chart_container.select('span[data_simbolo="' + simbolos[i] + '"]').remove();
                    }

                    var todos_span = d3.selectAll("ul.comparar span");
                    todos_span.text("+").attr("data-operacion", "+").style("background", "green");

                    // Quitarlas del arreglo comparaciones
                    // Quitar los valores del Dropdown Comparar
                    // Quitar las comparaciones de la leyenda, Todas
                    // Quitar los circulos
                    //Desmarcar los simbolos que estaban marcados (dentro del span)
                    //y de 1 vez cambiarle el fondo a color verde

                    // Luego obtener los datos
                    //y graficar los del intervalo seleccionado inicialmente por el usuario
                    var simbolo_base = self.datos[0].titulo;
                    focus.select('circle[data_simbolo="' + simbolo_base + '"]').remove();
                    chart_container.select('span[data_simbolo="' + simbolo_base + '"]').remove();
                    chart_container.select('path[data_titulo="' + simbolo_base + '"]').remove();
                }
                var data = self._m_seleccionar_datos_a_graficar();
                self._m_actualizar_grafica(data);
            });
        },
        _m_preparar_Datos: function () {
            //En esta funcion se parsean todas las fechas
            for (var i = 0; i < self.datos.length; i++) {
                var data = self.datos[i].data;
                var result = [];
                if (i == 0) {
                    data.forEach(function (d) {
                        result.push({
                            close: +d.value,
                            date: parseDate(d.date),
                            volume: +d.volume,
                            open: +d.open,
                            hight: +d.hight,
                            low: +d.low
                        });
                    });
                } else {
                    data.forEach(function (d) {
                        result.push({
                            close: +d.value,
                            date: parseDate(d.date),
                            volume: +d.volume
                        });
                    });
                }
                self.datos[i].data = result;
            }
            return true;
        },

        _m_evento_brush: function () {

            brush.on("brushend", brush_end);

            function brush_end() {
                x.domain(brush.empty() ? x_brush.domain() : brush.extent());

                var dominio = x.domain();
                var data = self.datos[0].data;

                //obtener fecha inicial
                var x0 = dominio[0];
                var fechaInicio = dominio[0];
                var ii = bisectDate(data, x0, 1);
                var d0 = data[ii - 1];
                var d1 = data[ii];
                var startPos = 0;
                if (x0 - d0.date > d1.date - x0) {
                    startPos = ii;
                    fechaInicio = d1.date;
                } else {
                    startPos = ii - 1;
                    fechaInicio = d0.date;
                }

                //obtener fecha final
                x0 = dominio[1];
                var fechaFin = dominio[1];
                ii = bisectDate(data, x0, 1);
                d0 = data[ii - 1];
                d1 = data[ii];
                var endPos = 1;
                if (x0 - d0.date > d1.date - x0) {
                    endPos = ii;
                    fechaFin = d1.date;
                } else {
                    endPos = ii - 1;
                    fechaFin = d0.date;
                }

                // El +1 es para que tome los datos hasta la posicion
                data = data.slice(startPos, endPos + 1);
                if (data.length > 0) {
                    jQuery("#chart_start").val(formatFecha(fechaInicio));
                    jQuery("#chart_end").val(formatFecha(fechaFin));
                    if (!self.comparando) {
                        self._m_calcular_porciento1(data);
                        self._m_actualizar_grafica(data);
                    }
                    else {
                        self.comparaciones["simbolos"].forEach(function (simbolo, i) {
                            self._m_calcular_porciento(fechaInicio, fechaFin, i, simbolo);
                        });
                        self._m_graficar_comparaciones();
                    }
                }
                return false;
            }
        },
        /**Metodo principal*/
        m_graficar: function () {
            self = this;
            if (!this._m_datos_correctos()) {
                console.error("m_graficar -> Configuracion de datos incorrectos");
                return;
            }
            self._m_iniciar_elementos_dom();
            self._m_btn_comparar(); //Inicializa los eventos click en el DropDown de comparar
            self._m_evento_click_periodos();
            self._m_evento_click_reset();
            self._m_evento_brush();
            if (!self._m_preparar_Datos()) {
                console.error("m_graficar -> Configuracion de datos incorrectos");
                return;
            }

            //Datos que se van a graficar
            var data = self._m_seleccionar_datos_a_graficar();

            if (data == null || data.length == 0 || self.datos.length == 0) {
                console.error("m_raficar -> No hay datos para este intervalo");
                return;
            } else { //Datos correctos
                var fechaInicio = data[0].date;
                var fechaFin = data[data.length - 1].date;
                jQuery("#chart_start").val(formatFecha(fechaInicio));
                jQuery("#chart_end").val(formatFecha(fechaFin));

                //Aqui solo hay que calcular el porciento y no hay que dibujarlo
                self._m_calcular_porciento(fechaInicio, fechaFin, 0, self.datos[0].titulo);
            }

            //establece el dominio para el eje x (es decir, de donde a donde van los valores)
            x.domain(d3.extent(data, function (d) {
                return d.date;
            }));

            var min = d3.min(data, function (d) {
                return d.close;
            });

            var max = d3.max(data, function (d) {
                return d.close;
            });

            var add = 0;
            var tempTiksArray = y.ticks();
            if (tempTiksArray > 2) {
                //toma la diferencia entre 2 ticks para adicionar a la grafica uno mas
                add = tempTiksArray[1] - tempTiksArray[0];
            } else {
                add = (max - min) / (parseInt(yAxis.ticks()[0]) + 1);
            }

            y.domain([min - add, max + add]);

            x_brush.domain(d3.extent(self.datos[0].data, function (d) {
                return d.date;
            }));
            y_brush.domain(d3.extent(self.datos[0].data, function (d) {
                return d.close;
            }));

            //Dominio para la grafica de barra
            x2.domain(data.map(function (d) {
                return d.date;
            }));

            y2.domain([0, d3.max(data, function (d) {
                return d.volume;
            })]);
            y2_1.domain(y2.domain());

            // Grillas para el eje X
            svg.append("g")
                .attr("class", "grid x")
                .attr("transform", "translate(0," + self.configuracion.height + ")")
                .call(dibujar_eje_x(x)
                    .tickSize(-self.configuracion.height, 0, 0)
                    .tickFormat(""));

            // Grillas para el eje Y
            svg.append("g")
                .attr("class", "grid y")
                .call(dibujar_eje_y(y)
                    .tickSize(-self.configuracion.width, 0, 0)
                    .tickFormat(""));

            //  Adiciona el eje X
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + self.configuracion.height + ")")
                .call(xAxis);

            //  Adiciona el Eje Y
            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);

            // Add the valueline path.
            svg.append("path")
                .datum(data)
                .attr("clip-path", "url(#clip)")
                .attr("class", "line line-main")
                .attr("stroke", self.datos[0].color)
                .attr("d", valueline);

            // Adiciona linea discontinua vertical, que se va a mostrar cuando se mueva el mouse
            focus.append("line")
                .attr("class", "x linea-vertical hidden") // la pone oculta inicialmente
                .style("stroke", "#23649E")
                .style("stroke", "black")
                .style("stroke-dasharray", "3,3") // Pone discontinua la linea
                .attr("y1", 0)
                .attr("y2", 0);

            // Adiciona linea discontinua horizontal, que se va a mostrar cuando se mueva el mouse
            focus.append("line")
                .attr("class", "y hidden linea-horizontal") // La oculta inicialmente
                .style("stroke", "black")
                .style("stroke-dasharray", "3,3")
                .attr("x1", self.configuracion.width)
                .attr("x2", self.configuracion.width);

            //Creando Circulo para posicionar en la interseccion
            var valor = -2 * self.configuracion.margin.left; //esto es para que el circulo por defecto no se vea en la grafica
            focus.append("circle")
                .attr("class", "y")
                .attr("transform", "translate(" + valor + ",0)")
                .style("fill", self.datos[0].color) //color de relleno del circulo
                .attr("r", 4);

            //dibuja la grafica de barras
            self._m_graficar_barras(data);

            /* Creando rectangulo que indica la fecha actual cuando se mueve el mouse  mouse*/
            var rect = svg.append("rect")
                .style("display", "none")
                .attr("class", "current_date")
                .attr('width', current_date_width)
                .attr('height', current_date_height)
                .attr('x', 0)
                .attr('y', -3 * self.configuracion.margin.top) // esto es para que por defecto no se vea en la grafica
                .attr("rx", 0)         // set the x corner curve radius
                .attr("ry", 0)        // set the y corner curve radius
                .style('fill', self.datos[0].color);

            // Texto que se muestra dentro del cuadro que se mueve
            svg.append("text")
                .style('display', "none")
                //.attr("text-anchor", "middle")
                .attr('class', "current_date_text")
                .attr("x", 0)
                .attr('y', -3 * self.configuracion.margin.top)
                .style("fill", "#ffffff") // color blanco el texto
                .text(this.datos[0].titulo);

            // Agregandole los datos al brush
            g_brush.append("path")
                .datum(self.datos[0].data)
                .attr("class", "area")
                .attr("d", area);

            //Eje x del brush
            g_brush.append("g")
                .attr("class", "x_brush axis_brush")
                .attr("transform", "translate(0," + self.configuracion.height3 + ")")
                .call(xAxis_brush);

            //Asignandole a el brush el rango seleccionado
            brush.extent(x.domain());

            g_brush.append("g")
                .attr("class", "brush")
                .call(brush)
                .selectAll("rect")
                .attr("y", -6)
                .attr("height", self.configuracion.height3 + 7);

            // Agregando un rectangulo para capturar el mouse
            //Este rectangulo tiene las mismas dimeciones que la grafica
            var rectangulo = self._m_crear_rect_mouse_move_datos(svg);
            self._m_mouse_move_datos(rectangulo, data);
            self._m_resize(); //Inicializa el evento window resize para la grafica
        }
        ,

        _m_resize: function () {
            d3.select(window).on('resize', resize);
            resize();
            function resize() {

                //var width = parseInt(d3.select("#chart-container>svg").style("width")) - self.configuracion.margin.left * 2,
                //  height = parseInt(d3.select("#chart-container>svg").style("height")) - self.configuracion.margin.bottom * 2;
                //
                //x.range([0, width]);
                //y.range([height, 0]);
                //
                //yAxis.ticks(Math.max(height / 50, 2));
                //xAxis.ticks(Math.max(width / 50, 2));
                //
                //svg.select('.x.axis')
                //    .attr("transform", "translate(0," + height + ")")
                //    .call(xAxis);
                //
                //svg.select('.y.axis')
                //    .call(yAxis);
                //
                //svg.select('.line-main')
                //    .attr("d", valueline);
            }
        },

        _m_iniciar_variables: function () {
            this._m_crear_chart_header();
            self.configuracion.width = self.configuracion.width - self.configuracion.margin.left - self.configuracion.margin.right;
            self.configuracion.height = self.configuracion.height - self.configuracion.margin.top - self.configuracion.margin.bottom;
            self.configuracion.margin2.realtop = self.configuracion.height + self.configuracion.margin2.top;
            self.configuracion.margin3.realtop = self.configuracion.margin2.realtop + self.configuracion.margin3.top;

            self.comparaciones["simbolos"] = [];
            self.comparaciones["datos"] = [];
            self.comparaciones["colores"] = [];
            self.comparaciones["simbolos"].push(self.datos[0].titulo);
            self.comparaciones["datos"].push([]);
            self.comparaciones["colores"].push(self.datos[0].color);

            chart_fecha_inicio = "";
            chart_fecha_fin = "#chart_end";
            animation_time = 750;
            current_date_width = 100;
            current_date_height = 25;

            //Estas dos variables guardaran los objetos Datepicker dew inicio y fin respectivamente
            chart_fecha_inicio = null;
            chart_fecha_fin = null;
            self._m_configurar_selector_de_fecha(self.datos[0].data[0].date, self.datos[0].data[self.datos[0].data.length - 1].date);

            //Convierte un string en este formato a un objeto Date
            parseDate = d3.time.format("%Y-%m-%d").parse;

            // Convierte un objeto Date al formato "ano-mes-dia" Ex: 2015-02-27
            formatFecha = d3.time.format("%Y-%m-%d");

            // Convierte un objeto Date al formato "mes, dia, ano" Ex: Febrero, 03, 2015
            formatDate = d3.time.format("%b %d, %Y");
            bisectDate = d3.bisector(function (d) {
                return d.date;
            }).left;

            // Escalando X and Y
            x = d3.time.scale().range([0, self.configuracion.width]);
            y = d3.scale.linear().range([self.configuracion.height, 0]);

            //Scala para x y y de la grafica de barras
            x2 = d3.scale.ordinal().rangeBands([0, self.configuracion.width], .02);
            y2 = d3.scale.linear().range([0, self.configuracion.height2]);

            //Esta se usa solo para la grafica que indica el eje y de la grafica de barras
            y2_1 = d3.scale.linear().range([self.configuracion.height2, 0]);

            // Eje X y Eje y
            xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5);
            yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);

            //Ejes para la grafica de barra
            //xAxis2 = d3.svg.axis().scale(x2).orient("bottom").tickFormat(d3.time.format("%d"));
            yAxis2 = d3.svg.axis().scale(y2_1).orient("left").ticks(3);

            // Define que valores va a graficar la linea para cada eje
            valueline = d3.svg.line()
                .x(function (d) {
                    return x(d.date);
                })
                .y(function (d) {
                    return y(d.close);
                });

            //Datos para la grafica del brush
            x_brush = d3.time.scale().range([0, self.configuracion.width]);
            y_brush = d3.scale.linear().range([self.configuracion.height3, 0]);

            xAxis_brush = d3.svg.axis().scale(x_brush).orient("bottom");
            brush = d3.svg.brush().x(x_brush);
            area = d3.svg.area()
                .interpolate("monotone")
                .x(function (d) {
                    return x_brush(d.date);
                })
                .y0(self.configuracion.height3)
                .y1(function (d) {
                    return y_brush(d.close);
                });
        }
        ,

        _m_iniciar_elementos_dom: function () {

            chart_container = d3.select(self.configuracion.id).append("div");
            chart_container.attr("id", "main_chart_svg").attr("class", "main_chart_svg");

            self._m_iniciar_variables();

            //main_svg = chart_container
            main_svg = d3.select("#main_chart_svg #chart-container")
                .append("svg")
                .attr("id", "chart_svg")
                //.style("background", "#F0F6FD")
                .attr("width", self.configuracion.width + self.configuracion.margin.left + self.configuracion.margin.right)
                .attr("height", self.configuracion.height + self.configuracion.margin.top + self.configuracion.margin.bottom);

            main_svg.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", self.configuracion.width)
                .attr("height", self.configuracion.height);

            svg = main_svg
                .append("g")
                .attr("class", "g-main")
                .attr("transform", "translate(" + self.configuracion.margin.left + "," + self.configuracion.margin.top + ")");

            //g para mostrar las lineas discontinuas cuando se mueve el mouse
            focus = svg.append("g")
                .attr("class", "focus")
                .style("display", "none");

            // TODO la 2 linea es para quitar la grafica de barras e ir probando el brush
            focus_barra = main_svg.append("g")
                .style("display", "none") //temporal para probar la otra grafica dgfuentes
                .attr("class", "focus_barra")
                .attr("transform", "translate(" + self.configuracion.margin.left + "," + self.configuracion.margin2.realtop + ")");

            //g contenedor del brush
            g_brush = main_svg.append("g")
                .attr("class", "g_brush")
                .attr("transform", "translate(" + self.configuracion.margin.left + "," + self.configuracion.margin2.realtop + ")");

            /* Posicionar el leyenda*/
            d3.select(".leyenda")
                .style("left", self.configuracion.width + self.configuracion.margin.left + "px")
                .style("left", self.configuracion.width + self.configuracion.margin.left + 5 + "px")
                //.style("top", self.configuracion.margin.top - 20 + "px")
                .style("display", "none");

            tooltip = chart_container.append('div')
                .style('position', 'absolute')
                .attr('class', 'tooltip-info');
        }
        ,

        _m_crear_chart_header: function () {

            var header = '<div id="chart-global-header"><div class="chart-rangos btn-group"></div></div>';

            chart_container.html(header);
            chart_header = jQuery('#chart-global-header');

            var rangos = d3.select(".chart-rangos");

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
                });

            //Crear dropdown con las emrpesas, comenzando por 1
            var LI = "";
            for (var i = 1; i < self.datos.length; i++) {
                var d = self.datos[i];
                LI += '<li><a data-empresa="' + d.titulo + '" data-value="' + i + '" href="#" class="comparadores"> <span data-operacion="+" class="operacion">+</span>' + d.titulo + '</a></li>';
            }

            var btnDropdown = '<div class="btn-group"> <button data-toggle="dropdown" class="btn btn-default dropdown-toggle" type="button">' +
                'Comparar<span class="caret"></span></button><ul class="dropdown-menu comparar">' + LI + '</ul></div>';

            var indicadores = [{nombre: 'Indicador A', simbolo: 'A'}, {
                nombre: 'Indicador B',
                simbolo: 'B'
            }, {nombre: 'Indicador C', simbolo: 'C'}];
            var Li_indicadores = "";
            for (var pos = 0; pos < indicadores.length; pos++) {
                var ind = indicadores[pos];
                Li_indicadores += '<li><a data-indicador="' + ind.simbolo + '" data-value="' + ind.nombre + '" href="#" class="indicador"> <span data-operacion="+" class="operacion">+</span>' + ind.nombre + '</a></li>';
            }
            var btnIndicadores = '<div class="btn-group"> <button data-toggle="dropdown" class="btn btn-default dropdown-toggle" type="button">' +
                'Indicadores<span class="caret"></span></button><ul class="dropdown-menu">' + Li_indicadores + '</ul></div>';

            var btnReiniciar = '<div class="form-group"> <button id="btn_reiniciar" class="btn btn-default" type="button">Reiniciar</button></div>';
            var input_fecha_inicio = '<div class="form-group"><input type="text" placeholder="Desde" name="inicio" id="chart_start" class="form-control"></div>';
            var input_fecha_fin = '<div class="form-group"><input type="text" placeholder="Hasta" name="fin" id="chart_end" class="form-control"></div>';

            var contenedor_fecha =
                '<div class="parametros">' +
                '<form role="form" class="form-inline">' +
                input_fecha_inicio + input_fecha_fin + btnDropdown + btnReiniciar +
                '</form>' +
                '</div>' +
                '<div class="clearfix"></div>';
            chart_header.html(chart_header.html() + contenedor_fecha);
            chart_container.html(chart_container.html() + '<div id="chart-container">' + _crear_leyenda() + '</div>');

            //Crear leyenda
            function _crear_leyenda() {
                return '<div class="leyenda"><div class="wrapper"><p>Open:&nbsp;<span id="open"></span></p>' +
                    '<p>Hight:&nbsp;<span id="high">0</span></p><p>Low:&nbsp;<span id="low">0</span></p>' +
                    '<p>Close:&nbsp;<span id="close">0</span></p><p>Volume:&nbsp;<span id="volumen">0</span></p>' +
                    '<p>Change: <span id="change">0</span></p></div></div>';
            }
        }
        ,

        _m_configurar_selector_de_fecha: function (fecha_inicio, fecha_fin) {

            var monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            var monthNamesShort = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

            var startD = fecha_inicio;
            var endD = fecha_fin;

            jQuery('#chart_start').datepicker({
                monthNames: monthNames,
                monthNamesShort: monthNamesShort,
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                minDate: startD,
                maxDate: endD,
                numberOfMonths: 1,
                onSelect: function () {
                    self._m_actualizar_cambio_fecha();
                },
                onClose: function (fecha_seleccionada) {
                    jQuery('#chart_end').datepicker("option", "minDate", fecha_seleccionada);
                }
            });

            jQuery('#chart_end').datepicker({
                monthNames: monthNames,
                monthNamesShort: monthNamesShort,
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                minDate: fecha_inicio, //fecha minima es la que esta en el DESDE
                maxDate: fecha_fin,
                numberOfMonths: 1,
                onSelect: function () {
                    self._m_actualizar_cambio_fecha();
                },
                onClose: function (fecha_seleccionada) {
                    jQuery('#chart_start').datepicker("option", "maxDate", fecha_seleccionada);
                }
            });
        }
        ,

        _m_crear_rect_mouse_move_datos: function (obj) {

            var rec_mouse_move = obj.select(".mouse-move");

            if (!rec_mouse_move.empty())
                rec_mouse_move.remove();

            rec_mouse_move = obj.append("rect")
                .attr("width", self.configuracion.width)
                .attr("height", self.configuracion.height)
                .attr("class", "mouse-move")
                .style("fill", "none")
                .style("pointer-events", "all") // Captura todos los eventos del mouse en esta area
                .on("mouseover", function () {
                    //MOUSE OVER
                    focus.style("display", null); // muestro las lineas, discontinuas

                    //Muestra la leyenda
                    d3.select(".leyenda").style("display", null);

                    //muestra el rect que contiene la fecha actual
                    d3.select('.current_date').style('display', null);
                    d3.select('.current_date_text').style('display', null);
                }).on("mouseout", function () {
                    focus.style("display", "none");
                    d3.select('#main_chart_svg .leyenda').style('display', 'none');
                    d3.select('#main_chart_svg .current_date').style('display', 'none');
                    d3.select('#main_chart_svg .current_date_text').style('display', "none");
                });
            return rec_mouse_move;
        }
        ,

        _m_mouse_move_datos: function (rectangulo, data) {
            if (data == null || data.length == 0) {
                console.info("_m_mouse_move_datos -> datos vacios o nulos");
                return;
            }
            rectangulo.on("mousemove", mouse_move_datos);
            //function privada para el mouse move
            var d = null, pos = -1, temp = -1;

            function mouse_move_datos() {
                var change = 0;
                var x0 = x.invert(d3.mouse(this)[0]),
                    i = bisectDate(data, x0, 1),
                    d0 = data[i - 1],
                    d1 = data[i];

                if (x0 - d0.date > d1.date - x0) {
                    d = d1;
                    change = self.comparaciones["datos"][0][i].porciento;
                    pos = i;
                } else {
                    change = self.comparaciones["datos"][0][i - 1].porciento;
                    d = d0;
                    pos = i - 1;
                }

                //Actualizar Leyenda en elmouse move
                chart_container.select("#open").text(d.open);
                chart_container.select("#high").text(d.hight);
                chart_container.select("#low").text(d.low);
                chart_container.select("#close").text(d.close);
                chart_container.select("#volumen").text(formato_numero(d.volume, 3, ".", ","));
                chart_container.select("#change").text(change + "%");

                var barra = focus_barra.select('rect[data-pos="' + pos + '"]');
                var tempColor = barra.style.fill;
                if (temp != pos) {
                    barra = focus_barra.select('rect[data-pos="' + temp + '"]');
                    barra.style("fill", tempColor).style('opacity', 1);
                } else {
                    barra.style("fill", "#FFBB78").style('opacity', .5);
                }
                temp = pos;

                focus.select(".x")
                    .attr("transform", "translate(" + x(d.date) + ",0)")
                    .attr("y1", 0)
                    .attr("y2", self.configuracion.height)
                    .classed("hidden", false); // Le elimina la clase hidden

                //Posicionando la line horizontal cuando se mueve el mouse
                focus.select(".y")
                    .attr("transform", "translate(" + self.configuracion.width * -1 + "," + y(d.close) + ")")
                    .attr("x2", self.configuracion.width + self.configuracion.width)
                    .classed("hidden", false); // Le elimina la clase hidden, por tanto se muestra

                /** Moviendo el Circulo*/
                focus.selectAll("circle.y")
                    .attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")");

                /** Cuadro en la parte final de la grafica, que se mueve con el mouse move*/
                d3.select('.current_date')
                    .attr("x", x(d.date) - current_date_width / 2)
                    .attr("y", self.configuracion.height);

                d3.select('.current_date_text')
                    .attr("x", x(d.date))
                    .attr("y", self.configuracion.height + current_date_height / 2 + 3)
                    .text(formatDate(d.date));
            }
        }
        ,

        _m_mouse_move_comparaciones: function (rectangulo, data) {

            rectangulo.on("mousemove", mouse_move_comparaciones);

            var dd = null, pos1 = -1, temp = -1;

            function mouse_move_comparaciones() {
                var leyenda = d3.select(".leyenda > .wrapper");
                focus = main_svg.select(".focus");
                var x0 = x.invert(d3.mouse(this)[0]);

                self.comparaciones["datos"].forEach(function (dataComp, pos) {
                    var ii = bisectDate(dataComp, x0, 1);
                    var d0 = dataComp[ii - 1];
                    var d1 = dataComp[ii];
                    var d = x0 - d0.date > d1.date - x0 ? d1 : d0;

                    focus.select('circle[data_simbolo="' + self.comparaciones["simbolos"][pos] + '"]')
                        .attr("transform", "translate(" + x(d.date) + "," + y(+d.porciento) + ")")
                        .attr("r", 4);

                    if (self.comparaciones["simbolos"][pos] == self.datos[0].titulo)
                        dd = d;

                    var span = leyenda.select('span[data_simbolo="' + self.comparaciones["simbolos"][pos] + '"]');
                    span.style("color", self.comparaciones["colores"][pos]);
                    span.attr("data_simbolo", self.comparaciones["simbolos"][pos]);
                    span.attr("class", "chart-leyenda");
                    span.html(self.comparaciones["simbolos"][pos] + "<b> <br>Change: " + d.porciento + "%</b>" +
                    "<br><b> Close: " + d.close + "</b>");
                });

                var ii = bisectDate(data, x0, 1);
                var d0 = data[ii - 1];
                var d1 = data[ii];
                var dt = null;

                if (x0 - d0.date > d1.date - x0) {
                    dt = d1;
                    pos1 = ii;
                } else {
                    dt = d0;
                    pos1 = ii - 1;
                }

                //Actualizar Leyenda en elmouse move
                d3.select("#open").text(dt.open);
                d3.select("#high").text(dt.close);
                d3.select("#low").text(dt.low);
                d3.select("#close").text(dt.close);
                d3.select("#volumen").text(formato_numero(dt.volume, 3, ".", ","));

                var barra = focus_barra.select('rect[data-pos="' + pos1 + '"]');
                var tempColor = barra.style.fill;
                if (temp != pos1) {
                    barra = focus_barra.select('rect[data-pos="' + temp + '"]');
                    barra.style("fill", tempColor).style('opacity', 1);
                } else {
                    barra.style("fill", "#FFBB78").style('opacity', .5);
                }
                temp = pos1;

                //Posicionando la line vertical cuando se mueve el mouse
                focus.select(".linea-vertical")
                    .attr("transform", "translate(" + x(dd.date) + ",0)")
                    .attr("y1", 0)
                    .attr("y2", self.configuracion.height)
                    .classed("hidden", false); // Le elimina la clase hidden

                //Posicionando la line horizontal cuando se mueve el mouse
                focus.select(".linea-horizontal")
                    .attr("transform", "translate(" + self.configuracion.width * -1 + "," + y(dd.porciento) + ")")
                    .attr("x2", self.configuracion.width + self.configuracion.width)
                    .classed("hidden", false);

                d3.select('.current_date')
                    .attr("x", x(dd.date) - current_date_width / 2)
                    .attr("y", self.configuracion.height);

                d3.select('.current_date_text')
                    .attr("x", x(dd.date))
                    .attr("y", self.configuracion.height + current_date_height / 2 + 3)
                    .text(formatDate(dd.date));
            }
        }
        ,

        m_test: function (value, obj) {
            alert(value);
        }

    };


    function formato_numero(numero, decimales, separador_decimal, separador_miles) {

        //Si es 0 entonces no es necesario hacer nada
        if (parseInt(numero) == 0)
            return numero;

        numero = parseFloat(numero);
        if (isNaN(numero)) {
            return "";
        }
        if (decimales !== undefined) {
            // Redondeamos
            numero = numero.toFixed(decimales);
        }
        // Convertimos el punto en separador_decimal
        numero = numero.toString().replace(".", separador_decimal !== undefined ? separador_decimal : ",");
        if (separador_miles) {
            // Añadimos los separadores de miles
            var miles = new RegExp("(-?[0-9]+)([0-9]{3})");
            while (miles.test(numero)) {
                numero = numero.replace(miles, "$1" + separador_miles + "$2");
            }
        }
        return numero;
    }

    //Funciones para dibujar las lineas discontinuas
    function dibujar_eje_x(x_main, ticks) {
        ticks || ( ticks = 5 ); //asigna valor por defecto en caso de que no se pase ningun parametro
        return d3.svg.axis().scale(x_main).orient("bottom").ticks(ticks);
    }

    function dibujar_eje_y(y_main, ticks) {
        ticks || ( ticks = 5 ); //asigna valor por defecto en caso de que no se pase ningun parametro
        return d3.svg.axis().scale(y_main).orient("left").ticks(ticks);
    }

    Grafica = function (configuracion) {
        return Object.create(mi_grafica).init(configuracion);
    };
})();

