# AngularTest
Test project for Angular position


Task is to write an authentication handler to access the FreelanceDiary API.

To access the API, you must supply a valid HTTP Authorization header with every request.

A valid authorization header has the following format:

Authorization: {jwtToken}

To obtain a JWT token, you must first authenticate your application by sending your

application’s id, your device’s name and unique identifier to the backend.

All the information you need to obtain a JWT token is here: http://pastebin.com/xJqEBJpJ ­

By reading the HTTP request, you should be able to figure out how to obtain the JWT token.

Some notes:

The URI where you can obtain a JWT token is:

POST http://fd­api­2­testing.freelancediary.com/auth

Please note the two headers:

X­Reference: a UUID which identifies the request, must be unique

for every request

X­UTC­Timestamp: self­explanatory

You must​supply these two headers with every request.

Parsing and storing the response of the API endpoint is completely up to you. Please store

the JWT Token returned in the Authorization header; the accessToken and the refreshToken

in a way that allows the tokens to be reused for any subsequent requests.

The returned token also has an expiration time.​If your token has expired, you must refresh

your token before you can use the token to access the API. Here’s a sample request:

http://pastebin.com/ykZGVNDg ­ You should be able to figure out how to refresh your JWT

token by reading the HTTP request.

Please be sure to only refresh the token when it has indeed expired! Please don’t issue any

unneeded requests to the API.

To test your authentication token, issue a GET request (with the Authorization header

included in the request, of course) to

http://fd­api­2­testing.freelancediary.com/auth/test_fdjwtv1 ­ if it returns a HTTP 200, then

your authorization token is valid.

Please make sure that your solution is well tested, and follows the TDD principles!

If you are stuck, feel free to go to ​http://v2.freelancediary.com/#/test​where you can try

the authentication API.

Summary:

1. Obtain a JWT Token

2. If the JWT token has expired, refresh it.

3. Please cover every use case with tests. (Unit + E2E)




#Results

Powerd by VisualStudio 2015.  Node.js is required for tests

JS source code is in the src\AngularTest\wwwroot\js\modules\fdAuth.js 
Tests are in the src\AngularTest\Tests\fdAuth.test.js 	