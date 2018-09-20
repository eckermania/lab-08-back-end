`use strict`;

const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);

client.connect();
client.on('error', err => console.error(err));

app.use(cors());

app.get('/location', getLocation);
app.get('/weather', getWeather);
app.get('/yelp', getYelp);
app.get('/movies', getMovie);

app.listen(PORT, () => console.log(`Listsening on ${PORT}`));

function getLocation (request, response){
  Location.lookupLocation({
    tableName: Location.tableName,
    query: request.query.data,

    cacheHit: function (result) {
      response.send(result);
    },

    cacheMiss: function () {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${this.query}&key=${process.env.GOOGLE_API_KEY}`;
      return superagent.get(url)
        .then (result => {
          const location = new Location(this.query, result); 
          location.save()
            .then(location => response.send(location));
        })
        .catch(error => handleError(error));
    }
  })
}

function lookup(request) {
  const SQL

  // Weather.lookup = (options) => {
  //   const SQL = `SELECT * FROM ${options.tableName} WHERE location_id=$1;`;
  //   const values = [location];
  
  //   client.query(SQL, values)
  //     .then(result => {
  //       // if there is more than one record in the database, pass the array of objects as an argument to the cacheHit method
  //       if(result.rowCount > 0) {
  //         options.cacheHit(result.rows);
  //       } else {
  //         options.cacheMiss();
  //       }
  //     })
  //     .catch(error => handleError(error));
  // }

  // tableName: Weather.tableName,

  //   cacheMiss: function() {
  //     const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

  //     superagent.get(url)
  //       .then(result => {
  //         const weatherSummaries = result.body.daily.data.map(day => {
  //           const summary = new Weather(day);
  //           summary.save(request.query.data.id);
  //           return summary;
  //         });

  //         response.send(weatherSummaries);
  //       })
  //       .catch(error => handleError(error, response));
  //   },
}

function getWeather (request, response) {
  Weather.lookup({
    tableName: Weather.tableName,
    cacheMiss: function () {
      const url = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API}/${request.query.data.latitude},${request.query.data.longitude}`

      superagent.get(url)
        .then(result => {
          const weatherSummaries = result.body.daily.data.map(day => {
            const summary = new Weather(day);
            summary.save(request.query.data.id);
            return summary;
          });
          response.send(weatherSummaries);
        })
        .catch(error => handleError(error, response));
    },
    cacheHit: function(resultsArray){
      let ageOfResultsInMinutes = (Date.now()-resultsArray[0].created_at)/(1000*60);
      if(ageOfResultsInMinutes > 30) {
        Weather.deleteByLocationId(Weather.tableName, request.query.data.id);
        this.cacheMiss();
      } else {
        response.send(resultsArray);
      }
    }
  });
}

function getYelp (request, response) {
  const url = `https://api.yelp.com/v3/businesses/search?location=${request.query.data.search_query}`;

  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then((result) => {
      const yelpArray = result.body.businesses.map(food => {
        return new Yelp(food);
      })
      response.send(yelpArray);
    })
    .catch(error => handleError(error, response));
}

function getMovie (request, response) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.THE_MOVIE_DB_API}&query=${request.query.data.search_query}`;

  superagent.get(url)
    .then((result) => {
      response.send(result.body.results.map( movie => new Movie(movie)));
    })
    .catch(error => handleError(error, response));
}


function handleError (error, response) {
  console.error(error);
  if(response) return response.status(500).send('Sorry something went terribly wrong.');
}

function deleteByLocationId (table, city) {
  const SQL = `DELETE from ${table} WHERE location_id=${city};`;
  return client.query(SQL);
}

//Constructors
function Location (query, result) {
  this.search_query = query;
  this.formatted_query = result.body.results[0].formatted_address;
  this.latitude = result.body.results[0].geometry.location.lat;
  this.longitude = result.body.results[0].geometry.location.lng;
  this.created_at = Date.now()
}

Location.lookupLocation = (location) => {
  const SQL = `SELECT * FROM locations WHERE search_query=$1;`;
  const values = [location.query]; 

  return client.query(SQL, values)
    .then(result => {
      if (result.rowCount > 0){
        location.cacheHit(result.rows[0]);
      } else {
        location.cacheMiss();
      }
    })
    .catch(console.error);
}

Location.prototype = {
  save: function () {
    const SQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id;`;
    const values = [this.search_query, this.formatted_query, this.latitude, this.longitude];

    return client.query(SQL, values)
      .then( result => {
        this.id = result.rows[0].id;
        return this;
      });
  }
};

function Weather (day) {
  this.tableName = 'weathers';
  this.created_at = Date.now();
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
  this.forecast = day.summary;
}

Weather.prototype = {
  save: function(location_id){
    const SQL = `INSERT INTO ${this.tableName} (forecast, time, location_id) VALUES ($1, $2, $3, $4);`;
    const values = [this.forecast, this.time, this.created_at, location_id];
    client.query(SQL, values);
  }
}

Weather.tableName = 'weathers';

function Yelp (food) {
  this.name = food.name;
  this.image_url = food.image_url;
  this.price = food.price;
  this.rating = food.rating;
  this.url = food.url;
}

function Movie (film) {
  this.title = film.title;
  this.overview = film.overview;
  this.average_votes = film.vote_average;
  this.total_votes = film.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${film.poster_path}`;
  this.popularity = film.popularity;
  this.released_on = film.release_date;
}
