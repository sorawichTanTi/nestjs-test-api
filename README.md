## Installation

npm install

## Run tests

npm run test:e2e

## Run server

npm run start
npm run dev

## API Documentation
default port is 3000 or change it in env file
http://localhost:3000/api-docs

## API Endpoints

POST /get-encrypt-data

Request :
```json
{
  "payload": "hello world"
}
```
Response :
```json
{
  "successful": true,
  "data": {
    "data1": "encrypted_aes_key",
    "data2": "iv:encrypted_payload"
  }
}
```
POST /get-decrypt-data

Request :
```json
{
  "data1": "string",
  "data2": "string"
}
```
Response :
```json
{
  "successful": true,
  "data": {
    "payload": "hello world"
  }
}
```
