const fs = require("fs");
const test = require("tape");
const { resolve } = require("path");
const ctx = require("../")("test_data/crud_data");

test("creates directory & file if none exists", t => {
  const fp = resolve("./test_data/crud_data/crud.json");
  const dir = resolve("./test_data/crud_data");
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
  if (fs.existsSync(dir)) fs.rmdirSync(dir);

  const repo = ctx("crud");
  const record = { name: "test 0", createdOn: new Date().valueOf() };
  repo
    .create(record)
    .then(result => t.ok(result._id, "_id was assigned to the record"))
    .catch(e => t.notOk(e, "create threw an error"));

  t.plan(1);
});

test("creates record and appends to existing file", t => {
  const repo = ctx("crud");
  const record = { name: "test 1", createdOn: new Date().valueOf() };
  repo
    .create(record)
    .then(result =>
      repo
        .query()
        .then(results => {
          const created = results.find(x => x._id === result._id);
          t.ok(results.length > 1, "results has more than one record");
          t.ok(created, "results has new record");
        })
        .catch(e => t.notOk(e, "get threw an error"))
    )
    .catch(e => t.notOk(e, "create threw an error"));

  t.plan(2);
});

test("gets the record by id", t => {
  const repo = ctx("crud");
  const record = { name: "test 2", createdOn: new Date().valueOf() };
  repo
    .create(record)
    .then(created =>
      repo
        .query(x => x._id === created._id)
        .then(results => {
          const updatedRecord = Object.assign({}, record, { _id: created._id });
          t.equal(results.length, 1, "only 1 result was returned");
          t.deepEqual(results[0], updatedRecord, "returned correct record");
        })
        .catch(e => t.notOk(e, "query threw an error"))
    )
    .catch(e => t.notOk(e, "create threw an error"));

  t.plan(2);
});

test("updates the record", t => {
  const repo = ctx("crud");
  const record = { name: "test 3", createdOn: new Date().valueOf() };
  repo
    .create(record)
    .then(created =>
      repo
        .update(Object.assign({}, created, { updatedOn: new Date().valueOf() }))
        .then(updated => t.ok(updated.updatedOn, "record was updated"))
        .catch(e => t.notOk(e, "update threw an error"))
    )
    .catch(e => t.notOk(e, "create threw an error"));

  t.plan(1);
});

test("patches the record", t => {
  const repo = ctx("crud");
  const record = { name: "test 3", createdOn: new Date().valueOf() };
  repo
    .create(record)
    .then(created =>
      repo
        .patch(created._id, { name: "patched?" })
        .then(patched =>
          repo
            .query(x => x._id === patched)
            .then(result =>
              t.equal(result[0].name, "patched?", "record was patched")
            )
        )
    )
    .catch(e => t.notOk(e, "create threw an error"));
  t.plan(1);
});

test("deletes the record", t => {
  const repo = ctx("crud");
  const record = { name: "test 4", createdOn: new Date().valueOf() };
  repo
    .create(record)
    .then(created =>
      repo
        .delete(created._id)
        .then(deleted => t.equal(deleted, created._id, "record was deleted"))
        .catch(e => t.notOk(e, "update threw an error"))
    )
    .catch(e => t.notOk(e, "create threw an error"));

  t.plan(1);
});
