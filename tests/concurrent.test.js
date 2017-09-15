const fs = require("fs");
const test = require("tape");
const { resolve } = require("path");
const ctx = require("../")("test_data/concurrent_data");

test("can handle concurrent create requests", t => {
  const repo = ctx.file("concurrent_create");

  for (let i = 0; i < 98; i++) {
    const record = { test: `test: ${i}`, createdOn: new Date().valueOf() };
    repo
      .create(record)
      .then(res => t.ok(res._id, "record was created"))
      .catch(e => t.notOk(e, "create threw an error"));
  }

  t.plan(98);
});

test("can handle concurrent update requests", t => {
  const repo = ctx.file("concurrent_update");

  for (let i = 0; i < 98; i++) {
    const record = { test: `test: ${i}`, createdOn: new Date().valueOf() };
    repo
      .create(record)
      .then(res =>
        repo
          .update(Object.assign({}, res, { updatedOn: new Date().valueOf() }))
          .then(updated => t.ok(updated.updatedOn, "record was updated"))
          .catch(e => t.notOk(e, "udpate threw an error"))
      )
      .catch(e => t.notOk(e, "create threw an error"));
  }

  t.plan(98);
});

test("can handle concurrent delete requests", t => {
  const repo = ctx.file("concurrent_delete");

  for (let i = 0; i < 98; i++) {
    const record = { test: `test: ${i}`, createdOn: new Date().valueOf() };
    repo
      .create(record)
      .then(res =>
        repo
          .delete(res._id)
          .then(deleted => t.ok(deleted, "record was deleted"))
          .catch(e => t.notOk(e, "udpate threw an error"))
      )
      .catch(e => t.notOk(e, "create threw an error"));
  }

  t.plan(98);
});

test.onFinish(() => {
  const create = resolve("./test_data/concurrent_data/concurrent_create.json");
  const update = resolve("./test_data/concurrent_data/concurrent_update.json");
  if (fs.existsSync(create)) fs.unlinkSync(create);
  if (fs.existsSync(update)) fs.unlinkSync(update);
});
