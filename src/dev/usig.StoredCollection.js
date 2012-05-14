// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};

/**
 * @class StoredCollection
 * Implementa una coleccion con almacenamiento persistido en el browser.<br/>
 * Requiere: jQuery-1.3.2+, jquery.class, usig.Publisher<br/>
 * @namespace usig
 * @constructor 
 * @param {String} storeId Nombre con el que se identificara la coleccion de objetos almacenada 
*/	
usig.StoredCollection = usig.Publisher.extend({
	
	init: function(storeId){
		this.storeId = storeId;
		this.collection = this.restore();
        this._super();
	},
	
	getId: function() {
		var random = Math.floor(Math.random()*100001);
		return new Date()*1 +random;		
	},
	
	store: function() {
		try {
			return localStorage.setItem( this.storeId, JSON.stringify( this.collection ) );
		} catch(e) {};
	},
	
	restore: function() {
		var store = undefined;
		try {
			var store = localStorage.getItem(this.storeId);
		} catch(e) {};
		return ( store && JSON.parse( store ) ) || [];		
	},
	
	/**
	 * Devuelve un elemento de la coleccion a partir de su id o la coleccion completa en caso de 
	 * que no se especifique un id
	 * @param {Integer} id (optional) Id del elemento a obtener
	 * @return {Object/Array} Elemento de la coleccion o coleccion completa
	 */
	get: function(id) {
		if (id) {
			var item = undefined;
			$.each(this.collection, function(i, val) {
				if (val.id == id) {
					item = val;
					return false;
				}
			});
			return item;
		} else {
			return this.collection;
		}
	},
	
	/**
	 * Permite modificar los atributos de un elemento de la coleccion. Dispara un evento 'edit' que lleva
	 * como parametro el item modificado.
	 * @param {Integer} id Id del elemento a editar
	 * @param {Object} attrs Objeto conteniendo los nuevos valores de los atributos.
	 */
	edit: function(id, attrs) {
		var item = undefined;
		$.each(this.collection, function(i, val) {
			if (val.id == id) {
				val = $.extend(val, attrs);
				item = val;
				return false;
			}
		});		
		this.store();
		this.trigger(new usig.Event('edit', item));		
	},
	
	/**
	 * Permite agregar un item a la coleccion. Dispara un evento 'add' que lleva como parametro
	 * el item agregado.
	 * @param {Object} item Objeto a agregar
	 */
	add: function(item) {
		try {
			if (item.id === undefined) {
				item.id = this.getId();
			}
			this.collection.push(item);
			this.store();
			this.trigger(new usig.Event('add', item));
		} catch(e) {
			throw(e);
		}
	},
	
	/**
	 * Permite eliminar un elemento de la coleccion. Dispara un evento 'remove' que lleva como 
	 * parametro el item eliminado.
	 * @param {Integer} id Id del elemento a eliminar.
	 */
	remove: function(id) {
		var item = this.get(id);
		if (item) {
			this.collection = this.collection.removeObject(item);
			this.store();
			this.trigger(new usig.Event('remove', item));
		}
	},
	
	/**
	 * Permite vaciar la coleccion completa. Dispara un evento 'clear' sin parametros.
	 */
	clear: function() {
		this.collection = [];
		try {
			localStorage.setItem( this.storeId, null );
		} catch(e) {};
		this.trigger(new usig.Event('clear'));
	},
	
	/**
	 * Permite conocer el numero de elementos almacenados en la coleccion.
	 * @return {Integer} Numero de elementos almacenados en la coleccion
	 */
	count: function() {
		return this.collection.length;
	},
	
	/**
	 * Permite buscar un elemento dentro de la coleccion
	 * @param {Object} needle Objeto a buscar
	 * @param {Function} comparator Funcion de comparacion que recibe de parametro los elementos a comparar
	 * @return {Boolean} Verdadero si el elemento esta en la coleccion
	 */
	exists: function(needle, comparator) {
		var found = false,
			l = this.collection.length;
		
		for (var i=0; i<l; i++) {
			if (comparator(needle, this.collection[i])) {
				found = true;
				break;
			}
		}
		return found;
	}
	
});