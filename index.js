const fs = require('fs');
const uuid = require('uuid/v1');
const { join } = require('path');
const lock = {};

const encode = JSON.stringify;

const parseData = (res, rej) => (err, data) => {
  if (err) return rej(err);
  let parsed = [];
  try {
    parsed = JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  res(parsed);
};

const readFile = file => (res, rej) => fs.readFile(file, parseData(res, rej));

const loadData = file => new Promise(readFile(file));

const resolveAction = (key, action) => {
  lock[key] = true;
  return loadData(key)
    .then(action(key))
    .then(result => {
      lock[key] = false;
      return result;
    });
};

const queue = (key, action) => (res, rej) => {
  if (!lock[key]) {
    return resolveAction(key, action)
      .then(res)
      .catch(rej);
  }

  const intervalId = setInterval(() => {
    if (lock[key]) return;
    clearInterval(intervalId);
    return resolveAction(key, action)
      .then(res)
      .catch(rej);
  }, 1);
};

const asap = (key, action) => new Promise(queue(key, action));

const writeFile = (file, input, data) => (res, rej) => {
  fs.writeFile(file, data, err => (err ? rej(err) : res(input)));
};

const appendRecord = obj => file => data => {
  obj._id = uuid();
  const result = encode(data.concat(obj), null, 3);
  return new Promise(writeFile(file, obj, result));
};

const removeRecord = id => file => data => {
  const result = encode(data.filter(x => x._id !== id), null, 3);
  return new Promise(writeFile(file, id, result));
};

const updateRecord = obj => file => data => {
  const result = encode(data.map(x => (x._id === obj._id ? obj : x)), null, 3);
  return new Promise(writeFile(file, obj, result));
};

const fileContext = dir => fileName => {
  const file = join(dir, `${fileName}.json`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  if (!fs.existsSync(file)) fs.writeFileSync(file, encode([], null, 3));
  return {
    get: () => loadData(file),
    getById: id => loadData(file).then(data => data.find(x => x._id === id)),
    append: obj => asap(file, appendRecord(obj)),
    remove: id => asap(file, removeRecord(id)),
    update: obj => asap(file, updateRecord(obj))
  };
};

module.exports = dir => ({ file: fileContext(dir) });
