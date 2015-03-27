# Gráficas Financieras.
Esta simple librería está basada en d3js y tiene como propósito principal crear gráficas financieras.


## Funcionamiento de la gráfica a grandes rasgos.
1. Obtener y validar los datos que se desean graficar.
2. Crear los elementos del DOM como son los svg, line, path, g, etc.
3. Graficar los datos.


## ¿Cómo crear una gráfica financiera?

1. Incluir los css y js	
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/jquery-ui.css">
    <link rel="stylesheet" href="css/grafica.css">
    <script src="js/jquery-1.11.0.min.js"></script>
    <script src="js/jquery-ui.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/d3.v3.min.js" charset="utf-8"></script>
    <script src="js/grafica.js"></script>

2. Dentro de la página, debes tener al menos un 'div' con id donde deseas que salga la gráfica.
Ejemplo: <div id='grafica'></div>

3. Crear la gráfica.
Para crear la gráfica, necesitamos crear un objeto de tipo Grafica y pararle las opciones de configuracion como se muestra en el ejemplo
	
var config_general = {
	id: '#grafica'
}
var chart = new Grafica(config_general);

## Configuración por defecto
	
	### Estructura de los periodos	
        
		{		
            tipo: "dia", // tipo de periodo			
            cantidad: 2, // tiempo en dependencia del tipo
            activo: false // si esta activo o no
			texto: "2D", // texto que se va a mostrar
        }
		
		**Nota:** Solo va a estar activo 1 periodo a la vez. Al mostrar la grafica por primera vez, siempre se van a graficar los
		datos correspondientes a el periodo que esté activo.(activo: true);
		
		#### Tipos de periodos permitidos
			'dia', 'mes', 'anno'
		
		##### Valor por defecto
		
		 var periodos = [
        {
            texto: "2D",
            cantidad: 2,
            tipo: "dia",
            activo: false
        }, {
            texto: "5D",
            cantidad: 5,
            tipo: "dia",
            activo: false
        }, {
            texto: "10D",
            cantidad: 10,
            tipo: "dia",
            activo: false
        }, {
            texto: "1M",
            cantidad: 1,
            tipo: "mes",
            activo: true
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
        },
        {
            texto: "2Y",
            cantidad: 2,
            tipo: "anno",
            activo: false
        }
    ];
	
	var chart = new Grafica(config_general);
	chart.periodos = periodos;
	
	### Estructura de los Datos
	
	var datos = [
            {
                titulo: "MAXCOM", // Identificador
                data: [....], // datos a graficar
				color: "red" //color de la grafica para IPC
            },
            {
                titulo: "IPC", 
                data: [...], 
				color: '#FFFFF' // también se pueden especificar los colores así.
            }
			];
		
		var chart = new Grafica(config_general);
		chart.datos = datos;
		
		**Nota:** El identificador debe ser único. En caso de no especificar los colores, se tomaran los colores por defecto, 
		que son una escala de 10 colores de d3.