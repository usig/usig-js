(function($){
    $.fn.tabla = function(options) {
		// build main options before element iteration
		var opts = $.extend({}, $.fn.tabla.defaults, options);
		var rowSpan = 0;
		var rowSpanHead = null;
		var rows = {};
		var colNames = new Array();
        var obj = $(this);
        var tableObj = null;
        var tableBodyObj = null;
        var propagating = null;
		
		function debug(obj) {
		    if (window.console && window.console.log)
			    window.console.log(obj);
		
		 };
		 
		function create() {
			tableObj = $(document.createElement('table'));
	        tableObj.attr('cellpadding', 0);
	        tableObj.attr('cellspacing', 0);
	        if (typeof(opts.cls)!='undefined')
	        	tableObj.addClass(opts.cls);
	        var trObj = $(document.createElement('tr'));
	        $(opts.columns).each(function() {
	        	var colName = this.name;
	        	colNames.push(colName);
	        	var thObj = $(document.createElement('th'));
				if (typeof(this.width)!='undefined')
					thObj.attr('width', this.width);
				if (typeof(this.cls)!='undefined')
					thObj.addClass(this.cls);
				if (typeof(this.title)!='undefined')
					thObj.attr('title', this.title);
				thObj.html(this.label);
	        	trObj.append(thObj);
	        	if (typeof(this.onHeaderClick) != "undefined") {
	        		var action = typeof(this.onHeaderClick) == "string"?this.onHeaderClick:this.onHeaderClick.action;
	        		var before = this.onHeaderClick.before;
	        		var after = this.onHeaderClick.after;
	        		var data = this.onHeaderClick.data;
			        switch(action) {
			        	case 'propagate':
			        		thObj.click(function() {
			        			if (typeof(before)=="function")
			        				before($(this));
			        			if (typeof(data)=="function")
			        				propagating = data($(this));
			        			else if (typeof(data)!="undefined")
			        				propagating = data;
			        			tableBodyObj.find('td').filter(function() { return $(this).data('name') == colName; }).trigger('click', propagating);
			        			if (typeof(after)=="function")
			        				after($(this));
			        			propagating = null;
			        		});
			        		break;
			        	case 'sort':
			        		alert('Lo siento. El sort no está implementado todavía :-(');
			        		break;
			        }
	        	}
	        });
	        tableObj.append($(document.createElement('thead')).append(trObj));
	        tableBodyObj = $(document.createElement('tbody'));
	        tableObj.append(tableBodyObj);
			obj.append(tableObj);
		}
		
		function addRow(row, id, props, prevRowId) {
	        var trObj = $(document.createElement('tr'));
			var currColShift = rowSpan > 0 ? 1 : 0;
			if (rowSpan > 0) rowSpan--;
			$(row).each(function(i) { 
        		var tdObj = $(document.createElement('td'));
        		tdObj.data('name', opts.columns[(i+currColShift)].name);
        		if (typeof(opts.columns[(i+currColShift)].cls)!='undefined' && this.classes==undefined)
        			tdObj.addClass(opts.columns[(i+currColShift)].cls);
        		if (this.classes)
        			tdObj.addClass(this.classes);
        		if (typeof(opts.columns[(i+currColShift)].onclick)=='function') {
        			tdObj.click(function(ev, data) {
        				opts.columns[(i+currColShift)].onclick($(this).parent('tr').data('id'), $(this), $(this).parent('tr').data('props'), data);
        			});
        			tdObj.css('cursor', opts.clickableCursor);
        		}
				if (typeof(this.text) != 'undefined') {
					if (typeof(this.rowspan) != "undefined") {
						if (i!=0) {
							alert('Los rowspan solo están soportados para la primera columna.');
						}
						tdObj.attr('rowspan', this.rowspan);
						if (rowSpan > 0) {
							alert('No están soportados múltiples rowspan simultáneos y cruzados.');
						}
						rowSpan = this.rowspan - 1;
						trObj.data('rowSpanTd', tdObj);
						trObj.data('rowSpanChilds', 0);
						rowSpanHead = trObj;
					}
					if (typeof(this.colspan) != "undefined") {
						tdObj.attr('colspan', this.colspan);						
					}
					if (typeof(this.title) != "undefined") {
						tdObj.attr('title', this.title);
					}
					tdObj.html(this.text);
				} else {
					tdObj[0].innerHTML = this;
				}
				trObj.append(tdObj);
			});
			if (currColShift > 0) {
				trObj.data('rowSpanHead', rowSpanHead);
				var childs = rowSpanHead.data('rowSpanChilds');
				rowSpanHead.data('rowSpanChilds', ++childs);
			}
			var rowId = (typeof(id)!="undefined")?id:0;
			var rowProps = (typeof(props)!="undefined")?props:{};
			if (prevRowId && rows[prevRowId])
				rows[prevRowId].after(trObj);
			else
				tableBodyObj.append(trObj);
			rows[rowId] = trObj;
			trObj.data('id', rowId)
				 .data('props', rowProps);
				 // .click(function() { debug($(this).data('id')); debug($(this).data('props'))} );
			return trObj;
		};
		
		function removeRow(id) {
			if (typeof(rows[id]) != "undefined") {
				if (rows[id].data('rowSpanChilds') > 0)
					rows[id].next('tr').prepend(rows[id].data('rowSpanTd').clone())
									   .data('rowSpanChilds', rows[id].data('rowSpanChilds')-1)
									   .data('rowSpanTd', rows[id].data('rowSpanTd').clone());
				if (typeof(rows[id].data('rowSpanHead')) != "undefined") {
					var childs = rowSpanHead.data('rowSpanChilds');
					rowSpanHead.data('rowSpanChilds', --childs);
				}
				rows[id].remove();
				rows[id] = undefined;
				return true;
			}
			return false;
		};
		
	    /**
	     * Agrega un handler para el evento 'click' en todas las celdas de la columna que se indica
	     * 
	     * @param {String} colName El nombre de la columna
	     * @param {Function} handler Una funcion que acepte los siguientes parametros:
	     * 				{Number} id El id de la fila
	     * 				{jQueried Dom Object} tdObj (opcional) El objeto TD que recibio el click
	     * 				{Object} props (opcional) El objeto con propiedades de la fila
	     * 				{Object} evData (opcional) Datos que acompañan al evento
	     * 
	     * @return {Boolean} True en caso de exito, False en caso de error en los parametros
	     */		
		function onClick(colName, handler) {
			if (typeof(opts.columns[jQuery.inArray(colName, colNames)]) != "undefined" && typeof(handler) == "function") {
				opts.columns[jQuery.inArray(colName, colNames)].onclick = handler;
				tableBodyObj.find('tr')
							.find('td')
							.filter(function() { return $(this).data('name') == colName; } )
							.unbind('click').click(function(ev, data) {
		        				handler($(this).parent('tr').data('id'), $(this), $(this).parent('tr').data('props'), data);
		        			})
        					.css('cursor', opts.clickableCursor);
        		return true;
			}
			return false;
		};
		
		function updateCell(rowId, colName, htmlContent) {
			if (typeof(opts.columns[jQuery.inArray(colName, colNames)]) && typeof(rows[rowId]) != "undefined") {
				rows[rowId].find('td').filter(function() { return $(this).data('name') == colName; }).html(htmlContent);
			}
		};
		
		function addClassToCell(rowId, colName, cls) {
			if (typeof(opts.columns[jQuery.inArray(colName, colNames)]) && typeof(rows[rowId]) != "undefined") {
				rows[rowId].find('td').filter(function() { return $(this).data('name') == colName; }).addClass(cls);
			}
		};
		
		function removeClassToCell(rowId, colName, cls) {
			if (typeof(opts.columns[jQuery.inArray(colName, colNames)]) && typeof(rows[rowId]) != "undefined") {
				rows[rowId].find('td').filter(function() { return $(this).data('name') == colName; }).removeClass(cls);
			}
		};

		
		create();
		
		return {
			addRow: 	addRow,
			removeRow: 	removeRow,
			onClick: 	onClick,
			updateCell: updateCell,
			addClassToCell: addClassToCell,
			removeClassToCell: removeClassToCell
			
		};
    }
        
	//
	// plugin defaults
	//
	$.fn.tabla.defaults = {
		clickableCursor: 'pointer'
	};
		
})(jQuery);