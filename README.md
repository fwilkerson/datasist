# Datasist
An inefficient file based database for prototyping.

## Caching

Read operations are cached

Every add, update, and delete will cause a write file

## Limited Dependencies

node v6+

uuid v3+

## Get started

`yarn add datasist`&nbsp;&nbsp;or&nbsp;&nbsp;`npm install --save datasist`

```javascript
// import datasist and tell it which directory to store files
const datasist = require('datasist')('my-data-directory');

// create a user file and return an object is used to modify that file
const usersDb = datasist('user');

const user = { first: 'Jane', last: 'Doe' };

// append a record to the user file
usersDb.append(user)
  .then(result => {
    // after saving the record is returned with it's new _id field
    console.log(result._id);
  })
  .catch(e => console.error(e));
```
