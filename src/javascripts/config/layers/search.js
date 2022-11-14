/**
 * @license AGPL-3.0
 * @author aAXEe (https://github.com/aAXEe)
 */
'use strict'

import React from 'react'
import _ from 'lodash'

import SearchTabComponent from 'features/search/searchTab'
import SearchBar from 'features/search/searchBar'
import MdSearch from 'react-icons/lib/md/search'
import mapMarker from 'components/mapMarker'
import orderIds from '../layerOrderNumbers'

import ol from 'openlayers'
import ChartLayer from '../chartlayer'

import {
  layerTileLoadStateChange,
  searchResultHovered,
  searchResultUnhover,
  searchResultClicked
} from '../../store/actions'

import {
    setSidebarOpen,
    setSidebarActiveTab
} from '../../controls/sidebar/store'
import {
    SEARCH_STATE_ERROR,
    SEARCH_STATE_RUNNING,
    SEARCH_STATE_COMPLETE
} from 'store/reducers'

import { setViewPosition } from 'store/actions'

import { defineMessages } from 'react-intl'
export const messages = defineMessages({
  layerName: {
    id: 'layer-name-search',
    defaultMessage: 'Search places'
  },
  sidebarName: {
    id: 'sidebar-search',
    defaultMessage: 'Search'
  }
})

export const SearchTab = {
  name: 'sidebar-search',
  align: 'top',
  icon: < MdSearch / >,
  content: < SearchTabComponent / >
}

const FEATURE_CLICKED_PROPERTY_NAME = '_clicked'
const FEATURE_HOVERED_PROPERTY_NAME = '_hovered'

export default function (context, options) {
  const defaults = {
    nameKey: 'layer-name-search'
  }
  Object.assign(defaults, options)

  const styleFunction = function (/* resolution */) {
    const feature = this
    const labelText = feature.get('namedetails').name
    const hovered = feature.get(FEATURE_HOVERED_PROPERTY_NAME)
    const clicked = feature.get(FEATURE_CLICKED_PROPERTY_NAME)

    const styles = []

    if (labelText && (hovered || clicked)) {
      const text = new ol.style.Style({
        geometry: 'labelPoint',
        text: new ol.style.Text({
          font: 'bold 12px sans-serif',
          offsetY: 12,
          text: labelText,
          textAlign: 'center',
          textBaseline: 'top'
        })
      })
      styles.push(text)
    }

    if (clicked) {
      styles.push(mapMarker)
    } else {
      const markerCircle = new ol.style.Style({
        geometry: 'labelPoint',
        image: new ol.style.Circle({
          radius: 10,
          fill: new ol.style.Fill({
            color: 'rgba(16, 40, 68, 0.3)'
          }),
          stroke: new ol.style.Stroke({
            color: 'rgba(16, 40, 68, 1)',
            width: hovered ? 3 : 1
          })
        })
      })
      styles.push(markerCircle)
    }

    const polygonColor = clicked || hovered ? 'red' : 'blue'
    const polygonStyle = new ol.style.Style({
      geometry: 'geometry',
      stroke: new ol.style.Stroke({
        color: polygonColor,
        width: 2
      }),
      fill: new ol.style.Fill({
        color: 'rgba(0, 0, 255, 0.1)'
      })
    })
    styles.push(polygonStyle)

    return styles
  }

  const vectorSource = new ol.source.Vector({
    projection: 'EPSG:3857'
  })

  const updateMapPosition = function (feature) {
    const bound = feature.get('boundingbox')
    const topLeft = ol.proj.fromLonLat([Number(bound[2]), Number(bound[0])])
    const bottomRight = ol.proj.fromLonLat([Number(bound[3]), Number(bound[1])])
    const extent = [topLeft[0], topLeft[1], bottomRight[0], bottomRight[1]]
    context.dispatch(setViewPosition(undefined, extent))
  }

  let oldClickState = context.getState().search.clickedFeatureId
  const clickHandler = function () {
    const state = context.getState()
    if (oldClickState === state.search.clickedFeatureId) return
    oldClickState = state.search.clickedFeatureId

    const features = vectorSource.getFeatures()
    features.forEach(feature => {
      feature.set(FEATURE_CLICKED_PROPERTY_NAME, false)
    })

    if (!state.search.clickedFeatureId) return

    const clickedFeature = vectorSource.getFeatureById(state.search.clickedFeatureId)
    if (!clickedFeature) return

    clickedFeature.set(FEATURE_CLICKED_PROPERTY_NAME, true)
    updateMapPosition(clickedFeature)
  }

  let oldHoverState = context.getState().search.hoveredFeatureId
  const hoverHandler = function () {
    const state = context.getState()
    if (oldHoverState === state.search.hoveredFeatureId) return
    oldHoverState = state.search.hoveredFeatureId

    const features = vectorSource.getFeatures()
    features.forEach(feature => {
      feature.set(FEATURE_HOVERED_PROPERTY_NAME, false)
    })

    if (!state.search.hoveredFeatureId) return

    const hoveredFeature = vectorSource.getFeatureById(state.search.hoveredFeatureId)
    if (!hoveredFeature) return
    hoveredFeature.set(FEATURE_HOVERED_PROPERTY_NAME, true)
  }

  let oldSearchState = context.getState().search.state
  const searchHandler = function () {
    const state = context.getState()
    const searchState = state.search.state
    if (searchState === oldSearchState) return
    oldSearchState = searchState

    if (searchState === SEARCH_STATE_RUNNING) {
      context.dispatch(layerTileLoadStateChange(options.id, {
        type: 'tileloadstart'
      }))
    }
    if (searchState === SEARCH_STATE_COMPLETE) {
      context.dispatch(layerTileLoadStateChange(options.id, {
        type: 'tileloadend'
      }))
    }
    if (searchState === SEARCH_STATE_ERROR) {
      context.dispatch(layerTileLoadStateChange(options.id, {
        type: 'tileloaderror'
      }))
    }

    vectorSource.clear()

    if (searchState !== SEARCH_STATE_COMPLETE) return

    const results = state.search.response
    results.forEach((res) => {
      const geoJson = res.geojson
      const geom = new ol.format.GeoJSON().readGeometry(geoJson, { featureProjection: 'EPSG:3857' })
      const labelCoords = ol.proj.fromLonLat([Number(res.lon), Number(res.lat)])

      const featureProps = _.omit(res, ['geojson'])
      featureProps.geometry = geom
      featureProps.labelPoint = new ol.geom.Point(labelCoords)

      const feature = new ol.Feature(featureProps)
      feature.setStyle(styleFunction)
      feature.setId(res.place_id)
      vectorSource.addFeature(feature)
    })
    if (results.length > 0) {
      context.dispatch(setViewPosition(undefined, vectorSource.getExtent()))
    }
  }
  const storeChangeHandler = function () {
    searchHandler()
    hoverHandler()
    clickHandler()
  }
  context.subscribe(storeChangeHandler)

  const layer = new ol.layer.Vector({
    source: vectorSource,
    zIndex: orderIds.user_over_all
  })

  layer.on('selectFeature', function (e) {
    const feature = e.feature
    context.dispatch(searchResultClicked(feature.getId()))
    context.dispatch(setSidebarActiveTab(SearchTab.name))
    context.dispatch(setSidebarOpen(true))
  })
  layer.on('unselectFeature', function (e) {
    e.feature.set(FEATURE_CLICKED_PROPERTY_NAME, false)
  })

  layer.on('hoverFeature', function (e) {
    const feature = e.feature
    context.dispatch(searchResultHovered(feature.getId()))
  })
  layer.on('unhoverFeature', function () {
    context.dispatch(searchResultUnhover())
  })

  const objects = {
    layer,
    isInteractive: true,
    additionalSetup: (
      <div>
        <SearchBar / >
      </div>
      ),
    additionalTab: SearchTab
  }

  return new ChartLayer(context, Object.assign(defaults, objects))
}
