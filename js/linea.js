if (typeof Object.create !== 'function') {
    Object.create = function (obj) {
        function F() {
        };
        F.prototype = obj;
        return new F();
    };
}

(function () {
    var mi_line = {
        //var rootElement="", //id del div donde va a salir la grafica
        //Propiedades por defecto en caso de que no se especifiquen
        default_options: {
            showgridLines: true,
            gridLines: {color: 'lightgrey', showHorizontal: true, showVertical: true},
            fontFamily: "Arial",// la Fuente
            fontSize: 12,// la Fuente
            colors: d3.scale.category10(),//escala de 10 colores de d3
            _parseDate: d3.time.format("%d-%b-%y").parse, //Formato por defecto de la fecha
            dateFormat: "dd-mm-yy", // Formato de la fecha
            animation: true, //Animada
            animacionType: '', // tipo de animacion
            responsive: true, //Responsiva
            tooltip: {fontFamily: 'Arial', fontColor: 'white', fontSize: 12, fillColor: 'black', borderColor: 'white'},
            showPoint: true, //muestra lospuntos en la interseccion de cada punto de la linea
            // Para lo de los puntos, buscar en estos ejemplos como mostrarlos
            //http://stackoverflow.com/questions/14040297/points-on-line-in-d3-js
            // http://jsfiddle.net/2gDq3/1/
            point: {pointRadius: 3, pointBorderWidth: 1, fillColor: '', borderColor: 'blue'}
        },
        //aqui van los datos de todas las graficas que se desean realizar
        datos: [
            // Formato de los datos
            /*{
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
             },
             {

             }*/
        ],
        init: function (options) {
            self = this;
            self.default_options = my_extend(self.default_options, options);
            return self;
            function my_extend(options1, options2) {
                for (var key1 in options1)
                    for (var key2 in options2)
                        if (key1 == key2)
                            options1[key1] = options2[key2];
                return options1;
            }
        }
        ,
        Dibujar: function () {
            if (self._m_ValidData()) {
                //graficar
            } else {
                throw new Error("Formato de los datos incorrectos.");
            }
        }
        ,
        Actualizar: function (data) {

        }
        ,
        _m_ValidData: function () {
            return true;
        }
        ,
        _m_inicializar_DOM: function () {

            function inicializarVariables() {

            }
        }
    };
    LineChart = function (options) {
        return Object.create(mi_line).init(options);
    };
})();

//
//
//var Clase = function(parametro) {
//    var atributoPrivado = parametro;
//    var metodoPrivado = function(parametro) {
//        alert(parametro);
//    };
////Poniendole el _ delante del nombre del método también estamos diciendo que         este es privado.
//    _metodoPrivado2 = function() {
//        alert('Metodo privado 2');
//    };
//
//    this.llamaTodo = function() {
//        metodoPrivado('hola');
//        console.log(atributoPrivado);
//    }
//};
