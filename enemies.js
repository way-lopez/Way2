
function enemyForLevel(level){

if(level==10){
return {name:"Mini Boss",type:"tank",atk:3}
}

if(level==20){
return {name:"Mini Boss Mage",type:"mage",atk:5}
}

if(level==30){
return {name:"Boss Final",type:"vamp",atk:6}
}

if(level<=10){
return {name:"Slime",type:"basic",atk:3}
}

if(level<=20){
return {name:"Mage",type:"mage",atk:4}
}

return {name:"Vamp",type:"vamp",atk:5}

}
