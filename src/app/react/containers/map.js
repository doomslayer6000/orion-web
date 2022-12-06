import MapRoot from 'app/react/components/map';
import { setViewport } from 'app/redux/actions/map';
import {
  LOCATION_DISPLAY_TYPE_DOTS, LOCATION_DISPLAY_TYPE_HEATMAP, LOCATION_DISPLAY_TYPE_PATH
} from 'app/redux/reducers/options';
import { easeCubic } from 'd3-ease';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { FlyToInterpolator } from 'react-map-gl';
import { connect } from 'react-redux';
import LocationParser from 'vis/location-parser';

/**
 * Wrapper over the primary map component to abstract out logic of translating the location data
 * into visualization layers.
 */
class MapContainer extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    accuracyThreshold: PropTypes.number.isRequired,
    locationDisplayType: PropTypes.oneOf([
      LOCATION_DISPLAY_TYPE_DOTS,
      LOCATION_DISPLAY_TYPE_PATH,
      LOCATION_DISPLAY_TYPE_HEATMAP,
    ]).isRequired,
    viewport: PropTypes.object.isRequired,
    handleViewportChange: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  };

  state = { annotation: null };

  componentWillReceiveProps({ data: nextData, accuracyThreshold: nextAccuracyThreshold }) {
    const { data, accuracyThreshold } = this.props;

    if (data !== nextData || accuracyThreshold !== nextAccuracyThreshold) {
      this.locationParser = new LocationParser(
        nextData,
        nextAccuracyThreshold,
        this.handlePickHover,
      );
    }
  }

  locationParser = new LocationParser();

  handlePickHover = (annotation) => this.setState({ annotation });

  handleWebGLInitialized = (gl) => {
    // Enable additive blending on deck.gl overlay elements
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE);
    gl.blendEquation(gl.FUNC_ADD);
  };

  render() {
    const {
      locationDisplayType,
      viewport,
      handleViewportChange,
      // Window dimensions props
      width,
      height,
    } = this.props;
    const { annotation } = this.state;

    // Changes in viewport may require re-rendering the map layers. Evaluating this here would cause
    // the layer to remain static despite changes in viewport. Instead, we'll delay evaluation by
    // passing through a thunk that is evaluated on every render within the map root.
    const layersThunk = () => {
      if (LOCATION_DISPLAY_TYPE_DOTS === locationDisplayType) {
        return [this.locationParser.getScatterplotLayer()]
      } else if (LOCATION_DISPLAY_TYPE_PATH === locationDisplayType) {
        return [this.locationParser.getLineLayer()]
      } else if (LOCATION_DISPLAY_TYPE_HEATMAP === locationDisplayType) {
        return [() => this.locationParser.getScreenGridLayer()]
      } else {
        console.warn("Unknown location display type: " + locationDisplayType)
        return []
      }
    };

    return (
      <div style={{ position: 'absolute' }}>
        <MapRoot
          viewport={{
            ...viewport,
            width,
            height,
            transitionInterpolator: new FlyToInterpolator(),
            transitionEasing: easeCubic,
          }}
          annotation={annotation}
          layersThunk={layersThunk}
          onViewportChange={handleViewportChange}
          onWebGLInitialized={this.handleWebGLInitialized}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ context, location, filters, options, map }) => ({
  width: context.width,
  height: context.height,
  data: location.data,
  accuracyThreshold: filters.accuracyThreshold,
  locationDisplayType: options.locationDisplayType,
  viewport: map.viewport,
});

const mapDispatchToProps = (dispatch) => ({
  handleViewportChange: (viewport) => dispatch(setViewport(viewport)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MapContainer);
