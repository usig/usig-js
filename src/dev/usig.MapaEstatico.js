// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};

if (typeof (usig.debug) == "undefined") {
	usig.debug = function(object) {	
		if (window.console && window.console.log)
				window.console.log(object);
	};	
}

usig.MapaEstatico = function(opts) {
	var mapServer = 'http://usig.buenosaires.gov.ar/servicios/LocDir/mapa.phtml';
	var params = new Array();
	var regExpSMP = /[0-9][0-9]-[0-9]{3,3}[A-Z]?-[A-Z0-9]{3,4}/;
	if (typeof(opts.x) != "undefined" && typeof(opts.y) != "undefined" && !isNaN(parseFloat(opts.x)) && !isNaN(parseFloat(opts.y))) {
		params.push('x='+opts.x, 'y='+opts.y);
	} else if (typeof(opts.dir) != "undefined") {
		params.push('dir='+opts.dir);
	} else {
		if (opts.debug)
			usig.debug('Parametros incorrectos.');
		return;
	}
	if (typeof(opts.w) != "undefined" && !isNaN(parseInt(opts.w))) {
		params.push('w='+parseInt(opts.w));
	}
	if (typeof(opts.h) != "undefined" && !isNaN(parseInt(opts.h))) {
		params.push('h='+parseInt(opts.h));
	}
	if (typeof(opts.r) != "undefined" && !isNaN(parseInt(opts.r))) {
		params.push('r='+parseInt(opts.r));
	}
	if (typeof(opts.punto) != "undefined" && (opts.punto == 0 || opts.punto == 1)) {
		params.push('punto='+parseInt(opts.punto));
	}
	if (typeof(opts.desc) != "undefined") {
		params.push('desc='+opts.desc);
	}
	if (typeof(opts.smp) != "undefined") {
		if (regExpSMP.test(opts.smp)) {
			params.push('smp='+opts.smp);
		} else {
			if (opts.debug)
				usig.debug('SMP inválido: '+opts.smp);
		}
	}
	if (typeof(usig.DataManager) != "undefined") {
		if (!usig.DataManager.isRegistered('MapaEstatico')) {
			usig.DataManager.registerClass('MapaEstatico', {
				getter: function (className, id, params) {
					var img = document.createElement('img');
					img.src = mapServer+'?'+params.join('&');
					usig.DataManager.storeData(className, id, img);
					return img;
				}
			});
		}		
		return usig.DataManager.getData('MapaEstatico', params.join('&'), params);
	} else {
		var img = document.createElement('img');
		img.src = mapServer+'?'+params.join('&');
		if (opts.debug)
			usig.debug('Loading: '+img.src);
		return img;
	}
}