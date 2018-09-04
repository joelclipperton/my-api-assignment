/*
 * Primary file for API
 *
 */

// Dependencies
const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

 // Instantiate the HTTP server
const httpServer = http.createServer((req,res) => {
  unifiedServer(req, res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, _ => {
  console.log(`Serving on port ${config.httpPort}.`);
});

// HTTPS server options
const httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};

// Instantiate the HTTPS server
const httpsServer = https.createServer(httpsServerOptions, (req,res) => {
  unifiedServer(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, _ => {
  console.log(`Serving on port ${config.httpsPort}.`);
});

// Unified server logic
const unifiedServer = (req, res) => {
  // Parse the url
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get the HTTP method
  var method = req.method.toLowerCase();

  //Get the headers as an object
  var headers = req.headers;

  // Get the payload,if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';

  req.on('data', (data) => {
      buffer += decoder.write(data);
  });

  req.on('end', _ => {
      buffer += decoder.end();

      // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
      var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

      // Construct the data object to send to the handler
      var data = {
        trimmedPath,
        queryStringObject,
        method,
        headers,
        'payload' : buffer
      };

      // Route the request to the handler specified in the router
      chosenHandler(data, (statusCode,payload) => {

        // Use the status code returned from the handler, or set the default status code to 200
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

        // Use the payload returned from the handler, or set the default payload to an empty object
        payload = typeof(payload) == 'object' ? payload : {};

        // Convert the payload to a string
        var payloadString = JSON.stringify(payload);

        // Return the response
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString);
        console.log("Returning this response: ",statusCode,payloadString);

      });
  });
};

// Define all the handlers
var handlers = {};

// Ping Handler
handlers.ping = (data,callback) => {
  callback(200);
};

// Ping Handler
handlers.hello = (data,callback) => {
  callback(200, { 'message': 'hello people!' });
};

// Stop 404s from occuring until I can serve the favicon for real
handlers.favIcon = (data, callback) => {
  callback(200, { 'icon': 'not serving an icon yet. will need to set this up!'});
}

// Not found handler
handlers.notFound = (data,callback) => {
  callback(404);
};

// Define the request router
var router = {
  'ping': handlers.ping,
  'hello': handlers.hello,
  'favicon.ico': handlers.favIcon
};