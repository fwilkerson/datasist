const fs = require('fs');
const test = require('tape');
const { resolve } = require('path');
const ctx = require('../')('concurrent_data');

test('can handle concurrent append requests', t => {
  const repo = ctx.file('concurrent_append');

  for (let i = 0; i < 100; i++) {
    const record = { test: `test: ${i}`, createdOn: new Date().valueOf() };
    repo
      .append(record)
      .then(res => t.ok(res._id, 'record was appended'))
      .catch(e => t.notOk(e, 'append threw an error'));
  }

  t.plan(100);
});

test('can handle concurrent update requests', t => {
  const repo = ctx.file('concurrent_update');

  for (let i = 0; i < 100; i++) {
    const record = { test: `test: ${i}`, createdOn: new Date().valueOf() };
    repo
      .append(record)
      .then(res =>
        repo
          .update(Object.assign({}, res, { updatedOn: new Date().valueOf() }))
          .then(updated => t.ok(updated.updatedOn, 'record was updated'))
          .catch(e => t.notOk(e, 'udpate threw an error'))
      )
      .catch(e => t.notOk(e, 'append threw an error'));
  }

  t.plan(100);
});

test('can handle concurrent remove requrests', t => {
  const repo = ctx.file('concurrent_remove');

  for (let i = 0; i < 100; i++) {
    const record = { test: `test: ${i}`, createdOn: new Date().valueOf() };
    repo
      .append(record)
      .then(res =>
        repo
          .remove(res._id)
          .then(removed => t.ok(removed, 'record was removed'))
          .catch(e => t.notOk(e, 'udpate threw an error'))
      )
      .catch(e => t.notOk(e, 'append threw an error'));
  }

  t.plan(100);
});

test.onFinish(() => {
  const append = resolve('./concurrent_data/concurrent_append.json');
  const update = resolve('./concurrent_data/concurrent_update.json');
  if (fs.existsSync(append)) fs.unlinkSync(append);
  if (fs.existsSync(update)) fs.unlinkSync(update);
});
