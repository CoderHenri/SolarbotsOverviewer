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

  AddLinksToFields();
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

  var L = document.getElementById("lds-hourglass");
  L.style.display = "none";

  var D = document.getElementById("ButtonSwitchBox");
  D.style.display = "grid";

  ShowMissingBots();
  AddAmounts();
  UIWriter();

}

var ArrayOfMissingBots = [];

function ShowMissingBots() {
  var AmountOfBotsMissing = 0;
  var AmountOfBotsMissingAreVoids = 0;
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
  document.getElementById("MissingBotsMessage").innerHTML = "You're missing "+AmountOfBotsMissing+" Solarbots, of which "+AmountOfBotsMissingAreVoids+" are Void Solarbots";
  document.getElementById("MissingBotsMessage").style.display = "block";
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
    document.getElementById("Field"+IdName).innerHTML = SAmountArray[i].Amount;
  }
}

function HideRarity(Rarity) {

  document.getElementById(Rarity+"BoxLacrean").style.display = "none";
  document.getElementById(Rarity+"BoxIllskagaard").style.display = "none";
  document.getElementById(Rarity+"BoxArboria").style.display = "none";
  document.getElementById(Rarity+"BoxNeutral").style.display = "none";

  document.getElementById(Rarity+"ToggleHeader").innerHTML = "Show "+Rarity;

  document.getElementById(Rarity+"Toggle").setAttribute( "onclick", "ShowRarity('"+Rarity+"')" );
}

function ShowRarity(Rarity) {

  document.getElementById(Rarity+"BoxLacrean").style.display = "grid";
  document.getElementById(Rarity+"BoxIllskagaard").style.display = "grid";
  document.getElementById(Rarity+"BoxArboria").style.display = "grid";
  document.getElementById(Rarity+"BoxNeutral").style.display = "grid";

  document.getElementById(Rarity+"ToggleHeader").innerHTML = "Hide "+Rarity;

  document.getElementById(Rarity+"Toggle").setAttribute( "onclick", "HideRarity('"+Rarity+"')" );
}

function DownloadYourBots() {
  download(SAmountArray, "Owned_Bots_from_"+document.getElementById("ETHAddress").innerHTML);
}

function DownloadMissingBots() {
  download(ArrayOfMissingBots, "Missing_Bots_from_"+document.getElementById("ETHAddress").innerHTML);
}

function download(Array, ETHAddressforDL) {
  console.log("SaveAs Blob happening");
    var save = JSON.stringify(Array);
    var blob = new Blob([save], {
      type: "text/plain;charset=utf-8"
    });
    saveAs(blob, ETHAddressforDL+".txt");
}

function ShowPictures() {
  document.getElementById("ShowPicHeader").innerHTML = "Show X X X";
  document.getElementById("ShowPicToggle").setAttribute( "onclick", "ShowXXX()" );

  var AdaptRowsBigger = document.getElementsByClassName("YourBotsBox");
  for(i=0; i<AdaptRowsBigger.length; i++) {
    AdaptRowsBigger[i].style.gridTemplateRows = "110px 110px 110px 110px";
  }

  var AdaptRowsBiggerNeutral = document.getElementsByClassName("YourBotsBoxNeutral");
  for(i=0; i<AdaptRowsBiggerNeutral.length; i++) {
    AdaptRowsBiggerNeutral[i].style.gridTemplateRows = "110px 110px 110px 110px";
  }

  /* working picture inputer
  var el = document.getElementById("FieldVLTM");
  el.innerHTML="<img src=\"./mk1_gifs/mk1_gifs/lacrean/tank/large/male_void.gif\" width=\"105px\" height=\"105px\">";
  */

  let UIIDField = "";
  let Rarity = "";
  let Faction = "";
  let Class = "";
  let Type = "";
  let IMGLink = "";
  let Gender = "";
  let OBChecker = 0;

  for(j=0; j<160; j++) {
    Rarity = AllCombinationsArray[j].Rarity.charAt(0);
    Faction = AllCombinationsArray[j].Faction.charAt(0);
    Class = AllCombinationsArray[j].Class.charAt(0);
    Type = AllCombinationsArray[j].Type.charAt(0);

    UIIDField = "Field"+ Rarity + Faction + Class + Type;

    if(Class == "T" || Class == "S") {
      Class = AllCombinationsArray[j].Class.toLowerCase();
    } else if(Class == "R") {
      Class = "ranged";
    } else if(Class == "M") {
      Class = "melee";
    }

    if(Type == "N") {
      Type = "baby";
      Gender = "neutral_";
    } else if(Type == "F") {
      Type = "large";
      Gender = "fem_";
    } else if(Type == "M") {
      Type = "large";
      Gender = "male_";
    }

    IMGLink = "<img id='IDIMG' src=\"./mk1_gifs/mk1_gifs/"+AllCombinationsArray[j].Faction.toLowerCase()+"/"+Class+"/"+Type+"/"+Gender+AllCombinationsArray[j].Rarity.toLowerCase()+".gif\" width=\"105px\" height=\"105px\">";
      
  if(OBChecker<ArrayOfMissingBots.length) {
    if(AllCombinationsArray[j].Rarity == ArrayOfMissingBots[OBChecker].Rarity && AllCombinationsArray[j].Faction == ArrayOfMissingBots[OBChecker].Faction && AllCombinationsArray[j].Class == ArrayOfMissingBots[OBChecker].Class && AllCombinationsArray[j].Type == ArrayOfMissingBots[OBChecker].Type) {
        if(ArrayOfMissingBots[OBChecker].Type == "Neutral Baby") {
          IMGLink = IMGLink + "<p id='PMissingNeutral'>" + "Missing" + "</p></div>";
        } else {
          IMGLink = IMGLink + "<p id='PMissing'>" + "Missing" + "</p></div>";
        }
        OBChecker++;
      }
    }

    document.getElementById(UIIDField).innerHTML=IMGLink;
  }
}

function ShowXXX() {
  document.getElementById("ShowPicHeader").innerHTML = "Show Pictures";
  document.getElementById("ShowPicToggle").setAttribute( "onclick", "ShowPictures()" );

  var AdaptRowsSmaller = document.getElementsByClassName("YourBotsBox");
  for(i=0; i<AdaptRowsSmaller.length; i++) {
    AdaptRowsSmaller[i].style.gridTemplateRows = "30px";
  }

  var AdaptRowsSmallerNeutral = document.getElementsByClassName("YourBotsBoxNeutral");
  for(i=0; i<AdaptRowsSmallerNeutral.length; i++) {
    AdaptRowsSmallerNeutral[i].style.gridTemplateRows = "30px";
  }


  let UIIDField = "";
  let Rarity = "";
  let Faction = "";
  let Class = "";
  let Type = "";

  for(j=0; j<160; j++) {
    Rarity = AllCombinationsArray[j].Rarity.charAt(0);
    Faction = AllCombinationsArray[j].Faction.charAt(0);
    Class = AllCombinationsArray[j].Class.charAt(0);
    Type = AllCombinationsArray[j].Type.charAt(0);

    UIIDField = "Field"+ Rarity + Faction + Class + Type;

    document.getElementById(UIIDField).innerHTML="X";
    
  }
  UIWriter();
}

function AddLinksToFields() {
  let UIIDField = "";
  let Rarity = "";
  let Faction = "";
  let Class = "";
  let Type = "";

  for(j=0; j<160; j++) {
    Rarity = AllCombinationsArray[j].Rarity.charAt(0);
    Faction = AllCombinationsArray[j].Faction.charAt(0);
    Class = AllCombinationsArray[j].Class.charAt(0);
    Type = AllCombinationsArray[j].Type.charAt(0);

    UIIDField = "Field"+ Rarity + Faction + Class + Type;

    Rarity = AllCombinationsArray[j].Rarity

    Faction = AllCombinationsArray[j].Faction
    if(Faction == "Lacrean") {
      Faction = "Lacrean%20Empire";
    }

    Class = AllCombinationsArray[j].Class
    if(Class == "Melee DPS") {
      Class = "Melee%20dps";
    } else if(Class == "Ranged DPS") {
      Class = "Ranged%20dps";
    }

    Type = AllCombinationsArray[j].Type
    if(Type == "Neutral Baby") {
      Type = "Neutral";
    } else if(Type == "Male Large") {
      Type = "Male";
    } else if(Type == "Fem Large") {
      Type = "Female";
    }

    document.getElementById(UIIDField).setAttribute( "onclick", "window.open('https://opensea.io/assets/solarbots-io?search[resultModel]=ASSETS&search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Rarity&search[stringTraits][0][values][0]="+Rarity+"&search[stringTraits][1][name]=Type&search[stringTraits][1][values][0]="+Type+"&search[stringTraits][2][name]=Faction&search[stringTraits][2][values][0]="+Faction+"&search[stringTraits][3][name]=Class&search[stringTraits][3][values][0]="+Class+"','_blank')" );
    document.getElementById(UIIDField).style.cursor = "pointer";
  }
  console.log("link ging");
}
