LineChart
=========
Basada en [d3js](https://github.com/mbostock/d3) y tiene como objetivo principal crear gráficas de línea.

## Opciones por defecto

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
```