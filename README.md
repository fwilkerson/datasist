# filebase
An inefficient file based database

## Zero caching

Every add, update, and delete will cause a read/write file

Every get will cause a read file

## Limited Dependencies

node v6+

uuid v3+

## Get started

After cloning the repo you can install the dependencies by running;

`yarn install --production=false`&nbsp;&nbsp;or&nbsp;&nbsp;`npm install`

Check if everything is working by running;

`yarn test`&nbsp;&nbsp;or&nbsp;&nbsp;`npm test`

To use filebase import the module and point it at your desired database directory. Then you can create an object with a set of functions to modify a specific file.

```javascript
const filebase = require('/location/of/filebase')

const db = filebase('data');
const personRepo = db.file('person');
```
