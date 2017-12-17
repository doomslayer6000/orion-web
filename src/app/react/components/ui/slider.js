import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { colors, Spacing, Text } from 'react-elemental';
import Dot from 'app/react/components/ui/dot';
import { clip } from 'app/util/number';

// Default diameter (in pixels) of the slider dot.
const DOT_DIAMETER = 14;

/**
 * Component for a mouse-interactive slider of numerical values.
 */
export default class Slider extends Component {
  static propTypes = {
    // The desired width (in pixels) of the slider.
    width: PropTypes.number.isRequired,
    // The minimum value possible on the slider (left end).
    min: PropTypes.number.isRequired,
    // The maximum value possible on the slider (right end).
    max: PropTypes.number.isRequired,
    // The current value on the slider. This is a controlled component, so this prop is required.
    value: PropTypes.number.isRequired,
    // Callback function invoked with a single numerical argument, describing the new value on the
    // slider, whenever its value is changed by mouse movement. This is a controlled component, so
    // this prop is required.
    onChange: PropTypes.func,
    // Optional unary function describing how input numerical values should be formatted as text for
    // display on the slider.
    formatter: PropTypes.func,
  };

  static defaultProps = {
    formatter: (val) => val,
    onChange: () => {},
  };

  state = { isDragging: false };

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    // The relative horizontal coordinate of the slider dot changes when the window resizes.
    if (this.ref) {
      this.initialOffset = this.ref.getBoundingClientRect().left;
    }
  };

  setRef = (ref) => {
    // Immediately after the component initially mounts, calculate its own horizontal distance to
    // the boundary of the parent container. This value serves as a baseline for interpreting future
    // positions of events triggered by a mousemove on the Slider container.
    this.ref = ref;
    this.onResize();
  };

  handleMouseMove = (evt) => {
    const { width, min, max, onChange } = this.props;
    const { isDragging } = this.state;

    if (isDragging) {
      const offset = evt.clientX - this.initialOffset;
      const percentage = offset / (width - DOT_DIAMETER);

      // Reject values caused by dragging the mouse too far to the left or right of the slider
      // boundary.
      if (percentage >= 0 && percentage <= 1) {
        onChange(min + (percentage * (max - min)));
      }
    }
  };

  handleClickStateChange = (isDragging) => () => this.setState({ isDragging });

  render() {
    const { width, min, max, value, formatter } = this.props;
    const { isDragging } = this.state;

    const normalizedValue = clip(min, max)(value);
    const offset = ((normalizedValue - min) / (max - min)) * (width - DOT_DIAMETER);

    return (
      <div
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleClickStateChange(false)}
        onMouseLeave={this.handleClickStateChange(false)}
        style={{ display: 'inline-block' }}
        ref={this.setRef}
      >
        <div style={{ left: `${-DOT_DIAMETER / 2}px`, position: 'relative' }}>
          <Spacing size="micro" bottom>
            <Text
              size="kilo"
              color="primary"
              style={{
                display: 'inline-block',
                left: `${offset}px`,
                opacity: isDragging ? 1 : 0,
                position: 'relative',
                transition: 'opacity 0.15s ease',
              }}
              bold
            >
              {formatter(value)}
            </Text>
          </Spacing>

          <div
            style={{
              backgroundColor: colors.gray20,
              height: '1px',
              left: `${DOT_DIAMETER / 2}px`,
              position: 'relative',
              top: `${DOT_DIAMETER / 2}px`,
              width: `${width - DOT_DIAMETER}px`,
            }}
          />

          <Dot
            isDragging={isDragging}
            offset={offset}
            size={DOT_DIAMETER}
            onMouseDown={this.handleClickStateChange(true)}
          />
        </div>

        <Spacing size="tiny" top style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text size="kilo" color="gray60" style={{ alignSelf: 'flex-start' }}>
            {formatter(min)}
          </Text>
          <Text size="kilo" color="gray60" style={{ alignSelf: 'flex-end' }}>
            {formatter(max)}
          </Text>
        </Spacing>
      </div>
    );
  }
}
