DROP TABLE locations, weathers, yelps, movies;

CREATE TABLE IF NOT EXISTS locations ( 
  id SERIAL PRIMARY KEY, 
  search_query VARCHAR(255), 
  formatted_query VARCHAR(255), 
  latitude NUMERIC(8, 6), 
  longitude NUMERIC(9, 6) 
);

CREATE TABLE IF NOT EXISTS weathers ( 
  id SERIAL PRIMARY KEY, 
  forecast VARCHAR(255), 
  time VARCHAR(255), 
  created_at BIGINT,
  location_id INTEGER NOT NULL REFERENCES locations(id) 
);

CREATE TABLE IF NOT EXISTS yelps (
  id SERIAL PRIMARY KEY,
  name VARCHAR (255),
  image_url TEXT,
  price VARCHAR (4),
  rating NUMERIC(2, 1),
  url TEXT,
  created_at BIGINT,
  location_id INTEGER NOT NULL REFERENCES locations(id) 
);

CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR (255),
  overview TEXT,
  average_votes NUMERIC(2,1),
  total_votes SMALLINT,
  image_url TEXT,
  popularity NUMERIC (6, 3),
  released_on VARCHAR (10),
  created_at BIGINT,
  location_id INTEGER NOT NULL REFERENCES locations(id) 
);
