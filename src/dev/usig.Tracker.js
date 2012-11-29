// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};


usig.Tracker = function(type, data) {
	
	
	this.trackAction = function(target, data, category, label) {
        // usig.debug('track: '+target);
		if(piwikTracker != undefined) {
			piwikTracker.trackLink( target, 'link', data );
		}
		if (_gaq != undefined) {
			// usig.debug(category+', '+target+','+label);
			_gaq.push(['_trackEvent', category, target, label]);
		}
	}
	
}

if (typeof (usig.tracker) == "undefined")
	usig.tracker = new usig.Tracker();