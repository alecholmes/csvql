'use strict';

var keyMirror = require('keymirror');

module.exports = {
  ActionTypes: keyMirror({
    UPDATE_CSV: null,
    IMPORT_CSV: null,
    UPDATE_QUERY: null,
    EXECUTE_QUERY: null,
  }),

  CsvStates: keyMirror({
    IMPORTED: null,
    NO_DATA: null,
    PARSE_ERROR: null,
    IMPORT_ERROR: null,
  }),

  ResultStates: keyMirror({
    BLOCKED: null,
    EXECUTED: null,
    SQL_ERROR: null,
  }),
};
