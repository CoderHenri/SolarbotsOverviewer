var AllBotsTemplate = [{rarity : "common"}, {rarity : "rare"}, {rarity : "epic"}, {rarity : "void"}, 
                        {faction : "neutral"}, {faction : "lacrean"}, {faction : "illskagaard"}, {faction : "arboria"},
                        {type : "neutral baby"}, {type : "neutral baby"}, {type : "fem large"}, {type : "male large"},
                        {botclass : "tank"}, {botclass : "melee dps"}, {botclass : "ranged dps"}, {botclass : "support"}];

function AsyncTextReader(Place) {
    return new Promise(function (resolve, reject) {
        var objXMLhttp = new XMLHttpRequest()
        objXMLhttp.open("GET", Place, true);
        objXMLhttp.send();
        objXMLhttp.onreadystatechange = function(){
        if (objXMLhttp.readyState == 4){
          if(objXMLhttp.status == 200) {
            var TestParse = objXMLhttp.responseText;
            TestParse = JSON.parse(TestParse);
            return resolve(TestParse);
          } else {
            console.log("error");
            return resolve("error");
          }
        }
      }
    });
}

var GeneArray = [];

async function DecodeGenes() {
  GeneArray = await AsyncTextReader('./SolarbotsList.txt');
  console.log(GeneArray);
  console.log(AllBotsTemplate);
}

function SelectAddress() {

  document.getElementById("ETHAddress").innerHTML = txt;
  var L = document.getElementById("lds-hourglass");

  var txt;
  var PopUp = prompt("Please enter your ETH (0x...) Address with your Solarbots", "0x...");
  if (PopUp == null || PopUp == "") {
    txt = "User cancelled the prompt!";
    document.getElementById("ETHAddress").innerHTML = txt;
  } else if (PopUp.startsWith("0x") && PopUp.length == 42) {
    txt = PopUp;
    document.getElementById("ETHAddress").innerHTML = txt;
    GetAccountData(txt);

    L.style.display = "inline-block";
  } else {
    txt = "Please enter a real ETH Address";
    document.getElementById("ETHAddress").innerHTML = txt;
  }
}

async function GetAccountData(ETHAddy) {
  console.log("geht");
  var AmountOfBots = 0;

  await fetch("https://node1.web3api.com/", {
    "credentials": "omit",
    "headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0",
        "Accept": "*/*",
        "Accept-Language": "de,en-US;q=0.7,en;q=0.3",
        "Content-Type": "application/json",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site"
    },
    "referrer": "https://etherscan.io/",
    "body": "{\"jsonrpc\":\"2.0\",\"id\":3,\"method\":\"eth_call\",\"params\":[{\"from\":\""+ETHAddy+"\",\"data\":\"0x70a08231000000000000000000000000606fd755081d7ea7c1e2d6faafe6d9cdb1ea142c\",\"to\":\"0x8009250878ed378050ef5d2a48c70e24eb2ede7e\"},\"latest\"]}",
    "method": "POST",
    "mode": "cors"
  })

  .then(function(response) { 
    return response.json(); 
  })
            
  .then(function(data) {
    AmountOfBots = data.result;
    AmountOfBots = AmountOfBots.substring(2);
    AmountOfBots = AmountOfBots.replace(/^0+/, '');
    AmountOfBots = parseInt(AmountOfBots, 16);
    console.log(AmountOfBots);
  });

  for(i=0; i<AmountOfBots; i++) {
    FetchBots(i+1, i, AmountOfBots);
  }

}

var BotsInAccountArray = [];

async function FetchBots(id, bodydata, AmountOfBots) {

  let BotID = null;

  bodydata = bodydata.toString(16);

  let CorrectAmountOfZeros = "0".repeat(7-bodydata.length);   //gives bodydata data fetch query stuff the correct amount of zeros, since the hex number has different lengths depending on what you enter

  bodydata = "0x2f745c59000000000000000000000000606fd755081d7ea7c1e2d6faafe6d9cdb1ea142c000000000000000000000000000000000000000000000000000000000" + CorrectAmountOfZeros + bodydata;

  await fetch("https://node1.web3api.com/", {
    "credentials": "omit",
    "headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0",
        "Accept": "*/*",
        "Accept-Language": "de,en-US;q=0.7,en;q=0.3",
        "Content-Type": "application/json",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site"
    },
    "referrer": "https://etherscan.io/",
    "body": "{\"jsonrpc\":\"2.0\",\"id\":"+id+",\"method\":\"eth_call\",\"params\":[{\"from\":\"0x0000000000000000000000000000000000000000\",\"data\":\""+bodydata+"\",\"to\":\"0x8009250878ed378050ef5d2a48c70e24eb2ede7e\"},\"latest\"]}",
    "method": "POST",
    "mode": "cors"
  })
  .then(function(response) { 
    return response.json(); 
  })
            
  .then(function(data) {
    BotID = data.result;
    BotID = BotID.substring(2);
    BotID = BotID.replace(/^0+/, '');
    BotID = parseInt(BotID, 16);
    BotsInAccountArray.push(BotID);
  })
  
  .catch((err) => console.error('[request failed]', err.message));

  if(AmountOfBots == id) {
    console.log("before sleep");
    await sleep(2000);
    console.log(BotsInAccountArray);
  }

}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}