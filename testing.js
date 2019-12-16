var people = {ani: 100, abhi: '2k'};
var x='se';
if(x in people){
	console.log(true);
	people[x] = 200;
}
else{
	console.log(false);
	people[x] = 'new';
}

arr = Object.keys(people);

console.log(people);
console.log(arr);