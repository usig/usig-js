# Automatizacion de actualizacion de USIG-JS
HOST=10.20.1.164
HOST_DIR=/d/usig/www/servicios/Usig-JS

HOSTS=10.20.1.43 10.20.1.46 10.20.1.91 10.20.1.96 10.20.2.79 10.20.2.80
APPDIR=/usr/local/usig/servicios/Usig-JS

VERSION=dev
USER=usig
SRC=src/dev
REL=src/release
APPD=/d/usig/www/servicios/Usig-JS

INVENTARIO_FILES=\
      $(SRC)/usig.core.js \
      $(SRC)/usig.util.js \
      $(SRC)/jquery.class.js \
      $(SRC)/usig.AjaxComponent.js \
      $(SRC)/usig.Inventario.js \
      $(SRC)/usig.inventario.Objeto.js \
      $(SRC)/usig.inventario.Clase.js \
      $(SRC)/usig.inventario.Ubicacion.js

AUTOCOMPLETER_FILES=\
      $(SRC)/usig.core.js \
      $(SRC)/usig.util.js \
      $(SRC)/jquery.class.js \
      $(SRC)/usig.InputController.js \
      $(SRC)/usig.AutoCompleter.js \
      $(SRC)/usig.AutoCompleterDialog.js \
      $(SRC)/usig.Suggester.js
      
AUTOCOMPLETER_STANDARD_FILES=\
	  $(AUTOCOMPLETER_FILES) \
      $(SRC)/usig.AjaxComponent.js \
      $(SRC)/usig.Punto.js \
      $(SRC)/usig.Calle.js \
      $(SRC)/usig.Direccion.js \
      $(SRC)/usig.GeoCoder.js \
      $(SRC)/usig.Inventario.js \
      $(SRC)/usig.inventario.Objeto.js \
      $(SRC)/usig.inventario.Clase.js \
      $(SRC)/usig.inventario.Ubicacion.js \
      $(SRC)/usig.SuggesterLugares.js \
      $(SRC)/usig.SuggesterDirecciones.js

AUTOCOMPLETER_DIRECCIONES_FILES=\
	  $(AUTOCOMPLETER_FILES) \
      $(SRC)/usig.AjaxComponent.js \
      $(SRC)/usig.Punto.js \
      $(SRC)/usig.Calle.js \
      $(SRC)/usig.Direccion.js \
      $(SRC)/usig.GeoCoder.js \
      $(SRC)/usig.inventario.Objeto.js \
      $(SRC)/usig.SuggesterDirecciones.js	  
	  
GEOCODER_FILES=\
      $(SRC)/usig.core.js \
      $(SRC)/usig.util.js \
      $(SRC)/jquery.class.js \
      $(SRC)/usig.AjaxComponent.js \
      $(SRC)/usig.Punto.js \
      $(SRC)/usig.Calle.js \
      $(SRC)/usig.Direccion.js \
      $(SRC)/usig.GeoCoder.js

SUGGESTER_FILES=\
      $(SRC)/usig.core.js \
      $(SRC)/usig.util.js \
      $(SRC)/jquery.class.js \
      $(SRC)/usig.Suggester.js

STOREDCOLLECTION_FILES=\
      $(SRC)/json.js \
      $(SRC)/jquery.class.js \
      $(SRC)/usig.Publisher.js \
      $(SRC)/usig.StoredCollection.js

INPUTCONTROLLER_FILES=\
      $(SRC)/usig.core.js \
      $(SRC)/usig.InputController.js

SUGGESTER_DIRECCIONES_FILES=\
      $(SRC)/usig.inventario.Objeto.js \
      $(SRC)/usig.SuggesterDirecciones.js
      
SUGGESTER_LUGARES_FILES=\
      $(SRC)/usig.AjaxComponent.js \
      $(SRC)/usig.Inventario.js \
      $(SRC)/usig.inventario.Objeto.js \
      $(SRC)/usig.inventario.Clase.js \
      $(SRC)/usig.inventario.Ubicacion.js \
      $(SRC)/usig.SuggesterLugares.js	

SUGGESTER_CATASTRO_FILES=\
      $(SRC)/usig.AjaxComponent.js \
      $(SRC)/usig.Punto.js \
      $(SRC)/usig.SeccionCatastral.js \
      $(SRC)/usig.ManzanaCatastral.js \
      $(SRC)/usig.ParcelaCatastral.js \
      $(SRC)/usig.IndiceCatastral.js \
      $(SRC)/usig.SuggesterCatastro.js

INDICE_CATASTRAL_FILES=\
      $(SRC)/usig.core.js \
      $(SRC)/usig.util.js \
      $(SRC)/jquery.class.js \
      $(SRC)/usig.Punto.js \
      $(SRC)/usig.AjaxComponent.js \
      $(SRC)/usig.SeccionCatastral.js \
      $(SRC)/usig.ManzanaCatastral.js \
      $(SRC)/usig.ParcelaCatastral.js \
      $(SRC)/usig.IndiceCatastral.js

MAPA_INTERACTIVO_FILES=\
      $(SRC)/usig.core.js \
      $(SRC)/usig.util.js \
      $(SRC)/usig.MapaInteractivo.js \
      $(SRC)/usig.GMLPlan.js

RECORRIDOS_FULL_FILES=\
      $(SRC)/usig.core.js \
      $(SRC)/usig.util.js \
      $(SRC)/jquery.class.js \
      $(SRC)/usig.AjaxComponent.js \
      $(SRC)/usig.Recorridos.js \
      $(SRC)/usig.Recorrido.js
      
RECORRIDOS_FILES=\
      $(SRC)/usig.Recorridos.js \
      $(SRC)/usig.Recorrido.js

PUBLISHER_FILES=\
      $(SRC)/jquery.class.js \
      $(SRC)/usig.Publisher.js

all: prepare

debug:$(FILES)
	cat $(INVENTARIO_FILES) > $(SRC)/usig.Inventario-debug.js
	cat $(AUTOCOMPLETER_FILES) > $(SRC)/usig.AutoCompleter-debug.js
	cat $(AUTOCOMPLETER_STANDARD_FILES) > $(SRC)/usig.AutoCompleterStandard-debug.js
	cat $(AUTOCOMPLETER_DIRECCIONES_FILES) > $(SRC)/usig.AutoCompleterDirecciones-debug.js
	sed -e '/usig\.debug(/ d' < $(SRC)/usig.AutoCompleter-debug.js > $(SRC)/usig.AutoCompleter-nodebug.js
	sed -e '/usig\.debug(/ d' < $(SRC)/usig.AutoCompleterStandard-debug.js > $(SRC)/usig.AutoCompleterStandard-nodebug.js
	sed -e '/usig\.debug(/ d' < $(SRC)/usig.AutoCompleterDirecciones-debug.js > $(SRC)/usig.AutoCompleterDirecciones-nodebug.js
	cat $(GEOCODER_FILES) > $(SRC)/usig.GeoCoder-debug.js
	cat $(SUGGESTER_FILES) > $(SRC)/usig.Suggester-debug.js
	cat $(INPUTCONTROLLER_FILES) > $(SRC)/usig.InputController-debug.js
	cat $(SUGGESTER_DIRECCIONES_FILES) > $(SRC)/usig.SuggesterDirecciones-debug.js
	cat $(SUGGESTER_LUGARES_FILES) > $(SRC)/usig.SuggesterLugares-debug.js
	cat $(SUGGESTER_CATASTRO_FILES) > $(SRC)/usig.SuggesterCatastro-debug.js
	cat $(INDICE_CATASTRAL_FILES) > $(SRC)/usig.IndiceCatastral-debug.js
	cat $(MAPA_INTERACTIVO_FILES) > $(SRC)/usig.MapaInteractivo-debug.js
	cat $(RECORRIDOS_FILES) > $(SRC)/usig.Recorridos-debug.js
	cat $(RECORRIDOS_FULL_FILES) > $(SRC)/usig.RecorridosFull-debug.js
	cat $(PUBLISHER_FILES) > $(SRC)/usig.Publisher-debug.js
	cat $(STOREDCOLLECTION_FILES) > $(SRC)/usig.StoredCollection-debug.js
	sed -e '/usig\.debug(/ d' < $(SRC)/usig.MapaInteractivo-debug.js > $(SRC)/usig.MapaInteractivo-nodebug.js
	wget -O $(SRC)/normalizadorDirecciones.min.js http://servicios.usig.buenosaires.gob.ar/nd-js/1.4/normalizadorDirecciones.min.js
	
clean:
	rm -f $(SRC)/*-debug.js
	rm -f $(SRC)/*-nodebug.js
	rm -f $(SRC)/normalizadorDirecciones.min.js

prepare: docs debug
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.core.js -o $(REL)/usig.core.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.util.js -o $(REL)/usig.util.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.ajax.js -o $(REL)/usig.ajax.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/jquery.class.js -o $(REL)/jquery.class.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.DataManager.js -o $(REL)/usig.DataManager.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.Events.js -o $(REL)/usig.Events.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.MapaReferencia.js -o $(REL)/usig.MapaReferencia.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.MapaEstatico.js -o $(REL)/usig.MapaEstatico.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.FotosParcela.js -o $(REL)/usig.FotosParcela.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.InputController.js -o $(REL)/usig.InputController.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.Mock.js -o $(REL)/usig.Mock.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.Calle.js -o $(REL)/usig.Calle.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.Punto.js -o $(REL)/usig.Punto.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.Direccion.js -o $(REL)/usig.Direccion.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.Suggester-debug.js -o $(REL)/usig.Suggester.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.AjaxComponent.js -o $(REL)/usig.AjaxComponent.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.AutoCompleterDialog.js -o $(REL)/usig.AutoCompleterDialog.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.InputController-debug.js -o $(REL)/usig.InputController.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.GeoCoder-debug.js -o $(REL)/usig.GeoCoder.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.Inventario-debug.js -o $(REL)/usig.Inventario.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.SuggesterDirecciones-debug.js -o $(REL)/usig.SuggesterDirecciones.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.SuggesterLugares-debug.js -o $(REL)/usig.SuggesterLugares.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.SuggesterCatastro-debug.js -o $(REL)/usig.SuggesterCatastro.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.IndiceCatastral-debug.js -o $(REL)/usig.IndiceCatastral.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.Publisher-debug.js -o $(REL)/usig.Publisher.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.Recorridos-debug.js -o $(REL)/usig.Recorridos.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.RecorridosFull-debug.js -o $(REL)/usig.RecorridosFull.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.StoredCollection-debug.js -o $(REL)/usig.StoredCollection.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.MapaInteractivo-nodebug.js -o $(REL)/usig.MapaInteractivo.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.AutoCompleter-nodebug.js -o $(REL)/usig.AutoCompleter.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.AutoCompleterStandard-nodebug.js -o $(REL)/usig.AutoCompleterStandard.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.AutoCompleterStandard-nodebug.js -o $(REL)/usig.AutoCompleterFull.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.AutoCompleterDirecciones-nodebug.js -o $(REL)/usig.AutoCompleterDirecciones.min.js
	java -jar bin/yuicompressor.jar --charset utf-8 $(SRC)/usig.AutoCompleterDirecciones-nodebug.js -o $(REL)/usig.AutoCompleterDireccionesFull.min.js
	cat $(SRC)/normalizadorDirecciones.min.js >> $(REL)/usig.AutoCompleterFull.min.js
	cat $(SRC)/normalizadorDirecciones.min.js >> $(REL)/usig.AutoCompleterDireccionesFull.min.js
	rsync -avz --exclude '.svn' --delete $(SRC)/demos/css $(REL)/demos/
	rsync -avz --exclude '.svn' --delete $(SRC)/ejemplos $(REL)/
	rsync -avz --exclude '.svn' --delete $(SRC)/css $(REL)/
	rsync -avz --exclude '.svn' --delete $(SRC)/images $(REL)/
	rsync -avz --exclude '.svn' --delete $(SRC)/lib $(REL)/
	rsync -avz --exclude '.svn' $(SRC)/tests/*.js $(REL)/tests/
	rm -f $(REL)/ejemplos.tar.gz
	for f in $(SRC)/demos/*.html; do \
		sed -e '/<!-- DEV -->/	 d' < $$f | sed -e 's/<!-- RELEASE \(.*\)-->/\1/g' - | sed -e "s/VERSION/$(VERSION)/g" - > $(REL)/demos/`basename $$f`; \
	done
	for f in $(SRC)/ejemplos/*.html; do \
		sed -e '/<!-- DEV -->/	 d' < $$f | sed -e 's/<!-- RELEASE \(.*\)-->/\1/g' - | sed -e "s/VERSION/$(VERSION)/g" - > $(REL)/ejemplos/`basename $$f`; \
	done
	for f in $(SRC)/ejemplos/*/*.html; do \
		sed -e '/<!-- DEV -->/	 d' < $$f | sed -e 's/<!-- RELEASE \(.*\)-->/\1/g' - | sed -e "s/VERSION/$(VERSION)/g" - > $(REL)/ejemplos/`basename \`dirname $$f\``/`basename $$f`; \
	done
	cp -r $(REL)/ejemplos $(REL)/ejemplos-usig-js
	for f in $(REL)/ejemplos/*.html; do \
		sed -e 's/script src="\.\.\//script src="http:\/\/servicios\.usig\.buenosaires\.gob\.ar\/usig-js\/$(VERSION)\//g' < $$f > $(REL)/ejemplos-usig-js/`basename $$f`; \
	done
	for f in $(REL)/ejemplos/*/*.html; do \
		sed -e 's/script src="\.\.\/\.\.\//script src="http:\/\/servicios\.usig\.buenosaires\.gob\.ar\/usig-js\/$(VERSION)\//g' < $$f > $(REL)/ejemplos-usig-js/`basename \`dirname $$f\``/`basename $$f`; \
	done	
	cd $(REL); rm ejemplos.rar; rar a -xejemplos-usig-js/.svn -x*/*/.svn ejemplos.rar ejemplos-usig-js; cd -
	rm -rf $(REL)/ejemplos-usig-js
	$(MAKE) clean
	
docs:
	java -jar ext-doc/ext-doc.jar -p ext-doc.xml -o doc/www -t ext-doc/template/ext/template.xml -verbose
	cp doc/index.html doc/www/
	
install:
	# rsync -e ssh -avzc --delete src/release/* $(USER)@$(HOST):$(HOST_DIR)/$(VERSION)
	# rsync -e ssh -avzc --delete doc/www/* $(USER)@$(HOST):$(HOST_DIR)/$(VERSION)/doc
	for host in $(HOSTS); do \
		rsync -e ssh -avzc --delete src/release/* $(USER)@$$host:$(APPDIR)/$(VERSION); \
		rsync -e ssh -avzc --delete doc/www/* $(USER)@$$host:$(APPDIR)/$(VERSION)/doc; \
	done

