/**
* @license AGPL-3.0
* @author aAXEe (https://github.com/aAXEe)
*/
'use strict'

import React from 'react'
import ol from 'openlayers'
import ChartLayer from '../chartlayer'
import { ClickOnMarkersMessage } from 'utils'
import {TabSidebarDetails} from 'features/tabs'
import controlIds from '../../controls/ol3/controls'
import orderIds from '../layerOrderNumbers'
import mapMarker from 'components/mapMarker'
import ScubaDivingSvg from './sport-scuba_diving.svg'
import DiveCentreSvg from './amenity-dive_centre.svg'

import { featureClicked, layerTileLoadStateChange } from '../../store/actions'
import { setSidebarOpen, setSidebarActiveTab } from '../../controls/sidebar/store'

import { defineMessages } from 'react-intl'
const SimpleImageSvgStyle = require('ol-style-simpleImageSvgStyle')
const OverpassApi = require('ol-source-overpassApi')

export const messages = defineMessages({
  layerName: {
    id: 'layer-name-scuba_diving',
    defaultMessage: 'POIs for scuba diving'
  }
})

const FEATURE_CLICKED_PROPERTY_NAME = '_clicked'

module.exports = function (context, options) {
  const defaults = {
    nameKey: 'layer-name-scuba_diving',
    iconSize: 32
  }
  Object.assign(defaults, options)

  const styles = {
    sport: {
      scuba_diving: new SimpleImageSvgStyle(ScubaDivingSvg, defaults.iconSize, defaults.iconSize)
    },
    amenity: {
      dive_centre: new SimpleImageSvgStyle(DiveCentreSvg, defaults.iconSize, defaults.iconSize)
    }
  }
  const tagBasedStyle = (feature) => {
    for (const key in styles) {
      const value = feature.get(key)
      if (value !== undefined) {
        for (const regexp in styles[key]) {
          if (new RegExp(regexp).test(value)) {
            return styles[key][regexp]
          }
        }
      }
    }
  }

  const styleFunction = function (feature, resolution) {
    const clicked = feature.get(FEATURE_CLICKED_PROPERTY_NAME)

    const baseStyle = tagBasedStyle(feature)

    if (clicked) {
      return [baseStyle, mapMarker]
    }

    return baseStyle
  }

  const source = new OverpassApi('(node[sport=scuba_diving](bbox);node[amenity=dive_centre](bbox););out body qt;')
  source.on(['tileloadstart', 'tileloadend', 'tileloaderror'], function (ev) {
    context.dispatch(layerTileLoadStateChange(options.id, ev))
  })

  const layer = new ol.layer.Vector({
    source,
    style: styleFunction,
    zIndex: orderIds.user_overlay
  })

  layer.on('selectFeature', function (e) {
    const feature = e.feature
    feature.set(FEATURE_CLICKED_PROPERTY_NAME, true)
    context.dispatch(featureClicked(feature.getProperties()))
    context.dispatch(setSidebarActiveTab(TabSidebarDetails.name))
    context.dispatch(setSidebarOpen(true))
  })
  layer.on('unselectFeature', function (e) {
    e.feature.set(FEATURE_CLICKED_PROPERTY_NAME, false)
  })

  const objects = {
    layer,

    isInteractive: true,

    additionalSetup: (
      <div>
        <ClickOnMarkersMessage />
      </div>
    ),
    additionalTab: TabSidebarDetails,
    additionalControls: [controlIds.attribution]
  }

  return new ChartLayer(context, Object.assign(defaults, objects))
}
