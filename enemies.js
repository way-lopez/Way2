
function enemyForLevel(level){

if(level==10) return {name:"Mini Boss",type:"tank"}
if(level==20) return {name:"Mini Boss 2",type:"mage"}
if(level==30) return {name:"Boss Final",type:"vamp"}

if(level<=10) return {name:"Slime",type:"basic"}
if(level<=20) return {name:"Mage",type:"mage"}
return {name:"Vamp",type:"vamp"}

}
