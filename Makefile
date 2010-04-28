# Automatizacion de actualizacion de USIG-JS
HOST=10.20.1.164
HOST_DIR=/d/usig/www/servicios/Usig-JS
VERSION=2.0
USER=usig
SRC=src/dev
REL=src/release
APPD=/d/usig/www/servicios/Usig-JS

INVENTARIO_FILES=\
      $(SRC)/usig.core.js \
      $(SRC)/jquery.jsonp-1.1.0.1.js \
      $(SRC)/json.js \
      $(SRC)/usig.Inventario.js \
      $(SRC)/usig.inventario.Objeto.js \
      $(SRC)/usig.inventario.Clase.js \
      $(SRC)/usig.inventario.Ubicacion.js

AUTOCOMPLETER_FILES=\
      $(SRC)/usig.core.js \
      $(SRC)/usig.Punto.js \
      $(SRC)/jquery.jsonp-1.1.0.1.js \
      $(SRC)/json.js \
      $(SRC)/usig.InputController.js \
      $(SRC)/usig.AutoCompleter.js \
      $(SRC)/usig.AutoCompleterView.js \
      $(SRC)/usig.GeoCoder.js \
      $(SRC)/usig.Inventario.js \
      $(SRC)/usig.inventario.Objeto.js \
      $(SRC)/usig.inventario.Clase.js \
      $(SRC)/usig.inventario.Ubicacion.js

GEOCODER_FILES=\
      $(SRC)/usig.core.js \
      $(SRC)/usig.Punto.js \
      $(SRC)/usig.Calle.js \
      $(SRC)/usig.Direccion.js \
      $(SRC)/usig.GeoCoder.js

INPUTCONTROLLER_FILES=\
      $(SRC)/usig.core.js \
      $(SRC)/usig.InputController.js


all: prepare

debug:$(FILES)
	cat $(INVENTARIO_FILES) > $(SRC)/usig.Inventario-debug.js
	cat $(AUTOCOMPLETER_FILES) > $(SRC)/usig.AutoCompleter-debug.js
	cat $(GEOCODER_FILES) > $(SRC)/usig.GeoCoder-debug.js
	cat $(INPUTCONTROLLER_FILES) > $(SRC)/usig.InputController-debug.js
	wget -O $(SRC)/normalizadorDirecciones.min.js http://usig.buenosaires.gov.ar/servicios/nd-js/1.0/normalizadorDirecciones.min.js
	
clean:
	rm -f $(SRC)/usig.Inventario-debug.js
	rm -f $(SRC)/usig.AutoCompleter-debug.js
	rm -f $(SRC)/usig.GeoCoder-debug.js
	rm -f $(SRC)/usig.InputController-debug.js
	rm -f $(SRC)/normalizadorDirecciones.min.js

prepare: docs debug
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.core.js -o $(REL)/usig.core.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.ajax.js -o $(REL)/usig.ajax.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.DataManager.js -o $(REL)/usig.DataManager.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.MapaReferencia.js -o $(REL)/usig.MapaReferencia.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.MapaEstatico.js -o $(REL)/usig.MapaEstatico.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.FotosParcela.js -o $(REL)/usig.FotosParcela.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.tabla.js -o $(REL)/usig.tabla.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.tabla.js -o $(REL)/usig.InputController.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.Mock.js -o $(REL)/usig.Mock.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.Calle.js -o $(REL)/usig.Calle.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.Direccion.js -o $(REL)/usig.Direccion.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.AutoCompleterView.js -o $(REL)/usig.AutoCompleterView.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.InputController-debug.js -o $(REL)/usig.InputController.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.GeoCoder-debug.js -o $(REL)/usig.GeoCoder.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 $(SRC)/usig.Inventario-debug.js -o $(REL)/usig.Inventario.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 -v $(SRC)/usig.AutoCompleter-debug.js -o $(REL)/usig.AutoCompleter.min.js
	java -jar bin/yuicompressor.jar --charset iso-8859-1 -v $(SRC)/usig.AutoCompleter-debug.js -o $(REL)/usig.AutoCompleterFull.min.js
	cat $(SRC)/normalizadorDirecciones.min.js >> $(REL)/usig.AutoCompleterFull.min.js
	rsync -avz --exclude '.svn' $(SRC)/demos/css $(REL)/demos/
	rsync -avz --exclude '.svn' $(SRC)/css $(REL)/
	rsync -avz --exclude '.svn' $(SRC)/tests/*.js $(REL)/tests/
	$(MAKE) clean
	
docs:
	java -jar ext-doc/ext-doc.jar -p ext-doc.xml -o doc/www -t ext-doc/template/ext/template.xml -verbose
	cp doc/index.html doc/www/
	
install:
	rsync -e ssh -avzc --delete src/release/* $(USER)@$(HOST):$(HOST_DIR)/$(VERSION)
	rsync -e ssh -avzc --delete doc/www/* $(USER)@$(HOST):$(HOST_DIR)/$(VERSION)/doc
