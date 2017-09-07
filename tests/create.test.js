const test = require('tape');
const filebase = require('../index');

const ctx = filebase('data');

test('creates director & file if none exists', t => {});

test('create a record', t => {
  const repo = ctx.file('test');
  const record = { name: 'test 0', createdOn: new Date().valueOf() };
  repo
    .append(record)
    .then(result => t.ok(result._id, '_id was assigned to the record'))
    .catch(e => t.notOk(e, 'append threw an error'));

  t.plan(1);
});
