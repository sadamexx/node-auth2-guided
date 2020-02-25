const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session'); //#1 install and bring in
const restricted = require('../auth/restricted-middleware.js'); // #5 bring restricted in
const KnexStore = require('connect-session-knex')(session); //#8 install and bring in and CURRY and pass the sessions here 

const authRouter = require('../auth/auth-router.js');
const usersRouter = require('../users/users-router.js');
const knex = require('../database/dbConfig.js'); //#9 needed for storing sessions in the database 

const server = express();


//#3 set up the CONFIG
const sessionConfig = {
  name: 'cookieMonster',
  secret: 'chocolateChip', ///this should be an environment variable, meaning in dev it will be this, in production it will be a variable
  resave: false,
  saveUninitialized: true, //related to GDPR compliance... meaning we HAVE to tell them we are using cookies
  cookie: {
    maxAge: 1000 * 60 * 10, /// 1000 miliseconds is ten seconds, times 60 is one minute times 10 is ten minutes
    secure: false, //should be TRUE in production (https)
    httpOnly: true, //unless a SUPER good reason to be false, where JS can touch it
  }, 
  // #10 remember the NEW keyword below
  store: new KnexStore({
    knex,
    tablename: 'sessions',
    createtable: true,
    sidfieldname: 'sid',
    clearInterval: 1000 * 60 * 15, 

  })
}



server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));//#2 how long do u want the cookie to be valid, what is the key to encrypt, how should i send?
//at this point, there is a req.session object created by express-session
server.use('/api/auth', authRouter);
server.use('/api/users', restricted, usersRouter); // #6 put restricted here

server.get('/', (req, res) => {
  console.log(req.session);
  res.json({ api: 'up' });
});

module.exports = server;
