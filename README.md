# MMM-AirParif

Affiche la qualité de l'air du jour depuis l'API de AirParif (avec l'API v2)

## Screenshoot
![](https://raw.githubusercontent.com/bugsounet/MMM-AirParif/dev/screenshot_airparif.jpg)

## Installation
```
cd ~/Magicmirror/modules
git clone https://github.com/bugsounet/MMM-AirParif.git
cd MMM-AirParif
npm install
```

## Clé API

Afin d'utiliser le module MMM-AirParif, il est neccessaire de demander une clé API via ce [formulaire](https://www.airparif.asso.fr/interface-de-programmation-applicative).
Vous pouvez cocher toutes les cases de choix "Indices du jour et du lendemain", "Alerte*", "Carte temps réél haute définition*" et "Pollens*".
* En vue de développement ...

Ici nous utilisons : "Indices du jour et du lendemain"
Il faudra cocher cette case lors de la demande

## Configuration
```js
  {
    module: 'MMM-AirParif',
    position: "top_left",
    config: {
      key: "", 
      ville: ["75013,Paris", "92400,courbevoie"], // Mettre "CP,Nom de Ville" séparer par ,
      polluants: true,
      demain: true,
      update: 10,
    }
  },
```

* `key`: mettre votre clé fourni par AirParif
* `ville`: code postal et ville à afficher. Doit être sous la forme : ["code postal,ville"]
* `polluants`: affiche le nom des polluants -> true : affiche / false : n'affiche pas
* `update`: Temps avant mise à jour des informations en minutes
* `demain`: pour afficher les statistiques du lendemain
* `polluant`: pour afficher les détailles des polluants

### Remarques: 
* Il est possible de demander l'affichage plusieures villes (voir exemple de configuration)
* AirParif est uniquement conçu pour afficher les villes en île-de-france

### En cas de souci: ce [forum](http://forum.bugsounet.fr) est disponible

### Merci @Aldarande pour sa participation pour la realisation de la V2 de ce module.

