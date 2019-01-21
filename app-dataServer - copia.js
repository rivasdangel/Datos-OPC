/////////////////////////////////////////CLIENTE//////////////////////////////////////////////////////////////////////////////////////
var NanoTimer = require('nanotimer');
var timer = new NanoTimer();
var opcua = require("node-opcua");
var async = require("async");
var client = new opcua.OPCUAClient();
/**
 * @param {string} directorio de destino
 * @param {string} texto a escribir dentro del archivo
 * @param {function} manejador de funcion
 */
var endpointUrl = "opc.tcp://127.0.0.1:44818/UA/Logix5561;"; //Endpoint especificado en la configuración de OCP del KEPserver
var the_session = null;
var count;

var canal="s=CanalControl.";
var disp="Logix5561.";
var count = 10;
var uidInserted=null;
var updateFlag=false;
// Initialize data --------------------------------------------------------------------------------------------------------------------------
var objData = {
  bc: "",
  dataStart: null,
  dateEnd: null,
  good: 0,
  bad:{
    movedLabel: 0,
    noCode: 0,
    noLabel: 0,
    wrongPrinterCode: 0,
    total: 0,
    otro: 0
  },
  line: "line"
};
var objAnterior;
var heartBit;
// End Initialize data ----------------------------------------------------------------------------------------------------------------------
// Initialize firestore ---------------------------------------------------------------------------------------------------------------------
 var admin = require('firebase-admin');
 var serviceAccount = require("./credentials/industrial-scriba-194603-firebase-adminsdk-ymoka-c98e181110.json");
 admin.initializeApp({
   credential: admin.credential.cert(serviceAccount)
 });
 var db = admin.firestore();
// End initialize firestore -----------------------------------------------------------------------------------------------------------------

start();

function start() {
  setTimeout(connect, 1000);
  //connect();
}
//setTimeout(connect, 3000);
async function connect() {

  timer.setInterval(countDown, '', '1s');
  console.log("Connecting");
  client.connect(endpointUrl, function(err) {
    if (err) {
      //console.log(" cannot connect to endpoint :" , endpointUrl );
      //fs.writeFile("./Sortererrorkep.log", " ERROR KEPSERVER", function(err){if (err){}});
      //  callback(err)
    } else {
      console.log("connected");
      session();
    }
  });
}
/////////////////////////////////////////////////////////////////////////////////////////////////

function countDown() {
  console.log('T - ' + count);
  if (count == 0) {
    //console.log("LLegue al 3");
    timer.clearInterval();
    off();
  }
  count--;
}

function off() {
  client.disconnect(function() {});
  console.log(" cannot connect to endpoint :", endpointUrl);
  count = 3;
  setTimeout(start, 3000);
}



////////////////////////////////////////////////////////////////////////////////////////////////

async function session() {
  client.createSession(function(err, session) {
    if (!err) {
      the_session = session;
      //console.log(the_session);
      timer.clearInterval();
      console.log("session initiated");
      close();
    }
  });
}



function lectura (){
  return new Promise(function (fulfill,reject){
    the_session.readVariableValue("ns=2;" + canal + disp + "Global.barcode" , function(err, dataValue) {
      if (!err) {
        if(objData.bc != dataValue.value.value.toString()){
          objData.bc = dataValue.value.value.toString();
          updateFlag = true;
        }
        //console.log(dataValue.value.value);
      }
    });
    the_session.readVariableValue("ns=2;" + canal + disp + "Global.good" , function(err, dataValue) {
      if (!err) {
        if(objData.good != dataValue.value.value){
          objData.good = dataValue.value.value;
          updateFlag = true;
        }

        //console.log(dataValue.value.value);
      }
    });
    the_session.readVariableValue("ns=2;" + canal + disp + "Global.movedLabel" , function(err, dataValue) {
      if (!err) {
        if(objData.bad.movedLabel != dataValue.value.value){
          objData.bad.movedLabel = dataValue.value.value;
          updateFlag = true;
        }

        //console.log(dataValue.value.value);
      }
    });
    the_session.readVariableValue("ns=2;" + canal + disp + "Global.noCode" , function(err, dataValue) {
      if (!err) {
        if(objData.bad.noCode != dataValue.value.value){
          objData.bad.noCode = dataValue.value.value;
          updateFlag = true;
        }

        //console.log(dataValue.value.value);
      }
    });
    the_session.readVariableValue("ns=2;" + canal + disp + "Global.noLabel" , function(err, dataValue) {
      if (!err) {
        if(objData.bad.noLabel != dataValue.value.value){
          objData.bad.noLabel = dataValue.value.value;
          updateFlag = true;
        }

        //console.log(dataValue.value.value);
      }
    });
    the_session.readVariableValue("ns=2;" + canal + disp + "Global.totalBad" , function(err, dataValue) {
      if (!err) {
        if(objData.bad.total != dataValue.value.value){
          objData.bad.total = dataValue.value.value;
          updateFlag = true;
        }

        //console.log(dataValue.value.value);
      }
    });
    the_session.readVariableValue("ns=2;" + canal + disp + "Global.wrongPrinterCode" , function(err, dataValue) {
      if (!err) {
        if(objData.bad.wrongPrinterCode != dataValue.value.value){
          objData.bad.wrongPrinterCode = dataValue.value.value;
          updateFlag = true;
        }

        //console.log(dataValue.value.value);
      }
    });
    the_session.readVariableValue("ns=2;" + canal + disp + "Global.Otro" , function(err, dataValue) {
      if (!err) {
        if(objData.bad.otro != dataValue.value.value){
          objData.bad.otro = dataValue.value.value;
          updateFlag = true;
        }

        //console.log(dataValue.value.value);
      }
    });
    the_session.readVariableValue("ns=2;" + canal + disp + "Global.line.DATA" , function(err, dataValue) {
      if (!err) {
        if(objData.line != dataValue.value.value){
          objData.line = dataValue.value.value;
          updateFlag = true;
        }

        //console.log(dataValue.value.value);
      }
    });
    the_session.readVariableValue("ns=2;" + canal + disp + "Global.fecha_Inicio.DATA" , function(err, dataValue) {
      if (!err) {
        if(dataValue.value.value!=''){
          if(objData.dataStart != new Date(dataValue.value.value)){
            objData.dataStart = new Date(dataValue.value.value);
            updateFlag = true;
          }
        }
        //console.log(dataValue.value.value);
      }
    });
    the_session.readVariableValue("ns=2;" + canal + disp + "Global.fecha_fin.DATA" , function(err, dataValue) {
      if (!err) {
        if(dataValue.value.value!=''){
          objData.dateEnd = new Date(dataValue.value.value);
          updateFlag = true;
        }

      }
    });
    the_session.readVariableValue("ns=2;" + canal + disp + "Global.heartBit" , function(err, dataValue) {
      if (!err) {
        heartBit = dataValue.value.value;
        //console.log(dataValue.value.value);
      }
    });
    //console.log(objData);

  });

  }


  async function close() {
    console.log("reading");
      setInterval(function(){
         lectura();
         insertarDataLine(objData);
      },10000);

  }

  async function err() {
    if (err) {
      console.log(" failure ", err);
    } else {
      console.log("done");
    }
  }


  var insertarDataLine = function(objData){
    if(uidInserted===null && objData.dataStart!==null){
      var addDoc = db.collection('vision').add(objData).then(function(ref){
           console.log('Added document with ID: ', ref.id);
           uidInserted = ref.id;
       });
    }else{
      if(updateFlag){
        var setAda = db.collection('vision').doc(uidInserted).set(objData);
      }
      if(objData.dateEnd!==null){
        uidInserted=null;
      }
      updateFlag = false;
    }
  };
