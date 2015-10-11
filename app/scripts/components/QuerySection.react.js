'use strict';

var Bootstrap = require('react-bootstrap');
var CsvSectionActionCreators = require('../actions/CsvSectionActionCreators');
var React = require('react');

var QuerySection = React.createClass({

  _onChange: function(event) {
    CsvSectionActionCreators.updateQuery(event.target.value);
  },

  _execute: function() {
    CsvSectionActionCreators.executeQuery();
  },

  render: function() {
    var errorSection;
    if (this.props.state.error) {
      errorSection = (
        <Bootstrap.Alert bsStyle='danger'>
          {this.props.state.error}
        </Bootstrap.Alert>
      );
    }

    return (
      <div>
        <Bootstrap.Row>
          <Bootstrap.Col md={2}>
            <div className='text-rightx'>
              <b>Query</b>
              <p>
                SQL query against the CSV data, which is contained in a table named <code>data</code>.
              </p>
            </div>
          </Bootstrap.Col>

          <Bootstrap.Col md={8}>
            <Bootstrap.Input
              name='query'
              onChange={this._onChange}
              rows={5}
              style={{fontFamily: 'monospace'}}
              type='textarea'
              value={this.props.state.sql} />
            {errorSection}
            <div className='pull-right'>
              <Bootstrap.Button
                bsStyle='primary'
                onClick={this._execute}>
                Execute
              </Bootstrap.Button>
            </div>
          </Bootstrap.Col>

          <Bootstrap.Col md={2}>
          </Bootstrap.Col>
        </Bootstrap.Row>
      </div>
    );
  },

});

module.exports = QuerySection;
