# Gráficas Financieras.
Esta simple librería está basada en d3js y tiene como propósito crear gráficas financieras.


## Funcionamiento de la gráfica a grandes rasgos.
1. Obtener los datos que se desean graficar.
2. Crear los elementos del DOM como son los svg, line, path, g, etc.
3. Graficar los datos.


## ¿Cómo crear una gráfica financiera?

En el body de la página debe haber un elemento con el id 'grafica'


	<script type="text/javascript">
	
		var config_general = {
			id: "#grafica"
		}
		
		var chart = new Grafica(config_general);
		
		var uno = '[{"date":"2013-01-02","open":"3.88","low":"3.79","hight":"3.9","value":"3.84","volume":515500},{"date":"2013-01-03","open":"3.8","low":"3.79","hight":"3.89","value":"3.83","volume":749400},{"date":"2013-01-04","open":"3.81","low":"3.79","hight":"3.85","value":"3.83","volume":286400}';
        var dos = '[{"date":"2013-01-02","value":"44304.17","volume":176170000},{"date":"2013-01-03","value":"44370.64","volume":231461200},{"date":"2013-01-04","value":"44562.33","volume":250730800}]';
		
		var datos = [
            {
                titulo: "Empresa1",
                data: JSON.parse(uno)
            },
            {
                titulo: "Empresa2",
                data: JSON.parse(dos)
            }
        ];
		chart.datos = datos;        
        chart.m_graficar();
	</script>

## Opciones de configuración
### Configuración general
id: "#chart" -> id del elemento donde se va a mostrar la gráfica.
colores: Por defecto es una escala de 10 colores a utilizar en caso de que no se especifiquen los colores de las gráficas.