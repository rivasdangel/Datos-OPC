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
var endpointUrl = "opc.tcp://127.0.0.1:44818/UA/L13;"; //Endpoint especificado en la configuración de OCP del KEPserver
var the_session = null;
var count;

var canal = "s=L13.";
var disp = "Compaq.";
var count = 10;
var uidInserted=null;
var updateFlag=false;
// Initialize data --------------------------------------------------------------------------------------------------------------------------
var objData = {
  bc: '',
  dataStart: null,
  dateEnd: null,
  good: 0,
  line: "13",
  state: true,
  bad: {
    Etiqueta_Frontal: 0,
    Etiqueta_Trasera: 0,
    Inspeccion_Codigo_Barras: 0,
    Lotificado: 0,
    total: 0
  }
};
var objAnterior = {};

var heartBit;
var Capfeederestado = 0,
  initialTimeCapfeeder = Date.now(),
  Capfeedertime = 0,
  CapfeederflagPrint = 0,
  Capfeedermaster;
var barcode_cb = null,
  barcode_csv2 = "",
  countIn = 0,
  countOut = 0,
  EtiquetaFrontal_NG = 0,
  EtiquetaFrontal_OK = 0,
  EtiquetaTrasera_NG = 0,
  EtiquetaTrasera_OK = 0,
  InspeccionCodigoBarras_NG = 0,
  InspeccionCodigoBarras_OK = 0,
  Lotificado_NG = 0,
  Lotificado_OK = 0,
  Total_NG = 0,
  Total_OK = 0,
  Line = "",
  ttBarcode = null,
  ttOut = null,
  uuid = '';
var countSeg = 0;
var dataRef = null;
var firebaseJson = {};
var flagPrim = false;
var barcodeAnt = "";
// End Initialize data ----------------------------------------------------------------------------------------------------------------------
// Initialize firestore ---------------------------------------------------------------------------------------------------------------------
 var admin = require('firebase-admin');
 var serviceAccount = require('./credential/industrial-scriba-key.json');
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
    the_session.readVariableValue("ns=2;" + canal + disp + ruta + "Barcode." + "BARCODE_CB", function(err, dataValue) {
      if (!err) {
        barcode_cb = dataValue.value.value;
      }
    });
    the_session.readVariableValue("ns=2;" + canal + disp + ruta + "Barcode." + "BARCODE_CSV2", function(err, dataValue) {
      if (!err) {
        barcode_csv2 = dataValue.value.value;
      }
    });
    the_session.readVariableValue("ns=2;" + canal + disp + ruta + "Barcode." + "Barcode_timestamp", function(err, dataValue) {
      if (!err) {
        ttBarcode = dataValue.value.value;
      }
    });
    /*the_session.readVariableValue("ns=2;" + canal + disp + ruta + "CountsInOut." + "IN_COUNTER", function(err, dataValue) {
      if (!err) {
        countIn = dataValue.value.value;
      }
    });*/
    /*the_session.readVariableValue("ns=2;" + canal + disp + ruta + "CountsInOut." + "OUT_COUNTER", function(err, dataValue) {
      if (!err) {
        countOut = dataValue.value.value;
      }
    });*/
    the_session.readVariableValue("ns=2;" + canal + disp + ruta + "CountsInOut." + "Lastout_timestamp", function(err, dataValue) {
      if (!err) {
        ttOut = dataValue.value.value;
      }
    });
    the_session.readVariableValue("ns=2;" + canal + disp + ruta + "EtiquetaFrontal." + "Temporary_COUNT_NG", function(err, dataValue) {
      if (!err) {
        EtiquetaFrontal_NG = dataValue.value.value;
      }
    });
    /*the_session.readVariableValue("ns=2;" + canal + disp + ruta + "EtiquetaFrontal." + "COUNT_OK", function(err, dataValue) {
      if (!err) {
        EtiquetaFrontal_OK = dataValue.value.value;
      }
    });*/
    the_session.readVariableValue("ns=2;" + canal + disp + ruta + "EtiquetaTrasera." + "Temporary_COUNT_NG", function(err, dataValue) {
      if (!err) {
        EtiquetaTrasera_NG = dataValue.value.value;
      }
    });
    /*the_session.readVariableValue("ns=2;" + canal + disp + ruta + "EtiquetaTrasera." + "COUNT_OK", function(err, dataValue) {
      if (!err) {
        EtiquetaTrasera_OK = dataValue.value.value;
      }
    });*/
    the_session.readVariableValue("ns=2;" + canal + disp + ruta + "InspeccionCodigoBarras." + "Temporary_COUNT_NG", function(err, dataValue) {
      if (!err) {
        InspeccionCodigoBarras_NG = dataValue.value.value;
      }
    });
    /*the_session.readVariableValue("ns=2;" + canal + disp + ruta + "InspeccionCodigoBarras." + "COUNT_OK", function(err, dataValue) {
      if (!err) {
        InspeccionCodigoBarras_OK = dataValue.value.value;
      }
    });*/
    the_session.readVariableValue("ns=2;" + canal + disp + ruta + "Lotificado." + "Temporary_COUNT_NG", function(err, dataValue) {
      if (!err) {
        Lotificado_NG = dataValue.value.value;
      }
    });
    /*the_session.readVariableValue("ns=2;" + canal + disp + ruta + "Lotificado." + "COUNT_OK", function(err, dataValue) {
      if (!err) {
        Lotificado_OK = dataValue.value.value;
      }
    });*/
    the_session.readVariableValue("ns=2;" + canal + disp + ruta + "Total." + "Temporary_COUNT_NG", function(err, dataValue) {
      if (!err) {
        Total_NG = dataValue.value.value;
      }
    });
    the_session.readVariableValue("ns=2;" + canal + disp + ruta + "Total." + "Temporary_COUNT_OK", function(err, dataValue) {
      if (!err) {
        Total_OK = dataValue.value.value;
      }
    });
    /*the_session.readVariableValue("ns=2;" + canal + disp + ruta + "VisionSystem." + "NAME", function(err, dataValue) {
      if (!err) {
        Line = dataValue.value.value;
      }
    });*/
    firebaseJson = {
      bc: barcode_cb,
      dataStart: ttBarcode,
      dateEnd: null,
      good: Total_OK,
      line: "13",
      state: true,
      bad: {
        Etiqueta_Frontal: EtiquetaFrontal_NG,
        Etiqueta_Trasera: EtiquetaTrasera_NG,
        Inspeccion_Codigo_Barras: InspeccionCodigoBarras_NG,
        Lotificado: Lotificado_NG,
        total: Total_NG
      }
    };
  });

  }

var num=0;
  async function close() {
    console.log("reading");
      setInterval(function(){
         lectura();
         insertarDataLine(firebaseJson,num);
      },1000);

  }

  async function err() {
    if (err) {
      console.log(" failure ", err);
    } else {
      console.log("done");
    }
  }


  var insertarDataLine = function(firebaseJson, num){
    if(barcode_cb!=null && barcode_cb!="" && barcode_cb!=" "){
      if(barcode_cb!=barcodeAnt && dataRef==null && flagPrim == false){
        db.collection('vision').add(firebaseJson).then(function(ref) {
          //console.log(dataJson);
          dataRef = db.collection('vision').doc(ref.id);
          //console.log('Added document with ID: ', ref.id);
          flagPrim = true;
        });
      }
      if(num>=300){

        num = 0;
      }else{
        num++
      }

    }
  };
