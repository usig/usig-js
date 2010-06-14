// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};

if (typeof (usig.inventario) == "undefined")
	usig.inventario = {};

/**
 * @class Ubicacion
 * Representa una ubicacion de un objeto del Inventario de Informacion Geografica de la USIG<br/>
 * Requiere: usig.Punto
 * @namespace usig.inventario
 * @constructor 
 * @param {Object} data Un objeto conteniendo los datos de la ubicacion 
*/	
usig.inventario.Ubicacion = function(data) {

	var centroide = null; 
	
	if (data instanceof usig.Punto) {
		centroide = data;
	} else if (data.centroide != undefined) {
		centroide = usig.Punto.fromWkt(data.centroide);
	}
	
	/**
	 * Devuelve el centroide de esta ubicacion
	 * @returns {usig.Punto} Centroide de esta ubicacion
	 */
	this.getCentroide = function() {
		return centroide;
	}
	
	/**
	 * Devuelve el tipo de esta ubicacion
	 * @returns {String} El tipo de esta ubicacion
	 */
	this.getTipo = function() {
		return data.tipo;
	}
}