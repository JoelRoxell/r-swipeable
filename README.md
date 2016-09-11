# r-swipeable
A react component making its child elements swipeable.

- Snaps nearest child center to swipe-container center.
- Child x-axis centers are currently based on the first child element.

## Usage

### Swipe and drag
```js
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

### Swipe drag and button navigation
```js
class SwipeableComponent extends Component {
  constructor(props) {
    super(props);

    this.setSwipeNode = this.setSwipeNode.bind(this);
    this.forward = this.step.bind(this, true);
    this.backward = this.step.bind(this, false);
  }

  step(forwards) {
    let currentIndex = this.swiper.state.currentCenteredChildIndex;

    forwards === true ?
      this.swiper.positionViewByChildIndex(++currentIndex):
      this.swiper.positionViewByChildIndex(--currentIndex);
  }

  setSwipeNode(node) {
    this.swiper = node;
  }

  render() {
    return (
      <div>
        <Swipeable ref={ this.setSwipeNode }>
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
`positionViewByChildIndex(targetIndex)`

Moves `targetIndex` index to viewport center.
```js
function goTo(index) {
  swiper.positionViewByChildIndex(index):
}
```
