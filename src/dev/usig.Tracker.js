// Definicion del namespace
if (typeof (usig) == "undefined")
	usig = {};


usig.Tracker = function(type, data) {
	
	
	this.trackAction = function(target, data, category) {
        // usig.debug('track: '+target);
		if(piwikTracker != undefined) {
			piwikTracker.trackLink( target, 'link', data );
		}
		if (_gaq != undefined) {
			_gaq.push(['_trackEvent', category, target]);
		}
	}
	
}

if (typeof (usig.tracker) == "undefined")
	usig.tracker = new usig.Tracker();