# Daimonion

Daimonion is an authentication microservice built with Express, Bookshelf and Redis. It allows 
connected applications to pass users for registration and login, returning tokens, and 
to pass tokens for authorization. Token expiration is configurable, and on every request,
Daimonion checks the token to see whether it is still valid. If the token is valid but has expired, 
Daimonion creates and stores a new token, and passes it back to the requesting application. 


## Why use Daimonion?

If you don't want to deal with authentication inside your app, or are using multiple apps/services
which require authenticating users.

## How does it work?
Daimonion uses Bookshelf to manage RDBMS databases (in the example, I'm using MySQL, but it's 
trivial to switch to PostgreSQL or SQLite) to persistently store user data, and Redis to quickly 
retrieve user data on authentication requests. 

## Installation
```$xslt
$ git clone https://github.com/boriskogan81/daimonion.git
//...change to /daimonion directory
$ npm install

//Copy the files in the config_templates folder into the config folder at root level, 
//make adjustments as necessary
//Run initial Knex migration:

$ knex migrate:latest

$ npm start
```

## Usage
Route registration, login and authentication requests to the appropriate routes, so that your main backend application doesn't need to worry about dealing with these things. 

## Tests
Daimonion uses in-memory SQLite for testing. The databases interface is the same (Bookshelf/Knex) as for the normal app. Migrations run on every test run, to ensure that the structure of the database is up to date, and when the tests are done running, any stored data/tables disappear.  
```
$ npm run test
```
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)