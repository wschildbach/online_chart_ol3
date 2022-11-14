/**
* @license AGPL-3.0
* @author aAXEe (https://github.com/aAXEe)
*/
import React from 'react'
import PropTypes from 'prop-types'

var CircleProgressBar = require('rc-progress').Circle
const progressScale = 100

const LayerProgressBar = ({ loadState, enabled }) => {
  let progress = progressScale
  if (enabled && loadState.loading) {
    progress = loadState.loaded / loadState.loading * progressScale
  }

  const circleContainerStyle = {
    width: '24px',
    height: '24px',
    float: 'right',
    marginTop: '3px'
  }
  let colors = {
    active: '#3FC7FA',
    inactive: '#c9c9c9',
    success: '#85D262',
    error: '#fc2024'
  }
  let color = colors.success
  if (progress < progressScale) color = colors.active
  if (loadState.lastError) color = colors.error
  if (!enabled) color = colors.inactive

  return (
    <div style={circleContainerStyle}>
      <CircleProgressBar
        percent={progress}
        strokeColor={color}
        strokeWidth='25' />
    </div>
  )
}

LayerProgressBar.propTypes = {
  enabled: PropTypes.bool,
  loadState: PropTypes.shape({
    lastError: PropTypes.string,
    loading: PropTypes.number,
    loaded: PropTypes.number
  }).isRequired
}
export default LayerProgressBar
