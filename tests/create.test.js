const fs = require('fs');
const test = require('tape');
const { resolve } = require('path');

const filebase = require('../index');
const ctx = filebase('data');

test('creates directory & file if none exists', t => {
  const fp = resolve('./data/test.json');
  const dir = resolve('./data');
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
  if (fs.existsSync(dir)) fs.rmdirSync(dir);

  const repo = ctx.file('test');
  const record = { name: 'test 0', createdOn: new Date().valueOf() };
  repo
    .append(record)
    .then(result => t.ok(result._id, '_id was assigned to the record'))
    .catch(e => t.notOk(e, 'append threw an error'));

  t.end();
});

test('appends record to existing file', t => {
  const repo = ctx.file('test');
  const record = { name: 'test 1', createdOn: new Date().valueOf() };
  repo
    .append(record)
    .then(result =>
      repo.get().then(results => {
        t.ok(results.length > 1, 'results has more than one record');
        t.ok(results.find(x => x._id === result._id), 'results has new record');
      })
    )
    .catch(e => t.notOk(e, 'append threw an error'));

  t.end();
});
