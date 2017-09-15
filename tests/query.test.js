const fs = require("fs");
const test = require("tape");
const { resolve } = require("path");
const ctx = require("../")("test_data/query_data");

test("query functionality?", t => {
  const repo = ctx.file("user");

  Promise.all([
    repo.create({ first: "Frank", last: "Wilkerson" }),
    repo.create({ first: "John", last: "Smith" }),
    repo.create({ first: "Jane", last: "Doe" }),
    repo.create({ first: "Sarah", last: "Chavez" }),
    repo.create({ first: "Laura", last: "Bemos" })
  ])
    .then(() => {
      repo
        .query()
        .then(data => {
          t.equal(data.length, 5, "empty query returns all records");
        })
        .catch(e => t.notOk(e, "query threw an error"));

      const queryRegEx = /s/i;
      repo
        .query(x => queryRegEx.test(x.last))
        .then(data => {
          t.equal(data.length, 3, "query with func returned filtered results");
        })
        .catch(e => t.notOk(e, "query threw an error"));
    })
    .catch(e => t.notOk(e, "create threw an error"));

  t.plan(2);
});

test.onFinish(() => {
  const user = resolve("./test_data/query_data/user.json");
  if (fs.existsSync(user)) fs.unlinkSync(user);
});
