/**
* @license AGPL-3.0
* @author mojoaxel (https://github.com/mojoaxel)
*/
'use strict'
import React from 'react'
import PropTypes from 'prop-types'

import ReactToggle from 'react-toggle'
import 'react-toggle/style.css'
import './Toggle.scss'

class OsmToggle extends React.Component {
  constructor (props) {
    super(props)
    this._onChange = this._onChange.bind(this)
  }

  _onChange (event) {
    this.props.onChange(event.target.checked)
  }

  render () {
    const toggleId = 'toggle_' + this.props.layerId + (this.props.checked ? '_checked' : '_unchecked')
    return (
      <div className='toggle'>
        <ReactToggle
          checked={this.props.checked}
          id={toggleId}
          onChange={this._onChange} />
        <label
          className='toggle-label'
          htmlFor={toggleId}>
          {this.props.label}
        </label>
        {this.props.children}
      </div>
    )
  }
}

OsmToggle.propTypes = {
  checked: PropTypes.bool.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  label: PropTypes.node.isRequired,
  layerId: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export default OsmToggle
