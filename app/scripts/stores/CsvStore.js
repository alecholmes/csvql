'use strict';

var CsvToSchema = require('../lib/CsvToSchema');
var Db = require('../lib/db');

var EventEmitter = require('events').EventEmitter;
var SqlAppDispatcher = require('../dispatcher/SqlAppDispatcher');
var SqlConstants = require('../constants/SqlConstants');
var assign = require('object-assign');

var ActionTypes = SqlConstants.ActionTypes;
var CsvStates = SqlConstants.CsvStates;
var ResultStates = SqlConstants.ResultStates;
var CHANGE_EVENT = 'change';

var db = new Db();
var dbTableName = 'data';

var csvData = {
  state: CsvStates.NO_DATA,
  text: '',
  error: undefined,
};

var querySql = '';

var resultData = {
  state: ResultStates.BLOCKED,
  results: undefined,
  error: undefined,
};

var CsvStore = assign({}, EventEmitter.prototype, {

  getImportState: function() {
    return csvData;
  },

  getQuerySql: function() {
    return querySql;
  },

  getResultState: function() {
    return resultData;
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

});

function importCsv() {
  var csv = csvData.text;
  if (db.tables().indexOf(dbTableName) >= 0) {
    db.dropTable(dbTableName);
  }

  if (csv.length === 0) {
    csvData = {
      state: CsvStates.NO_DATA,
      text: csv,
    };
    return;
  }

  var schemaWithData;
  try {
    schemaWithData = CsvToSchema.schemaWithData(csv);
  } catch (parseException) {
    csvData = {
      state: CsvStates.PARSE_ERROR,
      text: csv,
      error: parseException.toString(),
    };
    return;
  }

  var schema = {
    tableName: dbTableName,
    columns: schemaWithData.columns,
  };
  db.createTable(schema);

  if (schemaWithData.data.length > 0) {
    db.insertRows(dbTableName, schemaWithData.data);
  }

  csvData = {
    state: CsvStates.IMPORTED,
    text: csv,
  };
}

function runQuery() {
  if (csvData.state === CsvStates.NO_DATA || !querySql) {
    resultData = {
      state: ResultStates.BLOCKED,
    };
    return;
  }

  try {
    resultData = {
      state: ResultStates.EXECUTED,
      results: db.execute(querySql),
    };
  } catch (e) {
    resultData = {
      state: ResultStates.SQL_ERROR,
      error: e.toString(),
    };
  }
}

CsvStore.dispatchToken = SqlAppDispatcher.register(function(action) {

  switch (action.type) {

    case ActionTypes.UPDATE_CSV:
      csvData.text = action.csv;
      CsvStore.emitChange();
      break;

    case ActionTypes.IMPORT_CSV:
      importCsv();
      CsvStore.emitChange();
      break;

    case ActionTypes.UPDATE_QUERY:
      querySql = action.sql;
      CsvStore.emitChange();
      break;

    case ActionTypes.EXECUTE_QUERY:
      runQuery();
      CsvStore.emitChange();
      break;

    default:

    // do nothing
  }

});

module.exports = CsvStore;
