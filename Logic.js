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
var AllCombinationsArray = [];

async function DecodeGenes() {
  GeneArray = await AsyncTextReader('./SolarbotsList.txt');
  AllCombinationsArray = await AsyncTextReader('./AllPossibleSolarbotsCombinations.txt');
  console.log(GeneArray);
  console.log(AllCombinationsArray);
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

  var HexHelp = "0x70a08231000000000000000000000000"+ETHAddy.slice(2);

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
    "body": "{\"jsonrpc\":\"2.0\",\"id\":3,\"method\":\"eth_call\",\"params\":[{\"from\":\""+ETHAddy+"\",\"data\":\""+HexHelp+"\",\"to\":\"0x8009250878ed378050ef5d2a48c70e24eb2ede7e\"},\"latest\"]}",
    "method": "POST",
    "mode": "cors"
  })

  .then(function(response) { 
    return response.json(); 
  })
            
  .then(function(data) {
    console.log(data);
    AmountOfBots = data.result;
    AmountOfBots = AmountOfBots.substring(2);
    AmountOfBots = AmountOfBots.replace(/^0+/, '');
    AmountOfBots = parseInt(AmountOfBots, 16);
    console.log(AmountOfBots);
  });

  for(i=0; i<AmountOfBots; i++) {
    FetchBots(i+1, i, AmountOfBots, ETHAddy);
  }

}

var BotsInAccountArray = [];

async function FetchBots(id, bodydata, AmountOfBots, ETHAddy) {

  let BotID = null;

  bodydata = bodydata.toString(16);

  let CorrectAmountOfZeros = "0".repeat(7-bodydata.length);   //gives bodydata data fetch query stuff the correct amount of zeros, since the hex number has different lengths depending on what you enter

  bodydata = "0x2f745c59000000000000000000000000"+ETHAddy.slice(2)+"000000000000000000000000000000000000000000000000000000000" + CorrectAmountOfZeros + bodydata;

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
    InterpretID();
  }

}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var OwnedBotsDetailArray = [];
var SortedOwnedBots = [];

function InterpretID() {
  for(i=0; i<BotsInAccountArray.length; i++) {
    OwnedBotsDetailArray.push({Id : BotsInAccountArray[i], Rarity : GeneArray[BotsInAccountArray[i]].Rarity, Faction : GeneArray[BotsInAccountArray[i]].Faction, Class : GeneArray[BotsInAccountArray[i]].Class, Type : GeneArray[BotsInAccountArray[i]].Type});
  }
  console.log(OwnedBotsDetailArray);

  var ArrayOrderRarity = ["Void", "Epic", "Rare", "Common"];
  var ArrayOrderFaction = ["Neutral", "Lacrean", "Illskagaard", "Arboria"];
  var ArrayOrderClass = ["Tank", "Support", "Ranged DPS", "Melee DPS"];
  var ArrayOrderType = ["Male Large", "Fem Large", "Neutral Baby"];

  SortedOwnedBots = OwnedBotsDetailArray.sort(function(a, b) {
    function getOrderIndexRarity(x) { 
      return ArrayOrderRarity.indexOf(x.Rarity);
    }
    function getOrderIndexFaction(x) { 
      return ArrayOrderFaction.indexOf(x.Faction);
    }
    function getOrderIndexClass(x) { 
      return ArrayOrderClass.indexOf(x.Class);
    }
    function getOrderIndexType(x) { 
      return ArrayOrderType.indexOf(x.Type);
    }
    
    return (getOrderIndexRarity(a) - getOrderIndexRarity(b) || getOrderIndexFaction(a) - getOrderIndexFaction(b) || getOrderIndexClass(a) - getOrderIndexClass(b) || getOrderIndexType(a) - getOrderIndexType(b));
  });
  console.log(SortedOwnedBots);
  ShowMissingBots();
  AddAmounts();
  UIWriter();

}

function ShowMissingBots() {
  var AmountOfBotsMissing = 0;
  var AmountOfBotsMissingAreVoids = 0;
  var ArrayOfMissingBots = [];
  for(i=0; i<AllCombinationsArray.length; i++) {
    for(j=0; j<SortedOwnedBots.length; j++) {
      if(AllCombinationsArray[i].Rarity == SortedOwnedBots[j].Rarity && AllCombinationsArray[i].Faction == SortedOwnedBots[j].Faction && AllCombinationsArray[i].Class == SortedOwnedBots[j].Class && AllCombinationsArray[i].Type == SortedOwnedBots[j].Type) {
        break;
      } else if(j+1 == SortedOwnedBots.length) {
        AmountOfBotsMissing++;
        if(AllCombinationsArray[i].Rarity == "Void") {
          AmountOfBotsMissingAreVoids++;
        }
        ArrayOfMissingBots.push(AllCombinationsArray[i]);
      }
    }
  }
  console.log(AmountOfBotsMissing);
  console.log(AmountOfBotsMissingAreVoids);
  console.log("You're missing "+AmountOfBotsMissing+" Solarbots, of which "+AmountOfBotsMissingAreVoids+" are Void Solarbots");
  console.log(ArrayOfMissingBots);
}

var SAmountArray = [];

function AddAmounts() {
  for(i=0; i<SortedOwnedBots.length; i++) {
    if(i==0) {
      SAmountArray.push({Rarity : SortedOwnedBots[i].Rarity, Faction : SortedOwnedBots[i].Faction, Class : SortedOwnedBots[i].Class, Type : SortedOwnedBots[i].Type, Amount : 1});
    } else if(SAmountArray[SAmountArray.length-1].Rarity == SortedOwnedBots[i].Rarity && SAmountArray[SAmountArray.length-1].Faction == SortedOwnedBots[i].Faction && SAmountArray[SAmountArray.length-1].Class == SortedOwnedBots[i].Class && SAmountArray[SAmountArray.length-1].Type == SortedOwnedBots[i].Type) {
      SAmountArray[SAmountArray.length-1].Amount = SAmountArray[SAmountArray.length-1].Amount+1;
    } else {
      SAmountArray.push({Rarity : SortedOwnedBots[i].Rarity, Faction : SortedOwnedBots[i].Faction, Class : SortedOwnedBots[i].Class, Type : SortedOwnedBots[i].Type, Amount : 1});
    }
  }
  console.log(SAmountArray);
}

function UIWriter() {
  let IdName = "";
  for(i=0; i<SAmountArray.length; i++) {
    IdName = SAmountArray[i].Rarity.charAt(0) + SAmountArray[i].Faction.charAt(0) + SAmountArray[i].Class.charAt(0) + SAmountArray[i].Type.charAt(0);
    console.log(IdName);
    document.getElementById("Field"+IdName).innerHTML = SAmountArray[i].Amount;
  }
}