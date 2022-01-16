/* Magic Mirror Module: MMM-AirParif
 *  Version 2.0.0
 *  by Aldarande
 * compatible avec le version API Airparif 2.0.0 
 */

var log;

Module.register("MMM-AirParif", {
	defaults: {
		key: "",
		ville: [],
		polluants: false,
		demain : false,
		update: 60,
		demain: true,
	},

	start: function () {
		Log.info("Starting module: " + this.name);
		this.config = this.configAssignment({}, this.defaults, this.config);
		this.loaded = false;
		this.result = {};
		
	},

	getStyles: function () {
		return ["MMM-AirParif.css", "weather-icons.css"];
	},

	getScripts: function () {
		return ["moment.js"];
	},

	getHeader: function () {
		return this.data.header;
	},

	getDom: function () {
		var self = this;
		var result = this.result;
		var wrapper = document.createElement("div");
		
		if (self.config.key == "") {
			wrapper.innerHTML = "Erreur: Merci de définir la Clé (key).";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		
		// Start building table.
		var dataTable = document.createElement("table");
		dataTable.className = "small data";
		
		if(Object.keys(result).length > 0) {		   
				for (var i in result.ville) {			
				var Row = document.createElement("tr");
				var ville = result.ville[i];
				var ind = result.data[i];
				
				var indClass = "";
				var villeCell = document.createElement("th");
				villeCell.className = "ville " + ville;
				villeCell.innerHTML = ville + " : ";
				Row.appendChild(villeCell);
				
				var indCellTD = document.createElement("td");
				indCellTD.className = "indiceP " + ind[0].indice.replace(/ /g, "");
				indCellTD.innerHTML = ind[0].indice;
				Row.appendChild(indCellTD);	
				

				if (this.config.demain == true) {

				var indCellTM = document.createElement("td");
				indCellTM.className = "indiceP " + ind[1].indice.replace(/ /g, "");
				indCellTM.innerHTML = ind[1].indice;
				Row.appendChild(indCellTM);	
				}

				dataTable.appendChild(Row);
				
				if (this.config.polluants){

						for (var j = 1 ; j < Object.keys(ind[0]).length-1 ; j++) {

							var PolLig = document.createElement("tr");
							PolLig.className = "Polluants" ; //Object.keys(ind[0])[j];

							var PolCellLig = document.createElement("th");
							PolCellLig.style.listStyleType = "none";
							PolCellLig.className = "ligne";
							PolCellLig.innerHTML = Object.keys(ind[0])[j];
							PolLig.appendChild(PolCellLig);
							
							var PolCellTD = document.createElement("td");
							PolCellTD.style.listStyleType = "none";
							PolCellTD.className = "indice " + ind[0][Object.keys(ind[0])[j]].replace(/ /g, "");
							PolCellTD.innerHTML =  ind[0][Object.keys(ind[0])[j]];
							PolLig.appendChild(PolCellTD);

							if (this.config.demain == true) {
							var PolCellTM = document.createElement("td");
							PolCellTM.style.listStyleType = "none";
							PolCellTM.className = "indice " + ind[1][Object.keys(ind[0])[j]].replace(/ /g, "");
							PolCellTM.innerHTML =  ind[1][Object.keys(ind[0])[j]];
							PolLig.appendChild(PolCellTM);

							dataTable.appendChild(PolLig);
							}
					}			
				}
			}
		} else {
			var row1 = document.createElement("tr");
			dataTable.appendChild(row1);

			var messageCell = document.createElement("td");
			messageCell.innerHTML = "Erreur: Aucune Donnée";
			messageCell.className = "bright";
			row1.appendChild(messageCell);
		}
	
		wrapper.appendChild(dataTable);
		return wrapper;
	},

	notificationReceived: function (notification, payload) {
        	if (notification === 'DOM_OBJECTS_CREATED') {
            		//DOM creation complete, let's start the module
            		this.sendSocketNotification("SCAN", this.config);
        	}
	},

	socketNotificationReceived: function (notification, payload) {
		var self = this
		if (notification === "RESULT" ) {
			this.result = payload;
			this.loaded = true;
			this.UpdateInterval();
		}
	},

  	configAssignment : function (config) {
    		var stack = Array.prototype.slice.call(arguments, 1)
    		var item
   		var key
    		while (stack.length) {
      			item = stack.shift()
      			for (key in item) {
        			if (item.hasOwnProperty(key)) {
          				if (typeof config[key] === "object" && config[key] && Object.prototype.toString.call(config[key]) !== "[object Array]") {
            					if (typeof item[key] === "object" && item[key] !== null) {
              						config[key] = this.configAssignment({}, config[key], item[key])
            					} else {
              						config[key] = item[key]
            					}
          				} else {
            					config[key] = item[key]
          				}
        			}
      			}
    		}
    		return config
  	},

        UpdateInterval: function () {
        	var self = this;
			clearInterval(self.interval);
			self.counter = this.config.update * 60 * 1000;
			self.updateDom(1000);

        	self.interval = setInterval(function () {
            		self.counter -= 1000;
            		if (self.counter <= 0) {
				clearInterval(self.interval);
				self.sendSocketNotification("UPDATE");
            		}
        	}, 1000);
        },	
});
