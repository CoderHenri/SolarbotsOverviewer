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
  }
  
}

function GetAccountData(ETHAddy) {
  console.log("geht");
}