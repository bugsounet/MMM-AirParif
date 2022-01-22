var NodeHelper = require("node_helper");
var request = require("request-promise");

logAIR = (...args) => { /* do nothing */ }

module.exports = NodeHelper.create({
  start: function() {
    this.API = "https://api.airparif.asso.fr/indices/prevision/commune?insee="
    this.url = ""
    this.data= {}
  },

  /*** Script de recuperation de toutes les infos ***/
  getData: async function(payload) {
    await this.insee(this.config.ville)

    this.url = this.API
    let nb=0
    logAIR("getData:", this.data)
    Object.entries(this.data).forEach(
      ([key, value]) => {
        if (nb == 0) this.url += key
        else this.url += ("&insee=" + key)
        nb++
      }
    )
    logAIR("getData URL:", this.url)
    await this.getAir(this.url) // envoi vers l'api de AirParif

    logAIR("getData SCAN Effectué")
    if (Object.keys(this.data).length) this.sendSocketNotification("RESULT", this.data) // envoie les donnnées
    else this.sendSocketNotification("RESULT", false) // pas de villes retournées (erreur)
    setInterval(() => { this.getUpdate() }, this.config.update*1000)
  },

  /*** Update Script **/
  /** new uniquement avec le node_helper **/
  getUpdate: async function() {
    await this.getAir(this.url)
    logAIR("SCAN Update Effectué")

    if (Object.keys(this.data).length) this.sendSocketNotification("RESULT", this.data) // envoie les donnnées
    else this.sendSocketNotification("RESULT", false) // pas de villes retournées (erreur)
  },

  /*** requete vers l'API de AirParif ***/
  getAir: function(url) {
    logAIR("AirParif request:", url)
    var ObjectTmp = {}
    return new Promise(resolve => {
      request({
        url: url,
        method: "GET",
        headers: {'User-Agent':'Request-Promise','X-Api-Key': this.config.key },
        json: true
      })
        .then(result => {
          logAIR("Données reçu par AirParif:",result)
          Object.entries(result).forEach(
            ([key, value]) => {
              logAIR("Placement des données pour",key)
              ObjectTmp[key]= {
                data: value
              }
            }
          )
          logAIR("Résulat:", ObjectTmp)
          logAIR("Mélange des données...")

          this.data = this.Merged({}, this.data, ObjectTmp)
          logAIR("Résultat final:", this.data)
          resolve()
        })
        .catch (err => {
          console.error("[AirParif][API] Erreur: " + err)
          console.error("[AirParif][API] Erreur: Aucune Donnée trouvé pour url", url)
          resolve()
        })
    })
  },

  /*** Requete code INSEE vers geo.api.gouv.fr et formate la ville ***/
  /** new: scan la config complete **/
  insee: function(villes, index = 1) {
    return new Promise(resolve => {
      villes.forEach(async data => {
        var split = data.split(',')
        var codepostal = split[0]
        var ville = split[1]
        logAIR("insee send requestInsee:", codepostal, ville)
        await this.requestInsee(codepostal, ville)
        if (index >= villes.length) {
          logAIR("insee: OK, les informations INSEE sont résolu!", "Nb villes:", villes.length, "/", index )
          resolve()
        } else {
          logAIR("insee: Recheche du suivant...", index)
          index++
        }
      })
    })
  },

  requestInsee: function(codepostal, ville) {
    return new Promise(resolve => {
      let tmpData = new Object()
      if (codepostal.substring(0,2) == "75") {
        let arr = codepostal.substring(3,5)
        let code = "751"+arr
        tmpData = {
          ville: ville,
          codepostal: codepostal,
          data: "Les données de AirParif seront ici ;)"
        }
        this.data[code]=tmpData
        logAIR("requestInsee -75- " + ville + ":", this.data[code])
        resolve()
      } else {
        var url = 'https://geo.api.gouv.fr/communes?codePostal=' + codepostal + '&nom=' + ville + '&fields=nom,code,codesPostaux&format=json'
        request({
          url: url,
          json: true,
          headers: {'User-Agent': 'Request-Promise'}
        })
          .then(data => {
            let code = data[0].code
            let nom = data[0].nom
            tmpData = {
              ville: nom,
              codepostal: codepostal,
              data: "Les données de AirParif seront ici ;)"
            }
            this.data[code]=tmpData
            logAIR("requestInsee " + ville + ":", this.data[code])
            resolve()
          })
          .catch (err => {
            if (err) console.error("[AirParif][INSEE] " + err)
            console.error("[AirParif][INSEE] Erreur Aucune Données:", codepostal, ville)
            resolve()
          })
      }
    })
  },

  /*** Reception notification par Socket ***/
  socketNotificationReceived: function(notification, payload) {
    switch (notification) {
      case "SCAN":
        this.getData(this.config)
        break
      case "INIT":
        this.config = payload
        if (this.config.debug) logAIR = (...args) => { console.log("[AIRPARIF]", ...args) }
        console.log("[AIRPARIF] " + require('./package.json').name + " Version:", require('./package.json').version)
        logAIR("Config:", this.config)
        break
    }
  },

/** Tools Merge 2 objets in deep **/
/** it's the configDeepMerge MM function **/
  Merged: function (result) {
    var stack = Array.prototype.slice.call(arguments, 1)
    var item
    var key
    while (stack.length) {
      item = stack.shift()
      for (key in item) {
        if (item.hasOwnProperty(key)) {
          if (typeof result[key] === "object" && result[key] && Object.prototype.toString.call(result[key]) !== "[object Array]") {
            if (typeof item[key] === "object" && item[key] !== null) {
              result[key] = this.Merged({}, result[key], item[key])
            } else {
              result[key] = item[key]
            }
          } else {
            result[key] = item[key]
          }
        }
      }
    }
    return result
  }
});
