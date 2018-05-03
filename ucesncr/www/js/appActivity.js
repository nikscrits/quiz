
    // load the map

    var mymap = L.map('mapid').fitWorld();

    // load the tiles

    L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw", {

      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',

      maxZoom: 18,

      id: 'mapbox.streets'
	  
	 }).addTo(mymap);
	 
	 mymap.locate({setView: true, maxZoom: 18});


//adapted from: https://www.w3schools.com/html/html5_geolocation.asp
//adapted from: https://gis.stackexchange.com/questions/182068/getting-current-user-location-automatically-every-x-seconds-to-put-on-leaflet
//Tracking location


var initialTracking = true;
var userLocation;
var autoPan = false;

// create custom markers

var markerOrange = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'orange'
});

var markerGreen = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'green'
});

var markerPurple = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'purple'
});

var markerRed = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'red'
});

var markerBlue = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'cadetblue'
});

function trackLocation() {
	if (!initialTracking){
	// zoom to center
		mymap.fitBounds(userLocation.getLatLng().toBounds(250));
		autoPan = true;
		
		
	} else {
		if (navigator.geolocation) {
			alert("Finding your position!");
			navigator.geolocation.watchPosition(showPosition);

		//error handing	
		} else {
			alert("Geolocation is not supported by this browser.");
		}
	}
}

function showPosition(position) {

	if(!initialTracking){
		mymap.removeLayer(userLocation);
	}

	userLocation = L.marker([position.coords.latitude,position.coords.longitude], {icon:markerOrange}).addTo(mymap);
						
	
	if(initialTracking){
		initialTracking = false;
		mymap.fitBounds(userLocation.getLatLng().toBounds(250));
		autoPan = true;
	}else if (autoPan) {
		mymap.panTo(userLocation.getLatLng());
		
	}
}


	// create a variable that will hold the XMLHttpRequest() - this must be done outside a function so that all the functions can use the same variable 
	
	var client2;
	
	// and a variable that will hold the layer itself – we need to do this outside the function so that we can use it to remove the layer later on
	
	var questionsLayer;

	// create the code to get the Earthquakes data using an XMLHttpRequest
	function getQuestions() {
	client2 = new XMLHttpRequest();
	client2.open('GET','http://developer.cege.ucl.ac.uk:30288/getquestions');
	client2.onreadystatechange = questionResponse; // note don't use earthquakeResponse() with brackets as that doesn't work
	client2.send();
}

	// create the code to wait for the response from the data server, and process the response once it is received
	markers = [];


	function questionResponse() {

	// this function listens out for the server to say that the data is ready - i.e. has state 4
	
	if (client2.readyState == 4) {
	// once the data is ready, process the data
	
	var questionData = client2.responseText;
	loadQuestionLayer(questionData);
}
}

	// convert the received data - which is text - to JSON format and add it to the map
	function loadQuestionLayer(questionData) {
	
	// convert the text to JSON
	// questionJSON is an array
	var questionJSON = JSON.parse(questionData);
	
	// load the geoJSON layer
	var questionsLayer = L.geoJson(questionJSON,
{
	// use point to layer to create the points
	pointToLayer: function (feature, latlng)
{
	// look at the GeoJSON file - specifically at the properties - to see the earthquake magnitude and use a different marker depending on this value
	// also include a pop-up that shows the place value of the earthquakes
	layer_marker = L.marker(latlng, {icon:markerBlue});

	//layer_marker = L.marker(latlng, {icon:markerRed}).bindPopup("<b>"+feature.properties.point_name +"</b>");

	markers.push(layer_marker);

	return layer_marker;

},
}).addTo(mymap);
	
	// change the map zoom so that all the data is shown
	mymap.fitBounds(questionsLayer.getBounds());

}


function questionsToAnswer(){
	checkQuestions(markers);
}

function checkQuestions(markersArray){
	
	latlng = userLocation.getLatLng();
	alert("Checking for nearby questions"); //works

	for(var i=0; i<markersArray.length; i++) {
	    current_point = markersArray[i];
	    currentpoint_latlng = current_point.getLatLng();

	    var distance = getDistanceFromLatLonInM(currentpoint_latlng.lat, currentpoint_latlng.lng, latlng.lat, latlng.lng);

	    if (distance <= 20) {
            markersArray[i].setIcon(markerPurple);
        } else {
        	markersArray[i].setIcon(markerBlue);
        }

        markersArray[i].on('click', onClick);

	}
}

//Code from:
//https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function getDistanceFromLatLonInM(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  var d2 = d * 1000;
  return d2;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

//this.feature.properties.question

var clickedQuestion;

function onClick(e) {

	showClickedQuestion(this);
	clickedQuestion = this;
}


function showClickedQuestion(clickedQuestion){

	document.getElementById('questionsection').style.display = 'block';
	document.getElementById('mapid').style.display = 'none';

	document.getElementById("question").value = clickedQuestion.feature.properties.question;
	document.getElementById("answer1").value = clickedQuestion.feature.properties.answer1;
	document.getElementById("answer2").value = clickedQuestion.feature.properties.answer2;
	document.getElementById("answer3").value = clickedQuestion.feature.properties.answer3;
	document.getElementById("answer4").value = clickedQuestion.feature.properties.answer4;

	document.getElementById("check1").checked = false;
	document.getElementById("check2").checked = false;
	document.getElementById("check3").checked = false;
	document.getElementById("check3").checked = false;

}


function validateAnswer(){

// now get the radio button values
	if ( (document.getElementById("check1").checked == false) &&
		(document.getElementById("check2").checked == false) &&
		(document.getElementById("check3").checked == false) &&
		(document.getElementById("check4").checked == false)) {
		
		alert("Please select an answer");

	} else {

	var givenAnswer;
	var answerValue;

	if (document.getElementById("check1").checked) {
        givenAnswer = 1;
        answerValue = clickedQuestion.feature.properties.answer1;
    }
    if (document.getElementById("check2").checked) {
    	givenAnswer = 2;
    	answerValue = clickedQuestion.feature.properties.answer2;
    }
	if (document.getElementById("check3").checked) {
		givenAnswer = 3;
		answerValue = clickedQuestion.feature.properties.answer3;

	}
	if (document.getElementById("check4").checked) {
		givenAnswer = 4;
		answerValue = clickedQuestion.feature.properties.answer4;
	}

		answerResponse(givenAnswer, answerValue);
	}

}

var answer_correct;
function answerResponse(answer, answerValue){

	var correctAnswer = clickedQuestion.feature.properties.correct_answer;
	var correctAnswerValue;

	if (correctAnswer == 1) {
        correctAnswerValue = clickedQuestion.feature.properties.answer1;
    }
    if (correctAnswer == 2) {
    	correctAnswerValue = clickedQuestion.feature.properties.answer2;
    }
	if (correctAnswer == 3) {
		correctAnswerValue = clickedQuestion.feature.properties.answer3;

	}
	if (correctAnswer == 4) {
		correctAnswerValue = clickedQuestion.feature.properties.answer4;
	}

	if (answer == correctAnswer) {
		alert("That is the correct answer: " + correctAnswer + "\nWell done!");
		answer_correct = true;
		submitAnswer(answer, answerValue, answer_correct);
	} else {
		alert("That is the wrong answer.\n The correct answer is: " + correctAnswer + " - " + correctAnswerValue);
		answer_correct = false;
		submitAnswer(answer, answerValue, answer_correct);
	}
}

function submitAnswer(answer, answer_value, answer_correct){

	var question = clickedQuestion.feature.properties.question;

	var postString = "&question="+question +"&answer="+answer +"&answer_value="+answer_value+"&answer_correct="+answer_correct;

	processData(postString);
}


var client;

function processData(postString) {
   client = new XMLHttpRequest();
   client.open('POST','http://developer.cege.ucl.ac.uk:30288/uploadAnswerData',true);
   client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
   client.onreadystatechange = dataUploaded;  
   client.send(postString);
}

// create the code to wait for the response from the data server, and process the response once it is received
function dataUploaded() {
  // this function listens out for the server to say that the data is ready - i.e. has state 4
  if (client.readyState == 4) {
    // change the DIV to show the response
    alert(client.responseText);

    document.getElementById('questionsection').style.display = 'none';
	document.getElementById('mapid').style.display = 'block';
	

	if (answer_correct) {
		clickedQuestion.setIcon(markerGreen);
	} else {
		clickedQuestion.setIcon(markerRed);
	}

    }
}





