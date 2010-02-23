// Definicion del namespace
if (typeof (usig) == "undefined")
    usig = {};

if (typeof(usig.Ajax) == "undefined")
    usig.Ajax = {};

usig.Ajax = function () {
    this.req = {};
    this.isIE = false;
};

usig.Ajax.prototype.makeRequest = function (opts)
{
    if (opts.type != "POST")
        opts.type = "GET";
    
    this.onComplete = opts.success;
    this.onError = opts.error;
    
    var pointer = this;
    
    var url = opts.url+'?';
	var params = new Array();
    for (i in opts.data) {
    	if (typeof(opts.data[i]) != 'function')
    	   params.push(i+'='+opts.data[i]);
    }
    url = url+params.join('&');
    
    if (opts.dataType == 'jsonp') {
        var callbackName = 'jsonCallback'+new Date().getTime()+'';
        url = url+'&callback='+callbackName;
        var destroyer = function() { window[callbackName] = undefined; };
        window[callbackName] = function (data) { pointer.onComplete(data); pointer.removejscssfile(url, 'js'); setTimeout(destroyer, 100); };
        this.loadjscssfile(url, 'js');
    } else {
        // branch for native XMLHttpRequest object
        if (window.XMLHttpRequest)
        {
            this.req = new XMLHttpRequest();
            this.req.onreadystatechange = function () { pointer.processReqChange() };
            this.req.open("GET", url, true); //
            this.req.send(null);
        // branch for IE/Windows ActiveX version
        }
        else if (window.ActiveXObject)
        {
            this.req = new ActiveXObject("Microsoft.XMLHTTP");
            if (this.req)
            {
                this.req.onreadystatechange = function () { pointer.processReqChange() };
                this.req.open(meth, url, true);
                this.req.send();
            }
        }
    }
};


usig.Ajax.prototype.loadjscssfile = function(filename, filetype) {
     if (filetype=="js") { //if filename is a external JavaScript file
          var fileref=document.createElement('script')
          fileref.setAttribute("type","text/javascript")
          fileref.setAttribute("src", filename)
     }
     else if (filetype=="css") { //if filename is an external CSS file
          var fileref=document.createElement("link")
          fileref.setAttribute("rel", "stylesheet")
          fileref.setAttribute("type", "text/css")
          fileref.setAttribute("href", filename)
     }
     if (typeof fileref!="undefined")
          document.getElementsByTagName("head")[0].appendChild(fileref)
}

usig.Ajax.prototype.removejscssfile = function(filename, filetype) {
     var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none" //determine element type to create nodelist from
     var targetattr=(filetype=="js")? "src" : (filetype=="css")? "href" : "none" //determine corresponding attribute to test for
     var allsuspects=document.getElementsByTagName(targetelement)
     for (var i=allsuspects.length; i>=0; i--) { //search backwards within nodelist for matching elements to remove
          if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1)
               allsuspects[i].parentNode.removeChild(allsuspects[i]) //remove element by calling parentNode.removeChild()
     }
}


usig.Ajax.prototype.processReqChange = function()
{
    
    // only if req shows "loaded"
    if (this.req.readyState == 4) {
        // only if "OK"
        if (this.req.status == 200)
        {
            this.onComplete( this.req );
        } else {
            this.onError( this.req.status );
        }
    }
};
