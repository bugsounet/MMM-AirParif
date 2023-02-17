const NodeHelper = require('node_helper')

module.exports = NodeHelper.create({
  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "INIT":
        this.initialize()
        break
    }
  },

  initialize: async function() {
    console.error("[AIR] Initialize... failed!")
    console.error("[AIR] This module is now in End Of Life.")
  }
});
