// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};

if (typeof (usig.inventario) == "undefined")
	usig.inventario = {};

/**
 * @class Objeto
 * Representa un objeto del Inventario de Informacion Geografica de la USIG<br/>
 * Requiere: usig.Direccion, usig.inventario.Ubicacion, usig.inventario.Clase
 * @namespace usig.inventario
 * @constructor 
 * @param {Object} data Un objeto conteniendo los datos del objeto 
 * @param {usig.inventario.Clase} clase La clase a la que pertenece el objeto 
*/	
usig.inventario.Objeto = function(data, clase) {
	
	this.id = 0;
	this.nombre = usig.inventario.Objeto.defaults.texts.noName;
	this.ubicacion = null;
	this.clase = clase;
	this.direccionAsociada = null;
	this.fechaAlta = null;
	this.fechaUltimaModificacion = null;	
	this.datos = {};
	
	if (data.id) {
		this.id = data.id;
	}
	
	if (data.nombre) {
		this.nombre = data.nombre;
	}
	
	if (data.ubicacion) {
		this.ubicacion = new usig.inventario.Ubicacion(data.ubicacion);
	}
	
	if (data.fechaAlta) {
		this.fechaAlta = new Date(data.fechaAlta);
	}
	
	if (data.fechaUltimaModificacion) {
		this.fechaUltimaModificacion = new Date(data.fechaUltimaModificacion);
	}
	
	if (data.direccionAsociada) {
		this.direccionAsociada = usig.Direccion.fromObj(data.direccionAsociada);
	}
	
	if (data.contenido) {
		$.each(data.contenido, function(i, dato) {
			this.datos[dato.nombreId] = {
				alias: dato.nombre,
				valor: dato.valor,
				pos: dato.posicion
			}
		});
	}
	
	/**
	 * Devuelve el nombre del objeto
	 * @returns {String} El nombre del objeto
	 */
	this.toString = function() {
		return this.nombre;
	}
}

usig.inventario.Objeto.defaults = {
	texts: {
		noName: 'Sin Nombre'
	}
}