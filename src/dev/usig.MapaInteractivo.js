// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};
	
/**
 * @class MapaInteractivo
 * Esta clase implementa un mapa interactivo de Buenos Aires embebible en cualquier p�gina web.<br/>
 * Requiere: jQuery-1.3.2+, usig.core 2.1+, usig.util 2.1+, OpenLayers
 * Ejemplo de uso:
 * <pre><code>
 * ...
 * &lt;script src="http:&#47;&#47;ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js" type="text/javascript"&gt;&lt;/script&gt;
 * // El usig.MapaInteractivo.min.js ya tiene todos los componentes necesarios con excepcion de jQuery
 * &lt;script src="http:&#47;&#47;servicios.usig.buenosaires.gov.ar/usig-js/2.1/usig.MapaInteractivo.min.js" type="text/javascript"&gt;&lt;/script&gt;
 * ...
 * var ac = new usig.MapaInteractivo('id-div-mapa', {
 *              width: 600, // ancho en pixels
 *              height: 450 // alto en pixels
 *          });
 * 
 * </code></pre> 
 * Demo: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/2.1/demos/mapaInteractivo.html">http://servicios.usig.buenosaires.gov.ar/usig-js/2.1/demo/mapaInteractivo.html</a><br/>
 * Documentaci&oacute;n: <a href="http://servicios.usig.buenosaires.gov.ar/usig-js/2.1/doc/">http://servicios.usig.buenosaires.gov.ar/usig-js/2.1/doc/</a><br/>
 * @namespace usig
 * @cfg {Integer} width Ancho del mapa a construir (en pixeles).
 * @cfg {Integer} height Alto del mapa a construir (en pixeles).
 * @cfg {Function} onReady Callback que es llamada cuando el componente finalizo de cargar 
 * @constructor 
  * @param {String} idDiv Identificador del div en el que construir el mapa
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles 
*/	
usig.MapaInteractivo = function(idDiv, options) {
	var opts = $.extend({}, usig.MapaInteractivo.defaults, options),
		$div = $('#'+idDiv),
		mapWidth = parseInt($div.css('width')),
		mapHeight = parseInt($div.css('height')),
		direccionesMap = {},
		$indicatorImage = $('<img src="'+opts.rootUrl+'images/animated_indicator_medium.gif" alt="'+opts.texts.loading+'"/>');
		$divIndicator = $('<div class="indicator" style="-moz-border-radius-topleft: 10px; -webkit-border-top-left-radius: 10px; -moz-border-radius-topright: 10px; -webkit-border-top-right-radius: 10px; -moz-border-radius-bottomleft: 10px; -webkit-border-bottom-left-radius: 10px; -moz-border-radius-bottomright: 10px; -webkit-border-bottom-right-radius: 10px;"></div>'),
		map = navBar = panZoomBar = scalebar = overviewMap = sombrasDirecciones = direcciones = null;

	function init() {
		$divIndicator.remove();
		opts.OpenLayersOptions.maxExtent = new OpenLayers.Bounds(opts.bounds[0], opts.bounds[1], opts.bounds[2], opts.bounds[3]);
		opts.OpenLayersOptions.initBounds = new OpenLayers.Bounds(opts.initBounds[0], opts.initBounds[1], opts.initBounds[2], opts.initBounds[3]);
	    map = new OpenLayers.Map(idDiv, opts.OpenLayersOptions);
	    this.api = map;

	    this.api.zoomToMaxExtent = function(options) {
	    	this.zoomToExtent(opts.OpenLayersOptions.initBounds);
	    }
	    
    	opts.baseLayer = opts.initLocation?'mapabsas_'+opts.initLocation.map:opts.baseLayer;
		setBaseLayer(opts.baseLayer);
		
		map.zoomToExtent(opts.OpenLayersOptions.initBounds);
		if (opts.initLocation) {
			map.moveTo(new OpenLayers.LonLat(opts.initLocation.lon,opts.initLocation.lat), opts.initLocation.zl);
		} else {
			map.zoomToExtent(opts.OpenLayersOptions.initBounds);
		}
		
		//Control de escala
		scalebar = new OpenLayers.Control.ScaleBar({
	            // div: document.getElementById("scalebar"),
	            minWidth: 141,
	            maxWidth: 142
	           });
	    map.addControl(scalebar);
	 	
		panZoomBar = new OpenLayers.Control.PanZoomBar({
		      panner: true, 
		      zoomWorldIcon:true, 
		      textAcercar: opts.texts.panZoomBar.textAcercar,
		      textAlejar: opts.texts.panZoomBar.textAlejar,
		      verMapaCompleto: opts.texts.panZoomBar.verMapaCompleto
		  });
	 	// map.addControl(new OpenLayers.Control.Navigation()); 
		map.addControl(panZoomBar); 
		
	    navBar = new OpenLayers.Control.NavToolbar($.extend({}, opts.texts.navBar, {
	    	mapList: opts.mapList,
	    	activeMap: opts.baseLayer,
	    	mapSelectorTrigger: function(map) {
	    		if (map != 'none') {
	    			setBaseLayer(map);
	    		} else {
	    			setBaseLayer(usig.mapabsas2.mapasTematicos.getMapaActivo());
	    		}
	    	},
	    	clickHandler: function() {},
	    	handleRightClicks: true,
	    	rightClickHandler: function() {}
	    }));
	    
	    map.addControl(navBar); // Si ponemos el navBar no hace falta el Navigation
	    
	    overviewMap = new OpenLayers.Control.OverviewMap({
		    layers: [new OpenLayers.Layer.WMS("Referencia",getLayerURLs('referencia'), {layers: opts.overviewOptions.layer})],			
		    size: new OpenLayers.Size(opts.overviewOptions.size[0], opts.overviewOptions.size[1]),
		    minRatio: 12, 
		    maxRatio: 24,
	       	mapOptions: {
        		projection: opts.OpenLayersOptions.projection, 
        		units: opts.OpenLayersOptions.units, 
        		maxExtent: opts.OpenLayersOptions.maxExtent, 
	       		resolutions: opts.overviewOptions.resolutions
	       	}});
	       	
	    map.addControl(overviewMap);	
	    
		//Direcciones
        sombrasDirecciones = new OpenLayers.Layer.Vector(
                "Sombras de Direcciones", // Direcciones que ya no son lo que fueron
                {
                    styleMap: new OpenLayers.StyleMap({
                        // Set the external graphic and background graphic images.
                        externalGraphic: opts.rootUrl+"images/blank.gif", // marcador.png",
                        backgroundGraphic: opts.rootUrl+"images/pincho_inclinado_shadow.png",
                        
                        // Makes sure the background graphic is placed correctly relative
                        // to the external graphic.
                        graphicWidth: 33,
                        graphicHeight: 10,
                        graphicXOffset: -2,
                        graphicYOffset: -29,
                        backgroundXOffset: 1,
                        backgroundYOffset: -11,
                        
                        // Set the z-indexes of both graphics to make sure the background
                        // graphics stay in the background (shadows on top of markers looks
                        // odd; let's not do that).
                        graphicZIndex: opts.MARKER_Z_INDEX,
                        backgroundGraphicZIndex: opts.SHADOW_Z_INDEX,
                        
                        pointRadius: 10
                    }),
                    rendererOptions: {yOrdering: true}
                }
        );
        
		direcciones = new OpenLayers.Layer.Markers("Direcciones");

		map.addLayer(sombrasDirecciones);
		map.addLayer(direcciones);
	    
	};
	
	function getLayerURLs(layerName) {
		var urls = new Array();
		$.each(opts.servers,function(i,server) {
			urls.push(server + layerName);
		});

		return urls;
	}
	
	function setBaseLayer(layerName) {
		var currentLayer = map.baseLayer;
		if(currentLayer == undefined) {
			var layerUrls = getLayerURLs(layerName) ;
			map.addLayer(new OpenLayers.Layer.WMS(layerName, layerUrls , {layers: layerName, format: 'image/png'}, {transitionEffect: "resize", buffer: 0}));
		} else {
			if(currentLayer.name != layerName) {
				var layerUrls = getLayerURLs(layerName) ;
				try {
					map.removeLayer(currentLayer);
				} catch(e) {}
				map.addLayer(new OpenLayers.Layer.WMS(layerName, layerUrls, {layers: layerName, format: 'image/png'}, {transitionEffect: "resize", buffer: 0}));					
				//zoomToInitialBounds();
			}
		}
		if (navBar)
			navBar.selectMap(layerName);
	}
	
	//Direcciones
	this.addDir = function(dir, goTo, onClick) {
		// fijarse si el marker ya existe...
		// statusBar.activate(opts.texts.processing, true);
		var size = new OpenLayers.Size(20, 36);
		var offset = new OpenLayers.Pixel(-5, -size.h);
		var icon = new OpenLayers.Icon(opts.rootUrl+'images/pincho_inclinado.png', size, offset);
		// le agregamos una clase Marker para cambiar el puntero del mouse en el over
		icon.imageDiv.className = 'Marker';  
		var marker =  new OpenLayers.Marker(new OpenLayers.LonLat(dir.x,dir.y), icon);
        var markerShadow = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(dir.x, dir.y)
        );
		marker.dir = dir;
		marker.shadow = markerShadow;
		marker.events.registerPriority('click', marker, function(ev) {
			OpenLayers.Event.stop(ev, false);
			if (typeof(onClick) == "function") {
				onClick(ev, dir);
			}
		});
		// controlToolTip.onClickDir.createDelegate(controlToolTip, [dir], 0));
		
		direccionesMap[''+dir.id] = marker;
		direcciones.addMarker(marker);
		sombrasDirecciones.addFeatures(markerShadow);
		// statusBar.deactivate();
		
		if(goTo) {
			this.goTo(dir, true);
		}
        // controlToolTip.onClickDir(dir);
	}
	
	//Remueve una direccion
	this.removeDir = function(dir)	{
		marker = direccionesMap[''+dir.id];			
		direcciones.removeMarker(marker);
		sombrasDirecciones.removeFeatures(marker.shadow);
		marker.destroy();
		marker = undefined;
		direccionesMap[dir.id] = undefined;
	}
	
	this.delDirs = function(dir) {
		displayDir(dir,true);
	}	
	
	this.displayDir = function(dir, display) {
		direccionesMap[dir.id].display(display);
		if (!display)
			sombrasDirecciones.removeFeatures(direccionesMap[dir.id].shadow);
		else
			sombrasDirecciones.addFeatures(direccionesMap[dir.id].shadow);			
	}
	
	this.goTo = function(point, zoomIn) {
		if (zoomIn) {
			if (map.getZoom() == opts.goToZoomLevel) {
				map.panTo(new OpenLayers.LonLat(point.x,point.y));
			} else {
				map.moveTo(new OpenLayers.LonLat(point.x,point.y), opts.goToZoomLevel);
			}
		} else {
			map.panTo(new OpenLayers.LonLat(point.x,point.y));				
		}
	}
		
	if (typeof(OpenLayers) == "undefined") {
		$indicatorImage.css('padding', '10px');
		$divIndicator.css('background-color', '#fff')
			.css('width', '52px')
			.css('height', '52px')
			.css('border', '1px solid #ddd')
			.css('position', 'relative')
			.css('left', (mapWidth/2-26)+'px')
			.css('top', (mapHeight/2-26)+'px')
			.append($indicatorImage);
			
		$div.css('background-color', '#eee')
			.append($divIndicator);
		
		usig.loadCss(opts.OpenLayersCSS);
		usig.loadJs(opts.OpenLayersJS, init.createDelegate(this));
	} else {
		init();
	}
	
};

usig.MapaInteractivo.defaults = {
	bounds: [54340,54090,172855,140146],
	initBounds: [93500,96750,112000,106750],
	OpenLayersOptions: {
		controls: [],
		resolutions: [90,50,30,15,7.5,4,2,1,0.5,0.2],
		projection: "EPSG:221951",
		units: 'm'
	},
	
	baseLayer:'mapabsas_default',
	rootUrl: 'http://servicios.usig.buenosaires.gov.ar/usig-js/2.1/',	
	OpenLayersCSS: 'http://servicios.usig.buenosaires.gov.ar/OpenLayers/2.9.1-1/theme/default/style.css',
	OpenLayersJS: 'http://servicios.usig.buenosaires.gov.ar/OpenLayers/2.9.1-1/OpenLayers.js',
	overviewOptions: {
		layer:'referencia',
		resolutions: [130,70,30,15,7.5,4],
		size: [195, 130]
	},
	mapList: [
       	   {
	       	name:'mapabsas_imagen_satelital_2009',
	       	display:'Vista Satelital 2009',
	       	desc: 'Mapa que incluye imagen satelital QuickBird, a�o de toma 2009. El mapa presenta la imagen satelital de alta resoluci�n de la Ciudad de Buenos Aires con calles y alturas.'
	       },
	       {
	       	name:'mapabsas_imagen_satelital_2004',
	       	display:'Vista Satelital 2004',
	       	desc: 'Mapa que incluye imagen satelital QuickBird, a�o de toma 2004. El mapa presenta la imagen satelital de alta resoluci�n de la Ciudad de Buenos Aires con calles y alturas.'
	       },
	       {
	       	name:'mapabsas_fotografias_aereas_1978',
	       	display:'Vista A�rea 1978',
	       	desc: 'Mapa que incluye una imagen de la ciudad restituida a partir de fotograf�as a�reas tomadas en el a�o 1978. El mapa presenta tambi�n la informaci�n de calles y alturas actuales como referencia.'
	       },
	       {
	       	name:'mapabsas_fotografias_aereas_1965',
	       	display:'Vista A�rea 1965',
	       	desc: 'Mapa que incluye una imagen de la ciudad restituida a partir de fotograf�as a�reas tomadas en el a�o 1965. El mapa presenta tambi�n la informaci�n de calles y alturas actuales como referencia.'
	       },
	       {
	       	name:'mapabsas_fotografias_aereas_1940',
	       	display:'Vista A�rea 1940',
	       	desc: 'Mapa que incluye una imagen de la ciudad restituida a partir de fotograf�as a�reas tomadas en el a�o 1940. El mapa presenta tambi�n la informaci�n de calles y alturas actuales como referencia.'
	       }
		],
	texts: {
		processing: 'Procesando...',
		loading: 'Cargando...',
		actionBar: {
			printing: 'Imprimir Mapa',
			linking: 'Enlace a la vista actual',
			mailing: 'Enviar la vista actual por e-mail'
		},
		tituloMailing: 'Enviar vista actual por e-mail',
		panZoomBar:{
	      textAcercar: 'Acercar',
	      textAlejar: 'Alejar',
	      verMapaCompleto: 'Ver el mapa completo'
		},
		overviewMap:{
		    textMapaReferencia: 'Mapa de referencia interactivo',
		    textCerrar: 'Cerrar'	
		},
		navBar: {
			navigationText: 'Mover', 
			zoomBoxText: 'Acercar', 
			measureToolTexts: {
		    	buttonLabel: 'Medir',
		    	measure: 'Medida',
		    	measureDistance: 'Medir Distancia',
		    	measureArea: 'Medir �rea'
		    }
		}
	},
	goToZoomLevel: 7,
    SHADOW_Z_INDEX: 10,
    MARKER_Z_INDEX: 11,
	servers: ["http://tiles1.mapa.buenosaires.gob.ar/tilecache/", "http://tiles2.mapa.buenosaires.gob.ar/tilecache/", "http://tiles3.mapa.buenosaires.gob.ar/tilecache/", "http://tiles4.mapa.buenosaires.gob.ar/tilecache/", "http://tiles5.mapa.buenosaires.gob.ar/tilecache/", "http://tiles6.mapa.buenosaires.gob.ar/tilecache/", "http://tiles7.mapa.buenosaires.gob.ar/tilecache/"]
};
