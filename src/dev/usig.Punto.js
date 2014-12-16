// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class Punto
 * Esta clase representa un punto como un par de coordenadas (X, Y)<br/>
 * @namespace usig
 * @constructor 
 * @param {Float} coordX Coordenada X del punto 
 * @param {Float} coordY Coordenada Y del punto 
*/	
usig.Punto = function(coordX, coordY) {
	this.x = this.lon = coordX;
	this.y = this.lat = coordY;
	/**
	 * Devuelve la coordenada x del punto
	 * @return {Float} La coordenada x del punto
	 */
	this.getX = function() {
		return this.x;
	}
	
	/**
	 * Devuelve la coordenada y del punto
	 * @returns {Float} La coordenada y del punto
	 */
	this.getY = function() {
		return this.y;
	}
	
	/**
	 * Devuelve una representacion del punto en formato JSON
	 * @return {String} Representacion del punto como cadena JSON con la forma '{'x': XXXXX, 'y': YYYYY }'
    */	
	this.toJson = function() {
		return '{ "x":'+this.x+', "y": '+this.y+' }';
	}
	
	/**
	 * Devuelve una representacion del punto como cadena en el formato '(x, y)'
	 * @return {String} Representacion del punto como cadena con la forma '(x, y)'
    */	
	this.toString = function() {
		return '('+this.x+', '+this.y+')';
	}
	
};

/**
 * Devuelve un nuevo punto creado a partir de su representacion como String WKT
 * @param {String} wkt Cadena representando un punto en formato WKT
 * @return {usig.Punto} Punto creado
 */
usig.Punto.fromWkt = function(wkt) {
/*	wkt = wkt.replace('POINT (', '').replace(')', '');
	var splited = wkt.split(' ');
	return new usig.Punto(splited[0], splited[1]);*/
	var regExpPunto = /^POINT *\(([0-9]+\.[0-9]+) ([0-9]+\.[0-9]+)\)$/;
	var res = null;
	
	if (resMatch = wkt.match(regExpPunto)){
		res = new usig.Punto(resMatch[1], resMatch[2]);
	}
	return res;
};

/**
 * Devuelve un nuevo punto creado a partir de otro
 * @param {usig.Punto} pt Punto a copiar
 * @return {usig.Punto} Punto creado
 */
usig.Punto.fromPunto = function(pt) {
	return new usig.Punto(pt.getX(), pt.getY());
};

/**
 * Devuelve un nuevo punto creado a partir de otro
 * @param {Object} pt Objeto conteniendo coordenadas x e y
 * @return {usig.Punto} Punto creado
 */
usig.Punto.fromObj = function(pt) {
	return new usig.Punto(pt.x, pt.y);
}

/**
 * Devuelve un nuevo punto creado a partir de un array
 * @param {Object} pt Objeto conteniendo coordenadas x e y
 * @return {usig.Punto} Punto creado
 */
usig.Punto.fromArray = function(pt) {
	return new usig.Punto(pt[0], pt[1]);
}
