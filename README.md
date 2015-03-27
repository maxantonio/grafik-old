Gráficas Financieras.
=====================

Esta simple librería está basada en [d3js.org](https://github.com/mbostock/d3) y tiene como propósito principal crear gráficas financieras.


## Iniciando con la librería

Para un correcto funcionamiento se deben seguir los siguientes pasos.

1. **Incluir en nuestra página estos ficheros css y js :+1:**
    ```html
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/jquery-ui.css">
    <link rel="stylesheet" href="css/grafica.css">
    <script src="js/jquery-1.11.0.min.js"></script>
    <script src="js/jquery-ui.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/d3.v3.min.js" charset="utf-8"></script>
    <script src="js/grafica.js"></script>
    ```

2. Dentro de la página, debes existir el div donde queremos que salga la librería con la propiedad id definida como se muestra en el siguiente ejemplo.
:+1:
```html 
<div id='grafica'></div>
```

3. Inicializar la gráfica.
 	* Necesitamos crear un objeto de tipo **Grafica** y pararle las opciones de configuración como se muestra en el ejemplo :+1:
	
```javascript
var config_general = {
	id: '#grafica'
}
var chart = new Grafica(config_general);
```

## Estructuras
	
### Periodos
Representan los intervalos de fechas predefinidos por el usuario para mejor análisis de los datos que se están graficando.

``` javascript
{		
  tipo: "dia", // tipo de periodo			
  cantidad: 2, // tiempo en dependencia del tipo
  activo: false // si esta activo o no
  texto: "2D", // texto que se va a mostrar
}
```
#### Tipos de periodos permitidos
```'dia', 'mes', 'anno'```
		
**Nota:** Solo estará activo uno a la vez.

#### Periodos por defecto
``` javascript		 
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
```

### Estructura de los Datos
``` javascript
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
```
**Nota:** Si no se especifica el color, se tomaran colores por defecto teniendo en cuenta la [escala de 10 colores de d3js](https://github.com/mbostock/d3/wiki/Ordinal-Scales#category10). El identificador debe ser **único.**
 
## Ejemplo de una gráfica financiera usando esta librería.

```javascript
<!DOCTYPE html>
<html>
<head>
	<title></title>
</head>
<body>
	<div id="grafica"></div>
     
    <script type="text/javascript">    
    var chart = new Grafica({id: "#grafica"});    
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
    
var uno = '[{"date":"2013-01-02","open":"3.88","low":"3.79","hight":"3.9","value":"3.84","volume":515500},{"date":"2013-01-03","open":"3.8","low":"3.79","hight":"3.89","value":"3.83","volume":749400}]';

var dos = '[{"date":"2013-01-02","value":"44304.17","volume":176170000},{"date":"2013-01-03","value":"44370.64","volume":231461200}]';
 
 var datos = [
   {
     titulo: "MAXCOM",
     data: JSON.parse(uno),
     color: 'blue'
   },
   {
     titulo: "IPC",
     data: JSON.parse(dos),
     color: 'red'
   }
 ];

chart.datos = datos;
chart.periodos = periodos;
chart.m_graficar();
</script>

</body>
</html>
```
