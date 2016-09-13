# r-swipeable

A react component making its child elements swipeable.

- Snaps nearest child center to swipe-container center.
- Child x-axis centers are currently based on the first child element.

## Usage

### Swipe and drag

```javascript
import React, { Component, PropTypes } from 'react';
import Swipeable from 'r-swipeable';

function renderTestItems() {
  return [1, 2, 3, 4, 5].map(i => {
    return (
      <div
        className={`child child-${i}`}
        key={ i }
      >
        { i }
      </div>
    );
  });
}

const SwipeableComponent = () => (
  <Swipeable>
    { renderTestItems() }
  </Swipeable>
);

export default SwipeableComponent;
```

#### Example

![example-gif](http://gropio.com/stek/file/d3gzts)

### Add button navigation
To manage the swiper state from a parent component us the following structure:

```javascript
class SwipeableComponent extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.forward = this.step.bind(this, true);
    this.backward = this.step.bind(this, false);
  }

  step(forward) {
    let currentIndex = this.state.currentIndex;

    if (forward) {
      this.setState({ currentIndex: ++this.state.currentIndex });
    } else {
      this.setState({ currentIndex: --this.state.currentIndex });
    }
  }

  onChange(index) {
    // Container state if swiper is updated internally by a drag and keep indexes in sync.
    this.setState({ currentIndex: index });
  }

  render() {
    return (
      <div>
        <Swipeable
          onChange={ this.onChange }
          currentIndex={ this.state.currentIndex }
        >
          { renderTestItems() }
        </Swipeable>

        <div onClick={ this.forward }>
          { `Go to forward` }
        </div>

        <div onClick={ this.backward }>
          { `Go to backward` }
        </div>
      </div>
    );
  }
}

export default SwipeableComponent;
```

## API

### `<Swipeable>`

Wrapper component which makes its child elements swipeable.

#### Props

`children` (required) - Elements that will be wrapper (in row).

`flickSensitivity` - Limit which specifies when an actual flick gesture occurred.

`slopeLimit` - Number indicating if a swipe should be considered x-drag or y-drag. It's only possible to swipe in on direction at the time.

`className` - String used to enhance or override style.

#### Methods

`onChange(index)`

Last updated index.

```javascript
function cb(index) {
  ...
}

<Swipeable onChange={ cb }>
  ...
</Swipeable>
```
