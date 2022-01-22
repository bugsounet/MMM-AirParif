/* Magic Mirror Module: MMM-AirParif
 *  Version 2.0.0
 *  by @bugsounet, Aldarande
 * compatible avec la version API Airparif 2.0.0
 */

logAIR = (...args) => { /* do nothing */ }

Module.register("MMM-AirParif", {
  defaults: {
    debug: false,
    key: "",
    ville: [],
    polluants: false,
    demain: false,
    update: 60*60*1000,
  },

  start: function () {
    this.config = configMerge({}, this.defaults, this.config)
    this.loaded = false
    this.result = {}
  },

  getStyles: function () {
    return ["MMM-AirParif.css", "weather-icons.css"]
  },

  getScripts: function () {
    return ["moment.js"]
  },

  getHeader: function () {
    return this.data.header
  },

  getDom: function () {
    var result = this.result
    var wrapper = document.createElement("div")

    if (this.config.key == "") {
      wrapper.innerHTML = "Erreur: Merci de définir la Clé (key)."
      wrapper.className = "dimmed light small"
      return wrapper
    }

    if (!this.loaded) {
      wrapper.innerHTML = this.translate("LOADING");
      wrapper.className = "dimmed light small";
      return wrapper
    }

    // Start building table.
    var dataTable = document.createElement("table")
    dataTable.className = "small data"
    if (result && Object.entries(result).length) { // @todo scan array data present
      Object.entries(result).forEach(([code, data]) => {
        var Row = document.createElement("tr")
        var ville = data.ville
        var ind = data.data

        var indClass = ""
        var villeCell = document.createElement("th")
        villeCell.className = "ville " + ville
        villeCell.innerHTML = ville + ": "
        Row.appendChild(villeCell)

        var indCellTD = document.createElement("td")
        indCellTD.className = "indiceP " + ind[0].indice.replace(/ /g, "")
        indCellTD.innerHTML = ind[0].indice
        Row.appendChild(indCellTD)

        if (this.config.demain == true && (ind[1] && ind[1].indice)) {
          var indCellTM = document.createElement("td")
          indCellTM.className = "indiceP " + ind[1].indice.replace(/ /g, "")
          indCellTM.innerHTML = ind[1].indice
          Row.appendChild(indCellTM)
        }

        dataTable.appendChild(Row)

        if (this.config.polluants) { //@todo better
          for (var j = 1 ; j < Object.keys(ind[0]).length-1 ; j++) {
            var PolLig = document.createElement("tr")
            PolLig.className = "Polluants"

            var PolCellLig = document.createElement("th")
            PolCellLig.style.listStyleType = "none"
            PolCellLig.className = "lignePolluant"
            PolCellLig.innerHTML = Object.keys(ind[0])[j]
            PolLig.appendChild(PolCellLig)

            var PolCellTD = document.createElement("td")
            PolCellTD.style.listStyleType = "none"
            PolCellTD.className = "indice " + ind[0][Object.keys(ind[0])[j]].replace(/ /g, "")
            PolCellTD.innerHTML =  ind[0][Object.keys(ind[0])[j]]
            PolLig.appendChild(PolCellTD)

            if (this.config.demain == true && (ind[1] && ind[1].indice)) {
              var PolCellTM = document.createElement("td")
              PolCellTM.style.listStyleType = "none"
              PolCellTM.className = "indice " + ind[1][Object.keys(ind[0])[j]].replace(/ /g, "")
              PolCellTM.innerHTML =  ind[1][Object.keys(ind[0])[j]]
              PolLig.appendChild(PolCellTM)
            }
            dataTable.appendChild(PolLig)
          }
        }
      })
    } else {
      var row1 = document.createElement("tr")
      dataTable.appendChild(row1)

      var messageCell = document.createElement("td")
      messageCell.innerHTML = "Erreur: Aucune Donnée"
      messageCell.className = "bright"
      row1.appendChild(messageCell)
    }

    wrapper.appendChild(dataTable)
    return wrapper
  },

  notificationReceived: function (notification, payload) {
    if (notification === 'DOM_OBJECTS_CREATED') {
      //DOM creation complete, let's start the module
      if (this.config.debug) logAIR = (...args) => { console.log("[AIRPARIF]", ...args) }
      this.sendSocketNotification("INIT", this.config)
      this.sendSocketNotification("SCAN")
    }
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "RESULT" ) {
      this.result = payload
      this.loaded = true
      logAIR(this.result)
      this.updateDom()
    }
  }
});
