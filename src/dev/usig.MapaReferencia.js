// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};

if (typeof (usig.debug) == "undefined") {
	usig.debug = function(object) {	
		if (window.console && window.console.log)
				window.console.log(object);
	};	
}

if (typeof (usig.isExtent) == "undefined") {
	usig.isExtent = function(e) {	
		return !isNaN(parseFloat(e.minx)) && !isNaN(parseFloat(e.miny)) && !isNaN(parseFloat(e.maxx)) && !isNaN(parseFloat(e.maxy));
	};	
}

usig.MapaReferencia = function(imagenMapa, pos, opts) {
	if (typeof(imagenMapa.img) != "undefined" && !isNaN(parseInt(imagenMapa.w)) && !isNaN(parseInt(imagenMapa.h)) && typeof(imagenMapa.extent) != "undefined" && usig.isExtent(imagenMapa.extent)) {
		var divMapa = document.createElement('div');
		divMapa.style.position = 'relative';
		divMapa.style.width = imagenMapa.w+'px';
		divMapa.style.height = imagenMapa.h+'px';
		divMapa.style.background = 'white url('+imagenMapa.img+') no-repeat 50% 50%';
		if (opts.cls)
			divMapa.className = opts.cls;
	} else {
		if (opts.debug)
			usig.debug('Parametros incorrectos: imagenMapa');
		return;		
	}
	if (!isNaN(parseFloat(pos.x)) && !isNaN(parseFloat(pos.y))) {
		var markerSize = usig.MapaReferencia.defaults.markerSize; 
		if (typeof(opts.markerSize)!= "undefined" && !isNaN(parseInt(opts.markerSize.w)) && !isNaN(parseInt(opts.markerSize.h))) {
			markerSize = opts.markerSize; 
		} 
		var offsetX = Math.floor((pos.x - imagenMapa.extent.minx)/((imagenMapa.extent.maxx - imagenMapa.extent.minx)/imagenMapa.w))-Math.floor(markerSize.w/2);
		var offsetY = imagenMapa.h - Math.floor((pos.y - imagenMapa.extent.miny)/((imagenMapa.extent.maxy - imagenMapa.extent.miny)/imagenMapa.h))-Math.floor(markerSize.h/2);		
	} else {
		if (opts.debug)
			usig.debug('Parametros incorrectos: pos');
		return;			
	}
	var divMarker = document.createElement('div');
	divMarker.style.position = 'absolute';
	divMarker.style.width = markerSize.w+'px';
	divMarker.style.height = markerSize.h+'px';
	divMarker.style.top = offsetY+'px';
	divMarker.style.left = offsetX+'px';
	if (opts.markerBorder)
		divMarker.style.border = opts.markerBorder;
	else
		divMarker.style.border = usig.MapaReferencia.defaults.markerBorder;
		
	if (opts.markerCls)
		divMarker.className = opts.markerCls;
		
	divMapa.appendChild(divMarker);
	return divMapa;
}

usig.MapaReferencia.defaults = {
	markerSize: { w: 4, h: 4 },
	markerBorder: '1px solid red'
}
