# Project Name

**Author**: Erin Eckerman and Jessica Lovell
**Version**: 1.3.4 (increment the patch/fix version number if you make more commits past your first submission)

## Overview
This app is intended to provide the user with a high level view of the points of interest for their selected location (state, city, or specific address).  The app will provide the user with a map, weather forecast, restaurant reviews, and movies that are related to the location entered.

## Getting Started
In order to use this app on your own machine,  you must configure the tables for the data within postgres.  You must also set up an .env file that contains your own API keys for Google Maps, Dark Sky, Yelp, and The Movie DB.  The keys for each of these sites must have these labels in your .env file: GOOGLE_API_KEY, DARK_SKY_API, YELP_API_KEY, THE_MOVIE_DB_API. You also need to include a key for the database you establish in your sql shell following this syntax: DATABASE_URL=postgres://localhost:5432/DATABASE_NAME. The site can then either run on the local port or the associated heroku app deployment location.

## Architecture
This app has the following dependencies: pg, express, cors, dotenv, and superagent (see package.json file for more information).  These dependencies must be installed via your terminal.

## Change Log
09-21-2018 11:15 am - refactored code to allow for use of a generic function for lookup and estalished limits for caching data in the database.

## Credits and Collaborations
Thanks to the documentation provided by Google Maps, Dark Sky, Yelp, and The Movie Database.  Additional thanks to Koko Kasa and Sam Hamm for their patient assistance.