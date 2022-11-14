/**
* @license AGPL-3.0
* @author mojoaxel (https://github.com/mojoaxel)
*/
'use strict'

import React from 'react'
import PropTypes from 'prop-types'
import ol from 'openlayers'

class OL3Control extends React.Component {
  componentDidMount () {
    this.props.addControlToMap(this.props.id, this.getControl())
  }

  getControl () {
    return this._control ? this._control : this._createControl()
  }

  _createControl () {
    this._control = new ol.control.Control({
      target: this._element
    })
    return this._control
  }

  render () {
    return (
      <div className={this.props.className}
        ref={(c) => { this._element = c }} />
    )
  }
}
OL3Control.propTypes = {
  addControlToMap: PropTypes.func.isRequired,
  className: PropTypes.string,
  id: PropTypes.string.isRequired,
  position: PropTypes.string.isRequired
}

export default OL3Control
