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
	 * Devuelve la coordenada x del punto
	 * @returns {Float} La coordenada x del punto
	 */
	this.getX = function() {
		return x;
	}
	
	/**
	 * Devuelve la coordenada y del punto
	 * @returns {Float} La coordenada y del punto
	 */
	this.getY = function() {
		return y;
	}
	
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

/**
 * Devuelve un nuevo punto creado a partir de su representacion como String WKT
 * @param {String} wkt Cadena representando un punto en formato WKT
 * @return {usig.Punto} Punto creado
 */
usig.Punto.fromWkt = function(wkt) {
	var splited = wkt.split(/POINT\s*\((\d*.\d*)\s(\d*.\d*)\)/);
	return new usig.Punto(splited[1], splited[2]);
}

/**
 * Devuelve un nuevo punto creado a partir de otro
 * @param {usig.Punto} pt Punto a copiar
 * @return {usig.Punto} Punto creado
 */
usig.Punto.fromPunto = function(pt) {
	return new usig.Punto(pt.getX(), pt.getY());
}