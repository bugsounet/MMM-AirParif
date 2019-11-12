/* Magic Mirror Module: MMM-AirParif
 * Version: 1.0.0
 */

Module.register("MMM-AirParif", {
	defaults: {
		key: "",
		ville: [],
		polluants: true,
		delay: 60 * 60 * 1000,
		animationSpeed: 1000
	},

	start: function () {
		Log.info("Starting module: " + this.name);
		this.config = this.configAssignment({}, this.defaults, this.config);
		this.loaded = false;
		this.result = {}
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
			var ind = this.result.data[i].indice;
			var ville = this.result.ville[i];
			var indClass = "";

			switch (true) {
			case ind <= 0:
				indClass = "empty";
				break;
			case ind > 0 && ind < 25:
				indClass = "TFaible";
				break;
			case ind >= 25 && ind < 50:
				indClass = "Faible";
				break;
			case ind >= 50 && ind < 75:
				indClass = "Moyen";
				break;
			case ind >= 75 && ind < 100:
				indClass = "Eleve";
				break;
			case ind >= 100:
				indClass = "TEleve";
				break;
			}

			var villeCell = document.createElement("td");
			villeCell.className = "ville " + indClass;
			villeCell.innerHTML = ville;
			Row.appendChild(villeCell);

			var indCell = document.createElement("td");
			indCell.className = "indice " + indClass;
			indCell.innerHTML = ind;
			Row.appendChild(indCell);

			dataTable.appendChild(Row);

			if (this.config.polluants) {
				var polluants = this.result.data[i].polluants;
				var polRow = "";
				var polVilleCell = "";
				var polIndCell = "";

				Object.keys(polluants).forEach(function (what) {
					polRow = document.createElement("tr");

					polVilleCell = document.createElement("td");
					if (what == 0) {
						polVilleCell.className = "xsmall iaqi value " + indClass;
						if (Object.keys(polluants).length > 1) polVilleCell.innerHTML = "Polluants :"
						else polVilleCell.innerHTML = "Polluant :"
					}
					polRow.appendChild(polVilleCell);

					polWhatCell = document.createElement("td");
					polWhatCell.className = "xsmall iaqi value " + indClass;
					polWhatCell.innerHTML = polluants[what];
					polRow.appendChild(polWhatCell);
					dataTable.appendChild(polRow);
				});
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
			this.result = payload
			this.loaded = true
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
			self.counter = this.config.delay;
			self.updateDom(this.config.animationSpeed);

        	self.interval = setInterval(function () {
            		self.counter -= 1000;
            		if (self.counter <= 0) {
				clearInterval(self.interval);
				self.sendSocketNotification("UPDATE");
            		}
        	}, 1000);
        },

/* telegrambot commands */

	getCommands: function () {
	  return [
		{
        		command: "air",
        		callback: "telegramCommand",
        		description: "Affiche la qualité de l'air"
      		}
	  ]
	},

  	telegramCommand: function(command, handler) {
		if (command == "air") this.cmd_air(handler);
  	},

	cmd_air: function(handler) {
		var self = this
		var text = ""
		var end = false
		var result = this.result

		if(Object.keys(result).length > 0) {
			for (var i in result.ville) {
				var ind = this.result.data[i].indice;
				var ville = this.result.ville[i];
				var indText = "";
				text += "* " + ville + ":* "

				switch (true) {
					case ind <= 0:
						indText = "Vide";
						break;
					case ind > 0 && ind < 25:
						indText = "Très Faible";
						break;
					case ind >= 25 && ind < 50:
						indText = "Faible";
						break;
					case ind >= 50 && ind < 75:
						indText = "Moyen";
						break;
					case ind >= 75 && ind < 100:
						indText = "Elevé";
						break;
					case ind >= 100:
						indText = "Très Elevé";
						break;
				}
				text += "Indice " + ind + " (" + indText + ") "

				if (this.config.polluants) {
					var polluants = this.result.data[i].polluants;

					Object.keys(polluants).forEach(function (what) {
						if (what == 0) {
							if (Object.keys(polluants).length > 1) text += " -- Polluants: "
							else text += " -- Polluant: "
						}
						text += polluants[what]
						if (what != Object.keys(polluants).length-1)  text += ","
					});
				}
				text += "\n"
			}
		} else {
			text += "*Erreur: Aucune Donnée*\n"
		}

		handler.reply('TEXT', text, {parse_mode:'Markdown'})

	},

});
