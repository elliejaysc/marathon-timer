let fd, data, gifted = 0; //timer = 0;

const d = document;
const container = d.querySelector(".main-container");
const spacer = d.querySelector(".spacer");
let count = 0, timerObj = {}, counter = 0, width = 0;


function pad2(n) {
    return n < 10 ? '0' + n : n;
}

function show() {
    var s = count % 60;
    var m = Math.floor(count / 60) % 60;
  	var h = Math.floor((count / 60) / 60);
	showhrs.innerHTML = h;
  	showmns.innerHTML = pad2(m);
    showscs.innerHTML = pad2(s);
}

function timer() {
    counter++;
  	show();
    if (count-- > 0) {
        setTimeout(timer, 1000);
    }
  
  	if(counter % 10 == 0) {
   		timerObj.value = count;
      	SE_API.store.set(fd.storeName, timerObj);
      	counter = 0;
    }
}

function getMultiplyer(type) {
	let mult = 1; 

  	if(type == "m")
		mult = 60;
    if(type == "h")
        mult = 3600;
  
 	return mult;
}

function getCrateAmount(str) {
	const regex1 = /[^x\d]*/;
  const regex2 = /[^x\d]*$/;
	const subst = ``;
	str = str.split(' ').slice(1).join(' ');
	const result1 = str.replace(regex1, subst);
  const amount = result1.replace(regex2, subst).substring(1);
  
  return amount;
}

function getSaAmount(str) {
  let amount = 0;
	str = str.split(' ').slice(1);
  	if(str.indexOf("bits") > -1)
      amount = str[str.indexOf("bits")-1];
  
  	return amount;
}


window.addEventListener('onEventReceived', function (obj) {
  
    if (!obj.detail.event) {
      return;
    }
  	
  	const listener = obj.detail.listener.split("-")[0];
    const event = obj.detail.event;
  
	if (listener === 'subscriber' && fd.timePerSub > 0) {
      
      let mult = getMultiplyer(fd.typePerSub);
      
      if(event.bulkGifted !== true && event.gifted !== true)
      {
        count += (fd.timePerSub * mult);
      }
      
      if(event.bulkGifted == true || event.gifted == true) {
        if(event.amount > 1 && gifted == 0) {
			gifted = event.amount;
          	count += (event.amount * fd.timePerSub * mult);
        }
        else {
        	if(gifted == 0) {
           		count += (fd.timePerSub * mult);
            }
          	else
				gifted--;
        }
      }
    } else if (listener === 'cheer' && fd.timePerCheer > 0) {
      	let time = fd.timePerCheer;
      	let mult = getMultiplyer(fd.typePerCheer);
      	let amount = fd.cheerAmount;
        let cheerMult = Math.floor(event.amount/amount);
      	count += (time * cheerMult * mult);
      
    } else if (listener === 'tip' && fd.timePerTip > 0) {
      	let time = fd.timePerTip;
      	let mult = getMultiplyer(fd.typePerTip);
      	let amount = fd.tipAmount;
        let tipMult = Math.floor(event.amount/amount);
      	count += (time * tipMult * mult);
      
    } else if (listener === 'merch') {
      
		  console.log("Merch Purchase");
      
    } else if (listener === 'message') {

      if(event.data.tags.badges.includes("broadcaster")) {
        if(event.data.text.startsWith(fd.addTimeCmd)) {
			      let msg = event.data.text.replace(fd.addTimeCmd, "");
          	let times = msg.split(" ");
          	let timeToAdd = 0;
          	if(times.length > 0){
            	times.forEach(time => {
                	if(time.includes("s"))
                      timeToAdd += parseInt(time.replace("s",""));
					
                  	if(time.includes("m")) {
                      let mult = getMultiplyer("m");
                      timeToAdd += parseInt(time.replace("m",""))*mult;
                    }
                  
                  	if(time.includes("h")){
                      let mult = getMultiplyer("h"); 
                      timeToAdd += parseInt(time.replace("h",""))*mult;
                    }
                }); 
            }
          	count += timeToAdd;
        }
      }
      
      if(event.data.nick.toLowerCase() === "dixperbro" && fd.timePerDpCrate > 0) {
      	let msg = event.data.text;
        if(msg.includes("crate")){
          const crates = getCrateAmount(msg);
          let time = fd.timePerDpCrate;
          let mult = getMultiplyer(fd.typePerDpCrate);
      	  let amount = fd.dpCrateAmount;
       	  let cratesMult = Math.floor(crates/amount);
          console.log(`cratesMult = ${cratesMult} -- mult = ${mult}`);
      	  count += (time * cratesMult * mult);
          
        }
      }

      if(event.data.nick.toLowerCase() === "soundalerts" && fd.useSoundAlerts == "yes") {
      	let msg = event.data.text;
        if(msg.includes("bits")){
          const SaAmount = getSaAmount(msg);
          let time = fd.timePerCheer;
          let mult = getMultiplyer(fd.typePerCheer);
          let amount = fd.cheerAmount;
          let cheerMult = Math.floor(SaAmount/amount);
          count += (time * cheerMult * mult);
          
        }
      }
    }
});

window.addEventListener('onWidgetLoad', function (obj) {
  
  	data = obj.detail.session.data;
  	fd = obj.detail.fieldData;
  	const startTimer = fd.startTimer,
          h = fd.timerHours,
          m = fd.timerMins, 
          s = fd.timerSecs;
  	
    var current = count;
  
  	if(fd.storeName != ""){
		SE_API.store.get(fd.storeName).then(obj => {

          if(obj === null) {
			count += (h * 60 * 60) + (m * 60) + s;
            timerObj.value = count;
            SE_API.store.set(fd.storeName, timerObj);	
          }
          else {
            count = obj.value;
          }
          
          if(startTimer == "yes") {
            // only restart the counter loop if it was previously stopped
            if (current <= 0) {
              timer();
            } else {
              show();
            } 
          }
          else {
            timerObj.value = (h * 60 * 60) + (m * 60) + s;
          	SE_API.store.set(fd.storeName, timerObj);
          }
      });
    }
});
