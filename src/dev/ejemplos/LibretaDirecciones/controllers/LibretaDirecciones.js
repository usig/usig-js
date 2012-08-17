function LibretaDirecciones(pagina, id) {
	
	function comparator(a, b) {
		if (a.clase == b.clase) {
			if (a.clase == 'Direcciones') {
				var dir1 = usig.Direccion.fromObj(a.ubicacion),
					dir2 = usig.Direccion.fromObj(b.ubicacion);
				return dir1.isEqual(dir2);
			} else if (a.clase == 'Lugares') {
				return a.ubicacion.id == b.ubicacion.id;
			}
		}
		return false;
	};

	this.count = function (){
		return store.count();
	};
	
	this.add = function (option) {
		var obj = {
			nombre: option.suggesterName=='Direcciones'?LibretaDirecciones.defaults.texts.noName:option.toString()+' ('+option.clase.getNombre()+')',
    		nombre_ubicacion: option.direccionAsociada?option.direccionAsociada.toString():option.toString(),
    		ubicacion: option.toJson(),
    		clase: option.suggesterName
    	};
		if (!store.exists(obj, comparator)) {			
			store.add(obj);
		}
	};
	
	this.clear = function(){
		store.clear();
		vista.render();
	};
	
	var store = new usig.StoredCollection (id),
		vista = new usig.views.LibretaDirecciones(pagina, store);
	
	vista.render();
	
}

LibretaDirecciones.defaults = {
	texts: {
		noName: 'Sin nombre'
	}
}