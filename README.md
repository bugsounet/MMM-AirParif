# MMM-AirParif

Affiche la qualité de l'air du jour depuis l'API de AirParif

## Screenshoot
![](https://github.com/bugsounet/MMM-AirParif/blob/master/screenshoot.jpg)

## Installation
```
cd ~/Magicmirror/modules
git clone https://github.com/bugsounet/MMM-AirParif.git
cd MMM-AirParif
npm install
```

## Clé API

Afin d'utiliser le module MMM-AirParif, il est neccessaire de demander une clé API via ce formulaire :
https://www.airparif.asso.fr/rss/api.

Ici nous utilisons : "Indices du jour et du lendemain"

Il faudra cocher cette case lors de la demande

## Configuration
```
                {
                        module: 'MMM-AirParif',
                        position: 'top_right',
                        header: 'Qualité de l\'air',
                        config: {
                                key: "votre clé",
                                ville: ["93600,aulnay sous bois" , "77230,thieux"],
                                polluants: true,
                                update: 60
                        }
                },
```

* key: mettre votre clé fourni par AirParif
* ville: code postal et ville à afficher. Doit être sous la forme : ["code postal,ville"]
* polluants : affiche le nom des polluants -> true : affiche / false : n'affiche pas
* update : Temps avant mise à jour des informations en minutes

### Remarques: 
* Il est possible de demander l'affichage plusieures villes (voir exemple de configuration)
* AirParif est uniquement conçu pour afficher les villes en île-de-france

## Support et aide
Toute aide peut-être demandé sur [le forum 4th Party Modules](http://forum.bugsounet.fr)
