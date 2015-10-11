var SqlAppDispatcher = require('../dispatcher/SqlAppDispatcher');
var SqlConstants = require('../constants/SqlConstants');

var ActionTypes = SqlConstants.ActionTypes;

module.exports = {
  updateCsv: function(csv) {
    SqlAppDispatcher.dispatch({
      type: ActionTypes.UPDATE_CSV,
      csv: csv,
    });
  },

  importCsv: function() {
    SqlAppDispatcher.dispatch({
      type: ActionTypes.IMPORT_CSV,
    });
  },

  updateQuery: function(sql) {
    SqlAppDispatcher.dispatch({
      type: ActionTypes.UPDATE_QUERY,
      sql: sql,
    });
  },

  executeQuery: function() {
    SqlAppDispatcher.dispatch({
      type: ActionTypes.EXECUTE_QUERY,
    });
  },
};
