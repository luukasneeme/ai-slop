(() => {
  const scoreEl=document.querySelector("#score"), countEl=document.querySelector("#count"), pointsEl=document.querySelector("#points");
  const fill=document.querySelector("#fill"), progress=document.querySelector("#progress"), log=document.querySelector("#log");
  const egg=document.querySelector("#egg"), note=document.querySelector("#note"), hack=document.querySelector("#hack");
  const sound=document.querySelector("#sound"), unlockAt=1337;
  const lines=["paketi suunamine: krüpteeritud...","port 443 kontrollitud","võtmefragment leitud","puhverserver vastab: 200 OK","andmepakett vastu võetud","tulemüüri kiht nõrgeneb...","marsruut läbi sõlme 07"];
  let clicks=0, points=0, power=1, auto=0, soundOn=false, audio;
  try { const saved=JSON.parse(localStorage.getItem("nullpunkt-save")||"{}"); clicks=Math.max(0,Number(saved.clicks)||0); points=Math.max(0,Number(saved.points)||0); power=Math.max(1,Number(saved.power)||1); auto=Math.max(0,Number(saved.auto)||0); } catch {}
  const powerCost=()=>25*power, autoCost=()=>60*(auto+1);
  function save(){try{localStorage.setItem("nullpunkt-save",JSON.stringify({clicks,points,power,auto}));}catch{}}
  function update(){
    scoreEl.textContent=points.toLocaleString("et-EE").padStart(6,"0"); countEl.textContent=clicks.toLocaleString("et-EE"); pointsEl.textContent=points.toLocaleString("et-EE");
    fill.style.width=Math.min(clicks/unlockAt*100,100)+"%"; progress.textContent=Math.min(clicks,unlockAt).toLocaleString("et-EE")+" / "+unlockAt;
    document.querySelector("#power").textContent="+"+power; document.querySelector("#powerCost").textContent=powerCost(); document.querySelector("#autoCost").textContent=autoCost();
  }
  function addLog(message,ok=false){
    const now=new Date(), stamp=[now.getHours(),now.getMinutes(),now.getSeconds()].map(n=>String(n).padStart(2,"0")).join(":");
    const p=document.createElement("p");p.textContent="["+stamp+"] "+message;if(ok)p.className="green";
    log.append(p);while(log.children.length>5)log.firstElementChild.remove();
  }
  function beep(){
    if(!soundOn)return;try{audio ||= new(window.AudioContext||window.webkitAudioContext)();if(audio.state==="suspended")audio.resume();
      const osc=audio.createOscillator(),gain=audio.createGain();osc.frequency.value=460+(clicks%9)*32;
      gain.gain.setValueAtTime(.045,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.07);
      osc.connect(gain).connect(audio.destination);osc.start();osc.stop(audio.currentTime+.07);
    }catch{}
  }
  function revealEgg(){
    if(clicks<unlockAt)return;egg.hidden=false;
    note.textContent="◈ Salajane fail avatud. Hästi tehtud.";note.style.cursor="pointer";note.onclick=()=>{egg.hidden=false;};
  }
  function click(){
    clicks++;points+=power;update();save();
    if(clicks===1||clicks%7===0)addLog(lines[Math.floor(Math.random()*lines.length)],clicks%14===0);
    if(clicks===unlockAt){addLog("salajane toimik avatud",true);revealEgg();egg.scrollIntoView({behavior:"smooth",block:"nearest"});}
    beep();
  }
  hack.addEventListener("click",click);
  document.addEventListener("keydown",event=>{if(event.code==="Space"&&!event.repeat&&!event.target.closest("button")){event.preventDefault();click();}});
  sound.addEventListener("click",()=>{soundOn=!soundOn;sound.setAttribute("aria-pressed",String(soundOn));sound.querySelector("span").textContent="HELI: "+(soundOn?"SEES":"VÄLJAS");addLog(soundOn?"helisignaalid lubatud":"helisignaalid vaigistatud");});
  document.querySelector("#close").addEventListener("click",()=>{egg.hidden=true;});
  document.querySelector("#buyPower").addEventListener("click",()=>{
    const cost=powerCost(),status=document.querySelector("#shopStatus");
    if(points<cost){status.textContent="Punkte napib — vaja on "+cost+".";return;}
    points-=cost;power++;status.textContent="Klõpsujõud kasvas! Nüüd saad iga klõpsuga +"+power+".";update();save();
  });
  document.querySelector("#buyAuto").addEventListener("click",()=>{
    const cost=autoCost(),status=document.querySelector("#shopStatus");
    if(points<cost){status.textContent="Punkte napib — vaja on "+cost+".";return;}
    points-=cost;auto++;status.textContent="Automaatklõpsur lisab nüüd "+auto+" punkti sekundis.";update();save();
  });
  window.setInterval(()=>{if(auto){points+=auto;update();save();}},1000);

  const reactionButton=document.querySelector("#reactionButton"),reactionDisplay=document.querySelector("#reactionDisplay"),reactionResult=document.querySelector("#reactionResult");
  let reactionState="idle",reactionTimer;
  reactionButton.addEventListener("click",()=>{
    if(reactionState==="idle"){
      reactionState="waiting";reactionButton.textContent="OOTA ROHELIST...";reactionDisplay.textContent="VALMIS...";reactionDisplay.className="reaction-display waiting";
      reactionTimer=window.setTimeout(()=>{reactionState="go";reactionDisplay.textContent="NÜÜD!";reactionDisplay.className="reaction-display go";reactionButton.textContent="VAJUTA!";reactionStart=performance.now();},1200+Math.random()*2600);
    }else if(reactionState==="waiting"){
      clearTimeout(reactionTimer);reactionState="idle";reactionDisplay.textContent="LIIGA VARA!";reactionDisplay.className="reaction-display";reactionButton.textContent="PROOVI UUESTI";reactionResult.textContent="Oota rohelise märguandeni."; 
    }else if(reactionState==="go"){
      const elapsed=Math.round(performance.now()-reactionStart);reactionState="idle";reactionDisplay.textContent=elapsed+" ms";reactionDisplay.className="reaction-display";
      reactionButton.textContent="VEEL ÜKS KORD";points+=20;reactionResult.textContent="Tubli! +20 punkti. Reaktsioon: "+elapsed+" ms.";update();save();
    }
  });
  let reactionStart=0;

  const memoryBoard=document.querySelector("#memoryBoard"),memoryButtons=[...memoryBoard.querySelectorAll("button")];
  const memoryStart=document.querySelector("#memoryStart"),memoryResult=document.querySelector("#memoryResult");
  let sequence=[],inputIndex=0,memoryMode="idle";
  function light(index){memoryButtons[index].classList.add("lit");window.setTimeout(()=>memoryButtons[index].classList.remove("lit"),360);}
  memoryStart.addEventListener("click",()=>{
    if(memoryMode==="show")return;sequence=Array.from({length:4},()=>Math.floor(Math.random()*4));inputIndex=0;memoryMode="show";
    memoryResult.textContent="Vaata järjestust...";memoryStart.disabled=true;
    sequence.forEach((color,i)=>window.setTimeout(()=>light(color),500+i*650));
    window.setTimeout(()=>{memoryMode="input";memoryStart.disabled=false;memoryStart.textContent="KORDA JADA";memoryResult.textContent="Sinu kord!";},500+sequence.length*650);
  });
  memoryButtons.forEach(button=>button.addEventListener("click",()=>{
    if(memoryMode!=="input")return;const guess=Number(button.dataset.color);light(guess);
    if(guess!==sequence[inputIndex]){memoryMode="idle";memoryResult.textContent="Jada läks sassi. Proovi uuesti!";memoryStart.textContent="ALUSTA UUESTI";return;}
    inputIndex++;
    if(inputIndex===sequence.length){memoryMode="idle";points+=30;memoryResult.textContent="Täiuslik mälu! +30 punkti.";memoryStart.textContent="MÄNGI UUESTI";update();save();}
  }));
  update();if(clicks>=unlockAt)revealEgg();
})();
