// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};

if (typeof(usig.Marcador) == "undefined") {	
/**
 * @class Marcador
 * Esta clase representa un marcador <br/>
 * @namespace usig
 * @constructor 
 * @param {String} strDir String con la direccion
 * @param {String} iconUrl String con la Url del icono
 * @param {int} iconWidth el ancho del icono
 * @param {int} iconHeight con el largo del ’cono 
*/	
usig.Marcador = function(strDir, iconUrl, iconWidth, iconHeight) {
	var coordenadas = null; 
	
	this.strDir = strDir;
	this.iconUrl = iconUrl;
	this.iconWidth = iconWidth;
	this.iconHeight = iconHeight;
	
	/**
	 * Setea las coordenadas de la geocodificacion de esta direccion
	 * @param {usig.Punto} pt Instancia de usig.Punto que contiene las coordenadas
	 */
	this.setCoordenadas = function(pt) {
		coordenadas = usig.Punto.fromPunto(pt);
	}
	
	
	/**
	 * Devuelve las coordenadas asociadas a esta direccion en caso de estar disponibles
	 * o null en caso contrario
	 * @return {usig.Punto} Instancia de usig.Punto con las coordenadas correspondientes
	 */
	this.getCoordenadas = function() {
		return coordenadas;
	}
		
	/**
	 * Devuelve el string de la direccion
	 * @return {String} Representacion de la direccion
    */	
	this.toString = function() {
		return strDir;
	}
	
}
}


