function getEnemy(level){
if(level<=10) return {name:"Slime",atk:3}
if(level<=20) return {name:"Mage",atk:4}
return {name:"Vamp",atk:5}
}
