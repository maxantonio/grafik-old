# Gr�ficas Financieras.
Esta simple librer�a est� basada en d3js y tiene como prop�sito crear gr�ficas financieras.

## Ejemplo de como crear una gr�fica:
 
 <!DOCTYPE html>
<html>
<head>
	<title>Mi primera grafica</title>
</head>
<body>
	<div id="grafica"></div>
	
	<script type="text/javascript">
	
		var chart = new Grafica({id: "#grafica"});
		
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
</body>
</html>

## Opciones de configuraci�n
### Configuraci�n general
id: "#chart" -> id del elemento donde se va a mostrar la gr�fica.
colores: Por defecto es una escala de 10 colores. 
1. Puedes personalizarlos as�
	1. Ejemplo: colores: []
	