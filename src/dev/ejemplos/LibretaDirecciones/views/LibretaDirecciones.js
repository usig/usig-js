// Definicion del namespace
var usig = usig || {};

usig.views = usig.views || {};

usig.views.LibretaDirecciones = (function($) { // Soporte jQuery noConflict
return usig.Publisher.extend({
	
	init: function(pagina, collection) {
		this.list = $('#listaDirecciones');
		this.collection = collection;
		this.collection.on('add', this.update.createDelegate(this));
		this.collection.on('clear', this.render.createDelegate(this));
		this._super();
	},
	
	update: function(ev) {
		if (ev.type =='add') {
			this.list.append('<li>'+ev.data.nombre_ubicacion +'</li>');
		}
		try {
			this.list.listview('refresh');
		} catch(e) {};
		//this.list.trigger('create');
		this.trigger(new usig.Event('update'));
	},
	
	render: function() {
		this.lugares = this.collection.get();
		var self = this;
		this.list.empty();
		$.each(self.lugares, function(i, val){
			self.list.append('<li>'+val.nombre_ubicacion+'</li>');
		});			
		//this.list.trigger('create');
		this.trigger(new usig.Event('update'));
	}
});
//Fin jQuery noConflict support
})(jQuery);
