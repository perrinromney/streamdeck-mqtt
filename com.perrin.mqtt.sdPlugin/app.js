const topicMap = {}
const jsnMap = {}
let client = {}
const clientId = 'mqttjs_' + Math.random().toString(16).slice(2, 8)
// const host = 'ws://127.0.0.1:6251'
// const options = {
//   keepalive: 60,
//   clientId: clientId,
//   protocolId: 'MQTT',
//   protocolVersion: 4,
//   clean: true,
//   reconnectPeriod: 1000,
//   connectTimeout: 30 * 1000,
//   will: {
//     topic: 'WillMsg',
//     payload: 'Connection Closed abnormally..!',
//     qos: 0,
//     retain: false
//   },
// }
console.log('Connecting mqtt client')
// client = mqtt.connect(host, options)
// debugger
// client.on('error', (err) => {
//   console.log('Connection error: ', err)
//   client.end()
// })
// client.on('reconnect', () => {
//   console.log('Reconnecting...')
// })
// client.on("connect", () => {
//     client.subscribe("TestListener", (err) => {
//       if (!err) {
//         client.publish("TestListener", "Hello mqtt");
//       }
//     });
//   });
//   client.on('message', (topic, message, packet) => {
//     console.log(`Received Message: ${message.toString()} On topic: ${topic}`)
//     handleMessage(topic,message.toString())
//   })
      
$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsonObj) {
    console.log(`[connected] ${JSON.stringify(jsonObj)}`);
    console.log(`[connected]`, jsonObj);
    $SD.on('com.perrin.mqtt.action.willAppear', (jsonObj) => action.onWillAppear(jsonObj));
    $SD.on('com.perrin.mqtt.action.keyDown', (jsonObj) => action.onKeyDown(jsonObj));
    $SD.on('com.perrin.mqtt.action.didReceiveSettings', (jsonObj) => action.onDidReceiveSettings(jsonObj));
    $SD.on('com.perrin.mqtt.action.propertyInspectorDidAppear', (jsonObj) => { });
    $SD.on('com.perrin.mqtt.action.propertyInspectorDidDisappear', (jsonObj) => { });
    $SD.on('com.perrin.mqtt.action.sendToPlugin', (jsonObj) => action.onSendToPlugin(jsonObj));
};

function makeId(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
function handleMessage(topic,message){
    console.log('HANDLE MESSAGE',topic,message)
    for (const [key, value] of Object.entries(topicMap)) {
        if(value.valSubscribeTopic == topic){
            console.log('matching topic', topic, key, value, message);
            console.log('clearing title');
            console.log($SD);
            console.log(message);
            $SD.api.showAlert(jsnMap[key], 0)
            $SD.api.setTitle(key, message, 0)
        }
      }
}
const action = {
    onDidReceiveSettings: (jsonObj) => {
        console.log(`[onDidReceiveMessage] ${JSON.stringify(jsonObj)}`);
    },
    onWillAppear: (jsonObj) => {
        console.log(`[onWillAppear] ${JSON.stringify(jsonObj)}`);
        console.log(`[onWillAppear]`,jsonObj);
        topicMap[jsonObj.context] = jsonObj.payload.settings
        jsnMap[jsonObj.context] = jsonObj
        const clientId = 'mqttjs_' + Math.random().toString(16).slice(2, 8)
        const host = `ws://${jsonObj.payload.settings.valBroker}:${jsonObj.payload.settings.valPort || '1883'}`
        const options = {
          keepalive: 60,
          clientId: jsonObj.payload.settings.valClientId || clientId,
          protocolId: 'MQTT',
          protocolVersion: 4,
          clean: true,
          reconnectPeriod: 1000,
          connectTimeout: 30 * 1000,
          username:jsonObj.payload.settings.valUsername,
          password:jsonObj.payload.settings.valPassword,
          will: {
            topic: 'WillMsg',
            payload: 'Connection Closed abnormally..!',
            qos: 0,
            retain: false
          },
        }
        console.log('Connecting mqtt client')
        client = mqtt.connect(host, options)
        client.on('error', (err) => {
          console.log('Connection error: ', err)
          client.end()
        })
        client.on('reconnect', () => {
          console.log('Reconnecting...')
        })
        client.on("connect", () => {
            client.subscribe("TestListener1", (err) => {
              if (!err) {
                client.publish("TestListener1", "this one is custom");
              }
            });
          });
        client.on('message', (topic, message, packet) => {
          console.log(`Received Message: ${message.toString()} On topic: ${topic}`)
          handleMessage(topic,message.toString())
        })
        if(jsonObj.payload.settings.valSubscribeTopic){
            console.log('subscribing to ',jsonObj.payload.settings.valSubscribeTopic );
            client.subscribe(jsonObj.payload.settings.valSubscribeTopic,{ qos: 0 })
        }
        // this.setTitle(jsonObj, 'TESTING');

        $SD.api.sendToPropertyInspector(jsonObj.context, Utils.getProp(jsonObj, "payload.settings", {}), jsonObj.action);
    },
    onSendToPlugin: (jsonObj) => {
        console.log(`[onSendToPlugin] ${JSON.stringify(jsonObj)}`);
        if (jsonObj.payload) {
            $SD.api.setSettings(jsonObj.context, jsonObj.payload);
        }
    },
    onKeyDown: (jsonObj) => {
        console.log(jsonObj);
        let settings = jsonObj.payload.settings;
        console.log('settings', settings)
        if(settings.valPublishTopic) {client.publish(settings.valPublishTopic,settings.valMessage || '')}
        $SD.api.showOk(jsonObj.context)
        // $SD.api.setTitle(jsonObj.context,'pressed')
        

    },
    setTitle: function(jsn, title = '') {
        if (title || (this.settings && this.settings.hasOwnProperty('mynameinput'))) {
            console.log("watch the key on your StreamDeck - it got a new title...", title || this.settings.mynameinput);
            $SD.api.setTitle(jsn.context, title || this.settings.mynameinput);
        }
    },
};