(function () {
//Inicio de lalibreria

    LineChart = function (raiz, opciones) {

        //Definicion de las variables
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

            mouseLineIndicator: {horizontal: true, vertical: true} //muestra linea horizontal y vertical cuando se mueve el mouse por la grafica
        };
        self.titulo = "LineChart by IRStrat";
        self.datos = []; // Datos a graficar
        self.periodos = []; //Periodos personalizados
        var colors = d3.scale.category10();//escala de 10 colores de d3
        var parseDate = d3.time.format("%d-%b-%y").parse; //Formato por defecto de la fecha

        _init = function () {

            self.opciones = my_extend(self.default_options, self.opciones);

            function my_extend(options1, options2) {
                for (var key1 in options1)
                    for (var key2 in options2)
                        if (key1 == key2)
                            options1[key1] = options2[key2];
                return options1;
            }
        };

        //Llama a este metodo para inicializar las opciones de configuracion que sepasaron por parametro
        _init();

        graficar = function () {
            if (_DatosCorrectos()) {

            } else {
                throw new Error("Formato de los datos incorrectos");
            }
        };

        _actualizar = function (data) {

        };

        //Inicializa el SVG, y todos los elementos necesarios para crear la grafica
        _inicializarDOM = function () {


            function Inicializar_Variables() {

            }
        };

        _DatosCorrectos = function () {
            if (typeof(periodos) === 'array') {

            }
            return true;

        };


    };

//Fin de la libreria
})();