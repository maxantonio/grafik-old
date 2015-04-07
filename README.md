LineChart
=========
Basada en [d3js](https://github.com/mbostock/d3) y tiene como objetivo principal crear gráficas de línea.

## Opciones Generales

```javascript
//muestra el area sombreada bajo la linea
showArea: true,

//Color y opacidad de el area sombreada
area: {color: 'lightsteelblue', opacity: '0.5'},

//Habilita las grillas
showgridLines: true,

//Mostar horizontales y verticales
gridLines: {horizontal: true, vertical: true},

//Cantidad de puntos por ejex y cantidad de grillas horizontales y verticales
ticks: {x: 10, y: 6, vertical: 10, horizontal: 10},

//Mostrar puntos
showPoint: true,

//Opciones para los puntos
point: {radio: 2, bordeWidth: 0.5, color: 'black', borderColor: 'steelblue'},

//Si se muestran o no las lineas discontinuas cuando se mueve el mouse
showLineIndicator: true,

//Mostrar o no el indicador horizontal o vertical.
mouseLineIndicator: {horizontal: true, vertical: true},

//Grosor de la línea
 lineWeight: 2,

// Formatos de la escala de tiempo de los datos
dateFormat: "%Y-%m-%d",

//Formato de la fecha que se muestra en el indicador cuando se mueve el mouse
current_dateFormat_indicator: "%b %d, %Y",

// Mostrar o no ToolTip con informacion del punto actual en la gráfica
 showToolTip: true,

// configuracion del Tooltip
 tooltip: {
    fontFamily: 'Arial', // Tipo de fuente
    fontColor: 'white', // color de la fuente
    fontSize: "12px", // tamano de la fuente
    backgroundColor: 'black', // color de fondo
    opacidad: 1, //opacidad
    borderColor: 'red', // color de borde
    borderWidth: "0px" // ancho del borde
},
```

Nota: Para más información sobre los formatos para las escalas de tiempo ver [(aquí).](https://github.com/mbostock/d3/wiki/Time-Formatting#format)


## Opciones configurables para cada linea que se quiere dibujar
```javascript

// Valor que se va a graficar de los datos.
mapValue: 'close',

// Valor que representa la escala de tiempo en los datos
mapDate: 'date',

// Grosor de la línea
 lineWeight: 2,

// Si se muestran o no los puntos para esta linea.
showPoint: true,

// Opciones para los puntos de esta linea en especifico
point: {radio: 3.5, bordeWidth: 1.5, color: 'steelblue', borderColor: 'white'},

// muestra el area sombreada bajo la linea
showArea: true,

//opciones para el area
area: {color: 'lightsteelblue', opacity: 0.1},

// Formatos de la escala de tiempo de los datos
dateFormat: "%Y-%m-%d",

```



