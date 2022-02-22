var data = new FormData();
var fname = document.getElementById('fname');
var lname = document.getElementById('lname');
var submit = document.getElementById('submit');


submit.addEventListener('click', (event) => {
    data.append('firstname', fname);
    console.log(data);
    console.log(event)
})
