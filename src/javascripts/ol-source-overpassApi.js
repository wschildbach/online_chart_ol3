/**
* @license AGPL-3.0
* @author aAXEe (https://github.com/aAXEe)
*/
'use strict'
const ol = require('openlayers')
const $ = require('jquery')

module.exports = function (query) {
  const vectorSource = new ol.source.Vector({
    format: new ol.format.OSMXML(),
    loader: function (extent, resolution, projection) {
      const epsg4326Extent = ol.proj.transformExtent(extent, projection, 'EPSG:4326')
      const baseUrl = '//overpass-api.de/api/interpreter?'
      const queryComplete = 'data=' + encodeURIComponent(query) + '&bbox=' + epsg4326Extent.join(',')
      const url = baseUrl + queryComplete

      $.ajax({
        url,
        success: function (data) {
          const format = this.getFormat()
          const features = format.readFeatures(data, { featureProjection: projection })
          this.addFeatures(features)
          this.dispatchEvent({ type: 'tileloadend', target: this })
        },
        error: function (jqXHR, textStatus, errorThrown) {
          this.dispatchEvent({
            type: 'tileloaderror',
            target: this,
            textStatus,
            errorThrown
          })
        },
        context: this
      })
      this.dispatchEvent({ type: 'tileloadstart', target: this })
    },
    strategy: ol.loadingstrategy.bbox
  })
  return vectorSource
}
