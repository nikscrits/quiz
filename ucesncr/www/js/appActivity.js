//Load the map
var mymap = L.map('mapid').fitWorld();

//Load the tiles
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw", {
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	maxZoom: 18,
	id: 'mapbox.streets'}).addTo(mymap);

mymap.locate({setView: true, maxZoom: 18});

//Create the custom marker styles

//Will represent the user's lcoation
var markerOrange = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'orange'
});

//Will represent the question point if the user gets the answer correct
var markerGreen = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'green'
});

//Will represent the question point if the user gets the answer incorrect
var markerRed = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'red'
});

//Will represent all question points that are close enough to be answered
var markerPurple = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'purple'
});

//Will represent all the question points when they are loaded and if they are not close enough to be answered
var markerBlue = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'cadetblue'
});

//The following code tracks the user's location as they move
//adapted from: https://www.w3schools.com/html/html5_geolocation.asp
//adapted from: https://gis.stackexchange.com/questions/182068/getting-current-user-location-automatically-every-x-seconds-to-put-on-leaflet
var initialTracking = true;
var userLocation;
var userLocationRad;
var autoPan = false;

function trackLocation() {
	if (!initialTracking){
		//Zoom to center
		mymap.fitBounds(userLocation.getLatLng().toBounds(250));
		autoPan = true;
			
	} else {
		if (navigator.geolocation) {
			alert("Finding your position!");
			navigator.geolocation.watchPosition(showPosition);

		//Error handling for if it cannot geolocate
		} else {
			alert("Geolocation is not supported by this browser.");
		}
	}
}

//Shows the user's current position as an orange marker on the map and pans the map to that location
function showPosition(position) {

	if(!initialTracking){
		mymap.removeLayer(userLocation);
		mymap.removeLayer(userLocationRad);
	}

	//Adds a circle around the marker to show the radius where questions can be answered (20m) 
	var setRad = 20; 

	userLocationRad = L.circle([position.coords.latitude,position.coords.longitude], {
		color: 'orange',
		fillColor: '#FFD36E',
    	fillOpacity: 0.5,
    	radius: setRad
		}).addTo(mymap);

	userLocation = L.marker([position.coords.latitude,position.coords.longitude], {icon:markerOrange}).addTo(mymap);
	
	if(initialTracking){
		initialTracking = false;
		mymap.fitBounds(userLocation.getLatLng().toBounds(250));
		autoPan = true;
	}else if (autoPan) {
		mymap.panTo(userLocation.getLatLng());
		
	}
}


//Create a variable that will hold the XMLHttpRequest()
var client;
	
//Create a variable that will hold the layer itself
var questionsLayer;

//A function to get the questions from the database using an XMLHttpRequest
function getQuestions() {

	client = new XMLHttpRequest();
	client.open('GET','http://developer.cege.ucl.ac.uk:30288/getquestions');
	client.onreadystatechange = questionResponse;
	client.send();
}

//A function that will to wait for the response from the data server, and process the response once it is received
function questionResponse() {

	//This listens out for the server to say that the data is ready - i.e. has state 4
	if (client.readyState == 4) {
	//Once the data is ready, process the data by moving to the 'loadQuestionLayer' function
	var questionData = client.responseText;
	loadQuestionLayer(questionData);
	}
}

//Create an empty array that will hold all of the question markers once they are created
markers = [];

//A function to convert the received data - which is text - to JSON format and add it as a markerto the map
function loadQuestionLayer(questionData) {
	
	//Convert the text to JSON
	var questionJSON = JSON.parse(questionData);
		
	//Load the geoJSON layer
	var questionsLayer = L.geoJson(questionJSON,
	{
		//Use point to layer to create the points
		pointToLayer: function (feature, latlng)
	{
		//Create a marker for each of the questions and set it to blue
		//Add a pop-up stating that there is a question there
		layer_marker = L.marker(latlng, {icon:markerBlue});	

		layer_marker.bindPopup("<b>There's a question here!</b>");

		//Add the marker to the 'markers' array
		markers.push(layer_marker);

		return layer_marker;
	},
	}).addTo(mymap);
	
	//Change the map zoom so that all the question markers are shown
	mymap.fitBounds(questionsLayer.getBounds());

}

//A function to check if each question point is within 20m of the user's current location
function checkQuestions(){

	//Assign the latitude and longitude of the user's current location
	var latlng = userLocation.getLatLng();
	alert("Checking for nearby questions");

	//Zoom into the user's current location
	mymap.fitBounds(latlng.toBounds(500));

	//Iterate around each of the markers and check if they are within 20m of the user's current location
	for(var i=0; i<markers.length; i++) {

		//Assign the latitude and longitude of the marker currently being checked
	    current_point = markers[i];
	    currentpoint_latlng = current_point.getLatLng();

	    //Find the distance between the current question marker, and the user's current location using the 'getDistance' function
	    //A distance between the markers in meters is returned
	    var distance = getDistance(currentpoint_latlng.lat, currentpoint_latlng.lng, latlng.lat, latlng.lng);

	    //If the distance is under 20m then make the marker purple and allow click events to be processed
	    if (distance <= 20) {
            markers[i].setIcon(markerPurple);
			markers[i].on('click', onClick);

        } else {
        	//If the distance is over 20m then make the marker blue and show a pop up when the marker is clicked
        	markers[i].setIcon(markerBlue);
        	markers[i].bindPopup("<b>Can't Answer!</b><br>This question is too far away.");
        }
	}
}

//Function to work out the distance between the latitudes and longitudes of two points
//Code from: https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function getDistance(lat1,lon1,lat2,lon2) {
  
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; //Distance in km
  var d2 = d * 1000; //Distance in m
  return d2;

}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

//Create a variable for the marker that has been clicked
var clickedQuestion;

function onClick(e) {

	//When a marker is clicked go to the 'showClickedQuestion' function
	showClickedQuestion(this);

	//Assign the marker that has been cliked to the 'clickedQuestion' variable
	clickedQuestion = this;
}

//A function to show the div that holds the question form where the user can submit their answer
function showClickedQuestion(clickedQuestion){

	//Hide the div that holds the leaflet map and show the div that holds the question form
	document.getElementById('questionsection').style.display = 'block';
	document.getElementById('mapid').style.display = 'none';

	//Populate the textareas with the question data for the marker that has been clicked
	document.getElementById("question").value = clickedQuestion.feature.properties.question;
	document.getElementById("answer1").value = clickedQuestion.feature.properties.answer1;
	document.getElementById("answer2").value = clickedQuestion.feature.properties.answer2;
	document.getElementById("answer3").value = clickedQuestion.feature.properties.answer3;
	document.getElementById("answer4").value = clickedQuestion.feature.properties.answer4;

	//Make the radio buttons all unchecked for the user to make their choice
	document.getElementById("check1").checked = false;
	document.getElementById("check2").checked = false;
	document.getElementById("check3").checked = false;
	document.getElementById("check3").checked = false;
}

//A function to validate and process the answer given by the user
function validateAnswer(){

	//Get the radio button values and ensure an answer has been given
	if ( (document.getElementById("check1").checked == false) &&
		(document.getElementById("check2").checked == false) &&
		(document.getElementById("check3").checked == false) &&
		(document.getElementById("check4").checked == false)) {
		
		//If an answer hasn't been selected the user will be warned to give an answer
		alert("Please select an answer");

	} else {

	//If an answer has been given
	//Create two variables for the answer that has been given and its value
	var givenAnswer;
	var answerValue;

	//Assign the created variables based upon the answer given by the user
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

	//Send the answer given and its value to the 'answerResponse' function
	answerResponse(givenAnswer, answerValue);

	}
}

//Create a variable to hold a boolean for whether the user gets the answer right or wrong
var answer_correct;

function answerResponse(answer, answerValue){

	//Assign the correct answer from the clicked marker
	var correctAnswer = clickedQuestion.feature.properties.correct_answer;
	var correctAnswerValue;

	//Assign the value of the answer depending on the number
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

	//If the answer the user gives is the same as the correct answer
	if (answer == correctAnswer) {

		//Alert them that they have got the answer correct
		alert("That is the correct answer: " + correctAnswer + "\nWell done!");
		//Make variable true
		answer_correct = true;
		//Submit the answer by sending it to the 'submitAnswer' function
		submitAnswer(answer, answerValue, answer_correct);

	} else {
		//If the answer the user gives is incorrect
		//Alert them that they have got the answer wrong
		alert("That is the wrong answer.\nThe correct answer is: " + correctAnswer + " - " + correctAnswerValue);
		//Make variable false
		answer_correct = false;
		//Submit the answer by sending it to the 'submitAnswer' function
		submitAnswer(answer, answerValue, answer_correct);
	}
}

//A function to create a string with all the question and answer details to send to the database
function submitAnswer(answer, answer_value, answer_correct){

	var question = clickedQuestion.feature.properties.question;
	//Create and assign a varibale with all of the details about the clicked marker, the answer given by the user, and if they were correct
	var postString = "&question="+question +"&answer="+answer +"&answer_value="+answer_value+"&answer_correct="+answer_correct;
	processData(postString);
}

//Create a variable that will hold the XMLHttpRequest()
var client2;

//A function that will send the data to the database using an XMLHttpRequest
function processData(postString) {

   client2 = new XMLHttpRequest();
   client2.open('POST','http://developer.cege.ucl.ac.uk:30288/uploadAnswerData',true);
   client2.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
   client2.onreadystatechange = dataUploaded;  
   client2.send(postString);
}

//A function to wait for the response from the data server, and process the response once it is received
function dataUploaded() {
	//Listens out for the server to say that the data is ready - i.e. has state 4
  	if (client2.readyState == 4) {

    	//Show an alert with the response text
    	alert(client2.responseText);

    	//Go to the 'returnToMap' function to show the div holding the map again
		returnToMap();

		//Change the colour of the question marker depending on if they were right or wrong
		if (answer_correct) {
			//If they were correct = green
			clickedQuestion.setIcon(markerGreen);
		} else {
			//If they were wrong = red
			clickedQuestion.setIcon(markerRed);
		}
    }
}

//A function to return the map to its first state 
//This is with the div that holds map showing, and the div that holds the question form hidden
function returnToMap(){
	document.getElementById('questionsection').style.display = 'none';
	document.getElementById('mapid').style.display = 'block';
}