Post http://localhost:3000/api/profiles/analyze

body: {
  "username": "Sunny108700541"
}
header : Content-Type :application/json

To get all profiles

GET http://localhost:3000/api/profiles

response: Return all profiles. 


To get particular Profile 

GET http://localhost:3000/api/profiles/{profile_name}

response: profile data.

Delete profle: 
POST: 

DELETE http://localhost:3000/api/profiles/{PROFILE_NAME}
