/**
* @license AGPL-3.0
* @author aAXEe (https://github.com/aAXEe)
* @author mojoaxel (https://github.com/mojoaxel
*/
'use strict'

import React, { PropTypes } from 'react'
import ol from 'openlayers'
import { positionsEqual } from './utils'

import MetaControl from './controls/metaControl/MetaControl'
import Sidebar from './controls/sidebar/Sidebar'

import controlIds from './controls/ol3/controls'
import OL3Attribution from './controls/ol3/OL3Attribution'
import OL3Fullscreen from './controls/ol3/OL3Fullscreen'
import OL3ScaleLine from './controls/ol3/OL3ScaleLine'
import OL3Zoom from './controls/ol3/OL3Zoom'

import { alwaysOnControls } from './SETTINGS'
import { Tabs } from './features/tabs'

class Ol3Map extends React.Component {

  constructor (props) {
    super(props)

    this._controls = new Map()
  }

  componentDidMount () {
    let self = this
    var layers = []
    let interactiveLayers = []

    this.context.layers.forEach((layer) => {
      layer.layer.setVisible(!!(this.props.layerVisible[layer.id]))
      layers.push(layer.layer)

      if (layer.isInteractive) {
        interactiveLayers.push(layer.layer)
      }
    })

    var interactions = ol.interaction.defaults({
      altShiftDragRotate: false,
      pinchRotate: false
    })

    this.selector = new ol.interaction.Select({
      layers: interactiveLayers,
      toggleCondition: ol.events.condition.never,
      style: (feature, resolution) => {
        let featureStyleFunc = feature.getStyleFunction()
        if (featureStyleFunc) return featureStyleFunc(feature, resolution)
        let featureStyle = feature.getStyle()
        if (featureStyle) return featureStyle

        let layer = self.selector.getLayer(feature)
        if (!layer) return
        let layerStyleFunc = layer.getStyleFunction()
        if (layerStyleFunc) return layerStyleFunc(feature, resolution)
        return layer.getStyle()
      }
    })
    interactions.push(this.selector)

    this.hoverer = new ol.interaction.Select({
      layers: interactiveLayers,
      condition: ol.events.condition.pointerMove,
      toggleCondition: ol.events.condition.never,
      style: (feature, resolution) => {
        let featureStyleFunc = feature.getStyleFunction()
        if (featureStyleFunc) return featureStyleFunc(feature, resolution)
        let featureStyle = feature.getStyle()
        if (featureStyle) return featureStyle

        let layer = self.hoverer.getLayer(feature)
        if (!layer) return
        let layerStyleFunc = layer.getStyleFunction()
        if (layerStyleFunc) return layerStyleFunc(feature, resolution)
        return layer.getStyle()
      }
    })
    interactions.push(this.hoverer)

    this.ol3Map = new ol.Map({
      target: this._input,
      controls: [],
      layers: layers,
      interactions: interactions,
      loadTilesWhileAnimating: true,
      loadTilesWhileInteracting: true,
      view: new ol.View({
        center: ol.proj.fromLonLat([
          this.props.viewPosition.position.lon,
          this.props.viewPosition.position.lat
        ]),
        zoom: this.props.viewPosition.position.zoom
      })
    })

    let featureLayerMapSelected = {}
    this.selectFeature = (feature, layer) => {
      featureLayerMapSelected[ol.getUid(feature)] = layer

      const event = {
        type: 'selectFeature',
        feature: feature,
        layer: layer
      }
      layer.dispatchEvent(event)

      let f = this.selector.getFeatures().remove(feature)
      if (f) this.selector.getFeatures().push(f)
    }
    this.unselectFeature = (feature) => {
      let layer = featureLayerMapSelected[ol.getUid(feature)]
      if (!layer) return
      delete featureLayerMapSelected[ol.getUid(feature)]

      const event = {
        type: 'unselectFeature',
        feature: feature,
        layer: layer
      }
      layer.dispatchEvent(event)

      this.selector.getFeatures().remove(feature)
    }

    this.selector.on('select', function (e) {
      e.selected.forEach((selectedFeature) => {
        let layer = this.getLayer(selectedFeature)
        self.selectFeature(selectedFeature, layer)
      })
      e.deselected.forEach((selectedFeature) => {
        self.unselectFeature(selectedFeature)
      })
      return false
    })

    let featureLayerMapHovered = {}
    this.hoverFeature = (feature, layer) => {
      featureLayerMapHovered[ol.getUid(feature)] = layer

      const event = {
        type: 'hoverFeature',
        feature: feature,
        layer: layer
      }
      layer.dispatchEvent(event)

      let f = this.hoverer.getFeatures().remove(feature)
      if (f) this.hoverer.getFeatures().push(f)
    }
    this.unhoverFeature = (feature) => {
      let layer = featureLayerMapHovered[ol.getUid(feature)]
      if (!layer) return
      delete featureLayerMapHovered[ol.getUid(feature)]

      const event = {
        type: 'unhoverFeature',
        feature: feature,
        layer: layer
      }
      layer.dispatchEvent(event)

      this.hoverer.getFeatures().remove(feature)
    }

    this.hoverer.on('select', function (e) {
      e.selected.forEach((selectedFeature) => {
        let layer = this.getLayer(selectedFeature)
        self.hoverFeature(selectedFeature, layer)
      })
      e.deselected.forEach((selectedFeature) => {
        self.unhoverFeature(selectedFeature)
      })
      return false
    })

    /* add meta control to the map */
    this.ol3Map.addControl(new ol.control.Control({
      element: this._metaControl.getDomNode(),
      target: this.ol3Map.getTargetElement()
    }))

    this.ol3Map.on('moveend', () => {
      this.ol3Map.beforeRender()

      var centre = ol.proj.transform(this.ol3Map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326')
      let position = {
        lon: centre[0],
        lat: centre[1],
        zoom: this.ol3Map.getView().getZoom()
      }
      if (this.props.viewPosition.position && positionsEqual(position, this.props.viewPosition.position)) return
      this.props.onViewPositionChange(position)
    })

    this.updateLayerVisible(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.updateLayerVisible(nextProps)

    var centre = ol.proj.transform(this.ol3Map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326')
    let position = {
      lon: centre[0],
      lat: centre[1],
      zoom: this.ol3Map.getView().getZoom()
    }
    if (nextProps.viewPosition.position && !positionsEqual(nextProps.viewPosition.position, position)) {
      let view = this.ol3Map.getView()
      this.setupMoveAnimations()

      view.setCenter(ol.proj.fromLonLat([
        nextProps.viewPosition.position.lon,
        nextProps.viewPosition.position.lat
      ]))
      view.setZoom(nextProps.viewPosition.position.zoom)
    }

    if (nextProps.viewPosition.extent && nextProps.viewPosition.extent !== this.props.viewPosition.extent) {
      if (nextProps.viewPosition.extent && nextProps.viewPosition.extent.length === 4) {
        let mapSize = this.ol3Map.getSize()
        let width = mapSize[0]
        let height = mapSize[1]
        let options = {
          padding: [height / 4, width / 4, height / 4, width / 4],
          maxZoom: 18
        }
        this.setupMoveAnimations()
        this.ol3Map.getView().fit(nextProps.viewPosition.extent, mapSize, options)
      }
    }
  }

  addControlToMap (id, control) {
    this._controls.set(id, control)
  }

  setupMoveAnimations () {
    let view = this.ol3Map.getView()
    let start = +new Date()
    let pan = ol.animation.pan({
      duration: 1000,
      easing: ol.easing.inAndOut,
      source: view.getCenter(),
      start: start
    })
    var bounce = ol.animation.zoom({
      duration: 1000,
      easing: ol.easing.inAndOut,
      resolution: view.getResolution(),
      start: start
    })
    this.ol3Map.beforeRender(pan, bounce)
  }

  updateLayerVisible (nextProps) {
    let self = this
    let requestedControlsIds = new Set(alwaysOnControls)
    this.context.layers.forEach((layer) => {
      const layerVisibleNew = !!(nextProps.layerVisible[layer.id])
      const layerVisibleOld = layer.layer.getVisible()

      if (layerVisibleNew && layer.additionalControls) {
        layer.additionalControls.forEach((id) => {
          requestedControlsIds.add(id)
        })
      }

      if (layerVisibleOld === layerVisibleNew) return

      layer.layer.setVisible(layerVisibleNew)
      if (!layerVisibleNew && layer.isInteractive) {
        layer.layer.getSource().getFeatures().forEach((feature) => {
          self.unselectFeature(feature)
          self.unhoverFeature(feature)
        })
      }
    })

    for (var [id, control] of this._controls) {
      const map = requestedControlsIds.has(id) ? this.ol3Map : null
      control.setMap(map)
    }
  }

  render () {
    let names = new Set()
    let additionalTabs = []
    this.context.layers.forEach(layer => {
      if (!this.props.layerVisible[layer.id]) return
      if (!layer.additionalTab) return
      if (names.has(layer.additionalTab.name)) return
      additionalTabs.push(layer.additionalTab)
      names.add(layer.additionalTab.name)
    })
    return (
      <div
        className='sidebar-map'
        ref={(c) => { this._input = c }}>
        <MetaControl ref={(c) => { this._metaControl = c }}>
          <Sidebar
            id='sidebar'
            position='sidebar left'
            tabs={Tabs.concat(additionalTabs)} />
          <OL3Attribution
            id={controlIds.attribution}
            position='bottom right'
            addControlToMap={(id, c) => this.addControlToMap(id, c)} />
          <OL3Fullscreen
            id={controlIds.fullscreen}
            position='top right'
            addControlToMap={(id, c) => this.addControlToMap(id, c)} />
          <OL3Zoom
            id={controlIds.zoom}
            position='top left'
            addControlToMap={(id, c) => this.addControlToMap(id, c)} />
          <OL3ScaleLine
            id={controlIds.scaleline_metric}
            position='bottom left'
            units='metric'
            addControlToMap={(id, c) => this.addControlToMap(id, c)} />
          <OL3ScaleLine
            id={controlIds.scaleline_nautical}
            position='bottom left'
            units='nautical'
            addControlToMap={(id, c) => this.addControlToMap(id, c)} />
        </MetaControl>
      </div>
    )
  }
}

Ol3Map.propTypes = {
  layerVisible: PropTypes.objectOf(PropTypes.bool).isRequired,
  onViewPositionChange: PropTypes.func.isRequired,
  viewPosition: PropTypes.shape({
    position: PropTypes.objectOf(PropTypes.number),
    extent: PropTypes.arrayOf(PropTypes.number)
  }).isRequired
}

import { LayerType } from './config/chartlayer'

Ol3Map.contextTypes = {
  layers: PropTypes.arrayOf(LayerType)
}

export default Ol3Map
