
# Location Based Quiz

This repository contains the code for the server that is required to run the Location Based Quiz system that was created for the module ['Web and Mobile GIS - Apps and Programming'](https://sp.cege.ucl.ac.uk/study/Pages/Module-Guide.aspx?ModileCd=CEGEG077) at University College London.

This system comprises of two applications:  **a mobile application** and **a web application**. Together, these applications aim to create a functional location-based quiz. The overall purpose of this application is to encourage users to explore new places, whilst also learning something about the locations they visit through the answering of multi choice trivia questions.

## The Mobile Application
[The mobile application](https://github.com/nikscrits/quiz) is the user interface for the system where the user can track their location and answer nearby questions. It can be downloaded to an android phone using [this link](https://build.phonegap.com/apps/3152351/builds). The user help guide for the mobile application can be found here.

<img src="https://github.com/nikscrits/server/blob/master/screenshots/mobapp.png" width="500">

### Setup and Run the Web Application

1. Download the application on an android device using [this link](https://build.phonegap.com/apps/3152351/builds).
3. Run the httpServer.js as shown in the section below.

## The Web Application
[The web application](https://github.com/nikscrits/questions) is the administrator interface where questions can be set for the users to answer. It can be accessed from [this link](https://http://developer.cege.ucl.ac.uk:31288/) when both the httpServer.js (found in this repository) and the phonegap server (found in the web application repository) are running. The user help guide for the web application can be found here.

<img src="https://github.com/nikscrits/server/blob/master/screenshots/webapp.png" width="500">

### Setup and Run the Web Application

 1. Clone the repository:
```
git clone https://github.com/nikscrits/questions
cd questions
```
2. Run the phonegap server:
```
cd ucesncr
phonegap serve
```
3. Run the httpServer.js as shown in the section below.
## The Server
In order for both the applications to successfully function, a connection to a database is required where the questions and answer data will be saved. The httpServer.js found in this repository facilitates this connection.

### Setup and Run the Server

 1. Clone the repository:
```
git clone https://github.com/nikscrits/server
cd server
```
2. Run the server in the background:
```
node httpServer.js &
```

>*Note: This installation assumes the UCL server and database connection for this module will be used.*

## Technologies Used

This system was build using a number of technologies and templates:

 - [Material design lite](https://getmdl.io/)
 - [Leaflet interactive maps](https://leafletjs.com/)
 - [Leaflet awesome markers](https://github.com/lvoogdt/Leaflet.awesome-markers)
