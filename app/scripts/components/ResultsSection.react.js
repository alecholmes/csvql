'use strict';

var Bootstrap = require('react-bootstrap');
var React = require('react');
var _ = require('underscore');

var ResultsSection = React.createClass({

  _renderDataTable: function(columns, rows) {
    var ths = _.map(columns, function(column, colIndex) {
      return (
        <th key={colIndex}>{column}</th>
      );
    });

    var trs = _.map(rows, function(row, rowIndex) {
      var tds = _.map(row, function(value, colIndex) {
        // TODO: escape value
        return <td key={rowIndex + '.' + colIndex}>{value}</td>;
      });

      return (<tr key={rowIndex}>{tds}</tr>);
    });

    return (
      <Bootstrap.Table
        bordered
        condensed
        hover
        striped>

        <thead>
          <tr>
            {ths}
          </tr>
        </thead>
        <tbody>
          {trs}
        </tbody>
      </Bootstrap.Table>
    );
  },

  render: function() {
    var dataTable;
    var message;

    if (this.props.state.results) {
      dataTable = this._renderDataTable(this.props.state.results.columns, this.props.state.results.values);
    } else {
      message = <div className='text-center'>No results yet</div>;
    }

    return (
      <div>
        <Bootstrap.Row>
          <Bootstrap.Col md={2}>
            <div>
              <b>Results</b>
            </div>
          </Bootstrap.Col>

          <Bootstrap.Col md={8}>
            {dataTable}
            {message}
          </Bootstrap.Col>

          <Bootstrap.Col md={2}>
          </Bootstrap.Col>
        </Bootstrap.Row>
      </div>
    );
  },

});

module.exports = ResultsSection;
