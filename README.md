# Datasist
An inefficient file based database for prototyping.

## Caching

Read operations are cached

Every create, update, patch, and delete will cause a write file

## Limited Dependencies

node v6+

uuid v3+

## Get started

`yarn add datasist`&nbsp;&nbsp;or&nbsp;&nbsp;`npm install --save datasist`

```javascript
// import datasist and tell it which directory to store files
const datasist = require('datasist')('my-data-directory');

// create a user file and return an object that modifies that file
const usersDb = datasist('user');

const user = { first: 'Jane', last: 'Doe' };

// append a record to the user file
usersDb.create(user)
  .then(result => {
    // after saving the record is returned with it's new _id field
    console.log(result._id);
  })
  .catch(e => console.error(e));


// query all records in the user file
usersDb.query()
  .then(users => console.log(users))
  .catch(e => console.error(e));

// query users that match the given predicate
usersDb.query(user => user.last.startsWith('D'))
  .then(users => console.log(users))
  .catch(e => console.error(e));
```
