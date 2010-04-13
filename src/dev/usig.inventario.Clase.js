// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};

if (typeof (usig.inventario) == "undefined")
	usig.inventario = {};

/**
 * @class Clase
 * Representa una clase de objeto del Inventario de Informacion Geografica de la USIG<br/>
 * @namespace usig.inventario
 * @constructor 
 * @param {Integer} id Id de la clase 
 * @param {String} nombre Nombre de la clase 
*/	
usig.inventario.Clase = function(id, nombre, nombreId, nombreNormalizado) {
	
	/**
	 * Devuelve el id de la clase
	 * @return {Integer} Id de la clase
	 */
	this.getId = function() {
		return id;
	}
	
	/**
	 * Devuelve el nombre de la clase
	 * @return {String} Nombre de la clase
	 */
	this.getNombre = function() {
		return nombre;
	}
	
	/**
	 * Devuelve una cadena identificatoria de la clase
	 * @return {String} Cadena identificatoria de la clase
	 */
	this.getNombreId = function() {
		return nombreId;
	}
	
	/**
	 * Devuelve el nombre de la clase normalizado
	 * @return {String} Nombre de la clase normalizado
	 */
	this.getNombreNormalizado = function() {
		return nombreNormalizado;
	}
}
