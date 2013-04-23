// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};


usig.Tracker = function(type, data) {
	
	
	this.trackAction = function(target, data, category, label) {
        // usig.debug(category+' track: '+target+' label: '+label);
		try {
			if (piwikTracker) {
				piwikTracker.trackLink( target, 'link', data );
			}
		} catch(e) {};
		try {
			if (_gaq) {
				// usig.debug(category+', '+target+','+label);
				_gaq.push(['_trackEvent', category, target, label]);
			}
		} catch(e) {};
	}
	
}

if (typeof (usig.tracker) == "undefined")
	usig.tracker = new usig.Tracker();