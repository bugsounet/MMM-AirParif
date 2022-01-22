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
    update: 60*60,
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

    var AirParif = document.createElement("div")
    AirParif.className = "small data"
    AirParif.id = "AirParif"

    if (this.config.key == "") {
      AirParif.innerHTML = "Erreur: Merci de définir la Clé (key)."
      AirParif.className = "dimmed light small"
      return AirParif
    }

    if (!this.loaded) {
      AirParif.innerHTML = this.translate("LOADING");
      AirParif.className = "dimmed light small";
      return AirParif
    }

    // Starting build new version module
    if (result && Object.entries(result).length) {
      Object.entries(result).forEach(([code, data]) => {
        var datax = document.createElement("div")
        datax.id = "AirParif_datax"
        datax.className= data.ville

        var ville = document.createElement("div")
        ville.id = "AirParif_ville"
        ville.innerHTML = data.ville + ": "
        datax.appendChild(ville)

        if (!this.config.polluants) {
          var indice = document.createElement("div")
          indice.className = data.data[0].indice.replace(/ /g, "")
          indice.id = "AirParif_indicePOnly"
          indice.textContent = data.data[0].indice
          datax.appendChild(indice)
        }

        if (this.config.polluants) {
          var polluants = document.createElement("div")
          polluants.id = "AirParif_Days"
          datax.appendChild(polluants)
          var today = document.createElement("div")
          today.id = "AirParif_Polluants"

          var dateIndice = document.createElement("div")
          dateIndice.className = data.data[0].indice.replace(/ /g, "")
          dateIndice.id = "AirParif_indiceP"
          dateIndice.textContent = "Aujourd'hui: " + data.data[0].indice
          today.appendChild(dateIndice)

          var tomorrow = document.createElement("div")
          tomorrow.id = "AirParif_Polluants"
          Object.entries(data.data[0]).forEach(([poluant,level], nb) => {
            if (nb && (nb !== Object.keys(data.data[0]).length-1)) {
              var typeToday = document.createElement("div")
              typeToday.style.listStyleType = "none"
              typeToday.id = "AirParif_polluant"
              typeToday.innerHTML = poluant
              today.appendChild(typeToday)

              var valueToday = document.createElement("div")
              valueToday.className = level.replace(/ /g, "")
              valueToday.id = "AirParif_indice"
              valueToday.innerHTML = level
              typeToday.appendChild(valueToday)
            }
          })
          if (this.config.demain && (data.data[1] && data.data[1].indice)) {
            var dateIndice = document.createElement("div")
            dateIndice.className = data.data[1].indice.replace(/ /g, "")
            dateIndice.id = "AirParif_indiceP"
            dateIndice.textContent = "Demain: " + data.data[1].indice
            tomorrow.appendChild(dateIndice)
            Object.entries(data.data[1]).forEach(([poluant,level], nb) => {
              if (nb && (nb !== Object.keys(data.data[1]).length-1)) {
                var typeTomorrow = document.createElement("div")
                typeTomorrow.style.listStyleType = "none"
                typeTomorrow.id = "AirParif_polluant"
                typeTomorrow.innerHTML = poluant
                tomorrow.appendChild(typeTomorrow)

                var valueTomorrow = document.createElement("div")
                valueTomorrow.className = level.replace(/ /g, "")
                valueTomorrow.id = "AirParif_indice"
                valueTomorrow.innerHTML = level
                typeTomorrow.appendChild(valueTomorrow)
              }
            })
          }
          polluants.appendChild(today)
          polluants.appendChild(tomorrow)
        }
        AirParif.appendChild(datax)
      })
    }
    return AirParif
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
