# Location Based Quiz - User Interface App

This repository contains the code used to create a phonegap app that is the user interface for a location based quiz. This app aims to:

* Download the questions that have been created by the administrator from a database and show them as markers on a Leaflet map.
* Show the user's current location.
* Colour the question markers according to their distance from the user's location.
* Present the question upon the user cliking any marker within 20m of their current location.
* Inform the user whether they got the question correct.
* Send the answers to a database.

It can be downloaded on a suitable android device using the QR code found [here](https://github.com/nikscrits/server/blob/master/screenshots/QRcode.png) or via the phonegap website using [this link](https://build.phonegap.com/apps/3152351/builds). The user help guide can be found as a html page [here](https://rawgit.com/nikscrits/quiz/master/userguide/Quiz%20User%20Guide.html) or as a PDF file [here](https://github.com/nikscrits/quiz/blob/master/userguide/Quiz%20User%20Guide%20PDF.pdf). In order for this application to function succesfully, the [httpServer.js](https://github.com/nikscrits/server) needs to be running.

> For a more technical review of this application see the [server repository](https://github.com/nikscrits/server).

<p align="center"><img src="https://github.com/nikscrits/server/blob/master/screenshots/mobapp.png" width="600"></p>