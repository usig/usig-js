// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};


/**
 * @requires OpenLayers/Layer/Vector.js
 */

/**
 * Class: usig.GMLPlan
 * Create a vector layer by parsing a GML file. The GML file is
 *     passed in as a parameter.
 *
 * Inherits from:
 *  - <OpenLayers.Layer.Vector>
 */
usig.GMLPlan = (function($) {
	var gmlPlanClass;
	return {
	  create: function(name, options) {
		if (!OpenLayers) {
			throw('ERROR: OpenLayers is not loaded.');
			return null;
		}
		if (!gmlPlanClass) {
			gmlPlanClass = OpenLayers.Class(OpenLayers.Layer.Vector, {
			
			 	format: null,
			 	
			 	formatOptions: null,
			 	
				  /**
			      * Property: loaded
			      * {Boolean} Flag for whether the GML data has been loaded yet.
			      */
			    loaded: false,
			    
			    edges: null,
			    
			    markers: null,
			    
			    styleMap:null,
			    rendererOptions: {zIndexing: true},
			    
				initialize: function(name, options) {
			        var newArguments = [];
			        this.styleMap = this.getStyle(options.template, options.baseUrl, options.tipoRecorrido);
			        newArguments.push(name, {styleMap: this.styleMap});
			        OpenLayers.Layer.Vector.prototype.initialize.apply(this, newArguments);
			        this.edges = new Array();
			        this.markers = new Array();
			    },
			
			    loadFeatures: function() {
			    	
			    	var options = {};
			   	 	OpenLayers.Util.extend(options, this.formatOptions);
			        if (this.map && !this.projection.equals(this.map.getProjectionObject())) {
			            options.externalProjection = this.projection;
			            options.internalProjection = this.map.getProjectionObject();
			        }    
			        
			        var gmlReader = this.format ? new this.format(options) : new OpenLayers.Format.GML(options);
			        
			    	gml = '<?xml version="1.0" encoding="utf-8"?><wfs:FeatureCollection xmlns:ms="http://mapserver.gis.umn.edu/mapserver" xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml">';
			    	gml += this.edges.join();
			    	gml += this.markers.join();
			    	gml += '</wfs:FeatureCollection>'; 
			    	usig.debug("en GML Plan");
					usig.debug(gml);
			    	this.loaded = true;
			    	this.addFeatures(gmlReader.read(gml));
			    	this.events.triggerEvent("loadend"); 
			    },
			    
			    
			    addMarker: function(feature) {
			    	this.markers.push('<gml:featureMember>' + feature + '</gml:featureMember>');
			    },
			    
			    addEdges: function(features) {
			    	ls = this.edges;
			    	$.each(features, function(i, feature) {
			    			ls.push('<gml:featureMember>' + feature + '</gml:featureMember>');
			    	});
			    },
			    
			    /**
			     * APIMethod: setVisibility
			     * Set the visibility flag for the layer and hide/show&redraw accordingly. 
			     * Fire event unless otherwise specified
			     * GML will be loaded if the layer is being made visible for the first
			     * time.
			     *  
			     * Parameters:
			     * visible - {Boolean} Whether or not to display the layer 
			     *                          (if in range)
			     * noEvent - {Boolean} 
			     */
			    setVisibility: function(visibility, noEvent) {
			        OpenLayers.Layer.Vector.prototype.setVisibility.apply(this, arguments);
			        if(this.visibility && !this.loaded){
			            // Load the GML
			        	this.events.triggerEvent("loadstart");
			            this.loadFeatures();
			        }
			    },
			
			    /**
			     * Method: moveTo
			     * If layer is visible and GML has not been loaded, load GML, then load GML
			     * and call OpenLayers.Layer.Vector.moveTo() to redraw at the new location.
			     * 
			     * Parameters:
			     * bounds - {Object} 
			     * zoomChanged - {Object} 
			     * minor - {Object} 
			     */
			    moveTo:function(bounds, zoomChanged, minor) {
			        OpenLayers.Layer.Vector.prototype.moveTo.apply(this, arguments);
			         if(this.visibility && !this.loaded){
			            this.events.triggerEvent("loadstart");
			            this.loadFeatures();
			        }
			    },
			    
			    getFeatureByAttrId: function(featureId) {
			        //TBD - would it be more efficient to use a hash for this.features?
			        var feature = null;
			        for(var i=0, len=this.features.length; i<len; ++i) {
			            if(this.features[i].attributes.fid == featureId) {
			                feature = this.features[i];
			                break;
			            }
			        }
			        return feature;
			    },
			    
			
			    highlightFeature: function(feature) {
			    	//var style = this.selectStyle;
			    	this.drawFeature(feature, this.styleMap.styles.select);
			    },
			    
			    setStyle: function(style){
			    	 this.styleMap = style;
			    },
			    
			    getStyle: function(template, baseUrl, tipoRecorrido) {
						
					defaultOpacity = 0.8;
					zIndexLine = 5;
					zIndexPoint = 6;
					zIndexMarker = 7;
					lineOptions = {strokeWidth: 5, strokeOpacity: defaultOpacity,graphicZIndex:zIndexLine};
					lineOptionsWalk = {strokeWidth: 4, strokeDashstyle: 'dashdot',strokeOpacity: defaultOpacity,graphicZIndex:zIndexLine};			

					//lineOptionsBikeCiclovia = {strokeWidth: 4, strokeColor: bikeColor,strokeOpacity: defaultOpacity,graphicZIndex:zIndexLine};

					if(template.marker != undefined) {
		   		    	externalGraphic = baseUrl+"images/" + template.marker;
		   		    } else {
		   		    	externalGraphic = baseUrl+"images/pincho_inclinado.png";
		   		    }
		   		    
		   		    color = template.color;
					
					styleMap = new OpenLayers.StyleMap(OpenLayers.Util.applyDefaults(
					        {fillColor: color, fillOpacity: 1, strokeColor: color , strokeWidth: 3, strokeOpacity:1},
						OpenLayers.Feature.Vector.style["default"]));
					
					if (tipoRecorrido=='transporte_publico'){
						var lookup = {
						    "walk": {"Point": {pointRadius: 12, graphicWidth:20, graphicHeight:20,externalGraphic:baseUrl+"images/recorrido_pie20x20.png",graphicZIndex:zIndexMarker},"Line": lineOptionsWalk },
						    "bus": {"Point": {pointRadius: 12, externalGraphic:baseUrl+"images/recorrido_colectivo20x20.png",graphicWidth:20, graphicHeight:20,graphicZIndex:zIndexMarker}, "Line": lineOptions  },
						    "subway": {"Point": {pointRadius: 12, graphicWidth:20, graphicHeight:20,
								externalGraphic:baseUrl+"images/recorrido_subte20x20.png",graphicZIndex:zIndexMarker}, "Line": lineOptions  },
						    "subwayA": {"Point": {pointRadius: 12, graphicWidth:20, graphicHeight:20,
								externalGraphic:baseUrl+"images/lineasubte-a.png",graphicZIndex:zIndexMarker}, "Line": lineOptions  },
						    "subwayB": {"Point": {pointRadius: 12, graphicWidth:20, graphicHeight:20,
								externalGraphic:baseUrl+"images/lineasubte-b.png",graphicZIndex:zIndexMarker}, "Line": lineOptions  },
						    "subwayC": {"Point": {pointRadius: 12, graphicWidth:20, graphicHeight:20,
								externalGraphic:baseUrl+"images/lineasubte-c.png",graphicZIndex:zIndexMarker}, "Line": lineOptions  },
						    "subwayD": {"Point": {pointRadius: 12, graphicWidth:20, graphicHeight:20,
								externalGraphic:baseUrl+"images/lineasubte-d.png",graphicZIndex:zIndexMarker}, "Line": lineOptions  },
						    "subwayE": {"Point": {pointRadius: 12, graphicWidth:20, graphicHeight:20,
								externalGraphic:baseUrl+"images/lineasubte-e.png",graphicZIndex:zIndexMarker}, "Line": lineOptions  },
							"subwayH": {"Point": {pointRadius: 12, graphicWidth:20, graphicHeight:20,
								externalGraphic:baseUrl+"images/lineasubte-h.png",graphicZIndex:zIndexMarker}, "Line": lineOptions  },
			
							"connection": {"Point": {pointRadius:6,graphicZIndex:zIndexPoint}, "Line": {strokeWidth: 8, strokeOpacity: defaultOpacity} },
						    //"connection": {"Point": {pointRadius:6, graphicWidth:35, graphicHeight:35,
					    	//externalGraphic:"images/recorrido_subte.png"}, "Line": lineOptions},
				   		
				   		    "train": {"Point": {pointRadius: 12, externalGraphic:baseUrl+"images/recorrido_tren20x20.png",graphicWidth:20, graphicHeight:20,graphicZIndex:zIndexMarker}, "Line": lineOptions  },
				   		    
				   		   	//"marker": {"Point": {externalGraphic:externalGraphic,graphicYOffset:-20,graphicWidth:20, graphicHeight:36},graphicZIndex:5, "Line": lineOptions  }
				   		    "marker": {"Point": {pointRadius: 7,fillColor:'#ffffff',strokeColor:color,graphicWidth:35, graphicHeight:35,graphicZIndex:zIndexMarker}, "Line": lineOptions  }
			
						}		
					}else if (tipoRecorrido=='walk'){
						var lookup = {
						    //"walk": {"Point": {pointRadius: 12, graphicWidth:35, graphicHeight:35,externalGraphic:baseUrl+"images/recorrido_pie.png",graphicZIndex:5},"Line": lineOptionsWalk },
							"walk": {"Point": {graphicWidth:35, graphicHeight:35,externalGraphic:baseUrl+"images/desde.png",graphicZIndex:zIndexMarker},"Line": lineOptionsWalk },
							"marker": {"Point": {externalGraphic:baseUrl+"images/hasta.png",graphicWidth:35, graphicHeight:35,graphicZIndex:zIndexMarker},  "Line": lineOptions  }
				   		    //"marker": {"Point": {externalGraphic:externalGraphic,graphicYOffset:-20,graphicWidth:20, graphicHeight:36},graphicZIndex:5, "Line": lineOptions  }
				   		    //"marker": {"Point": {pointRadius: 8,fillColor:"#aa9900",strokeColor: "#aa1100",graphicWidth:35, graphicHeight:35},graphicZIndex:5, "Line": lineOptions  }
						}	
					}else if (tipoRecorrido=='car'){
						var lookup = {
						    //"car": {"Point": {externalGraphic:baseUrl+"images/recorrido_auto.png",graphicWidth:35, graphicHeight:35,graphicZIndex:5}, "Line": lineOptions  },
							"car": {"Point": {externalGraphic:baseUrl+"images/desde_verde.png",graphicWidth:35, graphicHeight:35,graphicZIndex:zIndexMarker}, "Line": lineOptions  },
							"marker": {"Point": {externalGraphic:baseUrl+"images/hasta_verde.png",graphicWidth:35, graphicHeight:35,graphicZIndex:zIndexMarker}, "Line": lineOptions  }
				   		    //"marker": {"Point": {externalGraphic:externalGraphic,graphicYOffset:-20,graphicWidth:20, graphicHeight:36},graphicZIndex:5, "Line": lineOptions  }
				   		    //"marker": {"Point": {pointRadius: 8,fillColor:"#aa9900",strokeColor: "#aa1100",graphicWidth:35, graphicHeight:35},graphicZIndex:5, "Line": lineOptions  }
						}	
					}else if (tipoRecorrido=='bike'){
						walkColor = '#4EF039';
						bikeColor = '#aa1100';
						pointRadius = 4;
						lineOptionsBike = {strokeWidth: 3, strokeColor: bikeColor,strokeOpacity: defaultOpacity,graphicZIndex:zIndexLine};
						lineOptionsWalk = {strokeWidth: 4, strokeColor: walkColor, strokeDashstyle: 'dashdot',strokeOpacity: defaultOpacity,graphicZIndex:zIndexLine};
						//externalGraphic = baseUrl+"images/pincho_inclinado.png";
						var lookup = {
						    //"walk": {"Point": {pointRadius: 12, graphicWidth:35, graphicHeight:35,externalGraphic:baseUrl+"images/recorrido_pie.png",graphicZIndex:5},"Line": lineOptionsWalk },
						    //"walk": {"Point": {pointRadius: pointRadius,  fillOpacity:1,strokeColor: walkColor, graphicWidth:35, graphicHeight:35,graphicZIndex:5},"Line": lineOptionsWalk },
							"walk": {"Point": {pointRadius: pointRadius,strokeColor: walkColor, fillColor:walkColor,graphicZIndex:zIndexPoint},"Line": lineOptionsWalk },
						    //"bike": {"Point": {externalGraphic:baseUrl+"images/recorrido_bici.png",graphicWidth:35, graphicHeight:35,graphicZIndex:5}, "Line": lineOptionsBike  },
						    "bike": {"Point": {pointRadius: pointRadius,strokeColor: bikeColor,fillColor:bikeColor,graphicZIndex:zIndexPoint}, "Line": lineOptionsBike  },
							//"Carril preferencial": {"Point": {externalGraphic:baseUrl+"images/recorrido_bici.png",graphicWidth:35, graphicHeight:35,graphicZIndex:5}, "Line": lineOptionsBike  },
						    "Carril preferencial": {"Point": {pointRadius: pointRadius,fillColor:bikeColor,strokeColor: bikeColor,graphicWidth:35, graphicHeight:35,graphicZIndex:zIndexPoint}, "Line": lineOptionsBike  },
						    //"Ciclovía": {"Point": {externalGraphic:baseUrl+"images/recorrido_bici.png",graphicWidth:35, graphicHeight:35,graphicZIndex:5}, "Line": lineOptionsBike  },
						    "Ciclovía": {"Point": {pointRadius: pointRadius,fillColor:bikeColor,strokeColor:bikeColor,graphicWidth:35, graphicHeight:35,graphicZIndex:zIndexPoint}, "Line": lineOptionsBike},
				   		    "begin": {"Point": {externalGraphic:baseUrl+"images/desde_verde.png", pointRadius: 8,graphicWidth:35, graphicHeight:35, graphicZIndex:zIndexMarker}, "Line": lineOptions  },
				   		    "end": {"Point": {externalGraphic:baseUrl+"images/hasta_verde.png", pointRadius: 8,graphicWidth:35, graphicHeight:35,graphicZIndex:zIndexMarker}, "Line": lineOptions  }
						}	
					}
		
					styleMap.addUniqueValueRules("default", "type", lookup);
					return styleMap;
				},
					
					
					CLASS_NAME: "usig.GMLPlan"
			
					
			}); 
		}
		return new gmlPlanClass(name, options);
	}
  };
})(jQuery);