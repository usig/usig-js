// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class Punto
 * Esta clase representa un punto como un par de coordenadas (X, Y)<br/>
 * @namespace usig
 * @constructor 
 * @param {Float} x Coordenada X del punto 
 * @param {Float} y Coordenada Y del punto 
*/	
usig.Punto = function(x, y) {
	
	/**
	 * Devuelve una representacion del punto en formato JSON
	 * @return {String} Representacion del punto como cadena JSON con la forma '{'x': XXXXX, 'y': YYYYY }'
    */	
	this.toJson = function() {
		return '{ "x":'+x+', "y": '+y+' }';
	}
	
	/**
	 * Devuelve una representacion del punto como cadena en el formato '(x, y)'
	 * @return {String} Representacion del punto como cadena con la forma '(x, y)'
    */	
	this.toString = function() {
		return '('+x+', '+y+')';
	}
}