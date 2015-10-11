'use strict';

var Bootstrap = require('react-bootstrap');
var CsvSectionActionCreators = require('../actions/CsvSectionActionCreators');
var React = require('react');

var CsvSection = React.createClass({

  _onChange: function(event) {
    CsvSectionActionCreators.updateCsv(event.target.value);
  },

  _update: function() {
    CsvSectionActionCreators.importCsv();
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
              <b>CSV</b>
              <p>
                Data separated by <code>,</code>, where each field may optionally be <code>"quoted"</code>.
              </p>
            </div>
          </Bootstrap.Col>

          <Bootstrap.Col md={8}>
            <Bootstrap.Input
              name='csv'
              onBlur={this._update}
              onChange={this._onChange}
              rows={5}
              style={{fontFamily: 'monospace'}}
              type='textarea'
              value={this.props.state.text} />
            {errorSection}
          </Bootstrap.Col>

          <Bootstrap.Col md={2}>
          </Bootstrap.Col>
        </Bootstrap.Row>
      </div>
    );
  },

});

module.exports = CsvSection;
