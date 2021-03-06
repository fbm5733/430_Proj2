const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const url = require('url');
const redis = require('redis');
const csrf = require('csurf');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const dbURL = process.env.MONGODB_URI || 'mongodb://localhost/TeamBuilder';

// mongoose setup options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

mongoose.connect(dbURL, mongooseOptions, (err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

let redisURL = {
  // You will need to follow the "Setting up Redis for Local Use" instructions
  hostname: 'redis-18034.c258.us-east-1-4.ec2.cloud.redislabs.com',
  port: 18034,
};

let redisPASS = 'gQNeUf7rUnLQoKDk0o01qXoDnmPgsWLe';
if (process.env.REDISCLOUD_URL) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  [, redisPASS] = redisURL.auth.split(':');
}

const redisClient = redis.createClient({
  host: redisURL.hostname,
  port: redisURL.port,
  password: redisPASS,
});

// pull other routes
const router = require('./router.js');

const app = express();
app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
app.disable('x-powered-by');
app.use(compression());
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use(session({
  key: 'sessionid',
  store: new RedisStore({
    client: redisClient,
  }),
  secret: 'Magikarp, Shuckle, Gardevoir, Hatterene, Quagsire, Latias', // my secret code is my pokemon team haha
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
  },
}));

// makes helpers for handlebars
const handlebars = expressHandlebars.create({
  // Specify helpers which are only registered on this instance.
  helpers: {
    loop(n) {
      // array of length n, with values for each
      return Array.from(Array(n).keys());
    },
    memberExists(members, index) {
      // checks if the member exists
      if (members[index]) {
        return true;
      }
      return false;
    },
    getMemberProp(members, index, property) {
      // gets a specific property
      return members[index][property];
    },
  },
  defaultLayout: 'main',
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);
app.use(cookieParser());

app.use(csrf());
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  console.log('Missing CSRF Token');
  return false;
});

router(app);

app.listen(port, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${port}`);
});
