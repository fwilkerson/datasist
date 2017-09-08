const fs = require('fs');
const uuid = require('uuid/v1');
const { join } = require('path');
const encode = JSON.stringify;
const decode = JSON.parse;
const lock = {};
const cache = {};

const parseData = (res, rej) => (err, data) => {
  if (err) return rej(err);
  let parsed = [];
  try {
    parsed = decode(data);
  } catch (e) {
    console.error(e);
  }
  res(parsed);
};

const readFile = file => (res, rej) => fs.readFile(file, parseData(res, rej));

const loadData = file => new Promise(readFile(file));

const unlockFile = file => result => {
  lock[file] = false;
  return result;
}

const resolveAction = (file, action) => {
  lock[file] = true;
  if (cache[file]) return action(cache[file]).then(unlockFile(file));
  
  return loadData(file)
    .then(data => {
      cache[file] = data;
      return action(data)
    })
    .then(unlockFile(file));
};

const queue = (file, action) => (res, rej) => {
  if (!lock[file]) return resolveAction(file, action).then(res).catch(rej);

  const intervalId = setInterval(() => {
    if (lock[file]) return;
    clearInterval(intervalId);
    return resolveAction(file, action)
      .then(res)
      .catch(rej);
  }, 1);
};

const asap = (file, action) => new Promise(queue(file, action(file)));

const writeFile = (file, input, data) => (res, rej) => {
  fs.writeFile(file, data, err => (err ? rej(err) : res(input)));
};

const appendRecord = obj => file => data => {
  obj._id = uuid();
  const result = data.concat(obj);
  cache[file] = result;
  const encoded = encode(result, null, 3);
  return new Promise(writeFile(file, obj, encoded));
};

const removeRecord = id => file => data => {
  const result = data.filter(x => x._id !== id);
  cache[file] = result;
  const encoded = encode(result, null, 3);
  return new Promise(writeFile(file, id, encoded));
};

const updateRecord = obj => file => data => {
  const result = data.map(x => (x._id === obj._id ? obj : x));
  cache[file] = result;
  const encoded = encode(result, null, 3);
  return new Promise(writeFile(file, obj, encoded));
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
