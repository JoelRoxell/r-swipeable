import React, { Component, PropTypes } from 'react';
import autoprefixer from 'react-prefixer';
import styles from './style';

class Swipeable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contentPos: 0,
      dragging: false,
      clientX: 0,
      oldClientX: 0,
      clientStartX: 0,
      clientEndX: 0,
      direction: null,
      timeFromStart: 0
    };

    this.onDown = this.onDown.bind(this);
    this.onUp = this.onUp.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.onMove = this.onMove.bind(this);
    this.setViewportNode = this.setViewportNode.bind(this);
    this.setContentNode = this.setContentNode.bind(this);
    this.animateDrag = this.animateDrag.bind(this);
  }

  componentDidMount() {
    this.updateViewMetrics();
    requestAnimationFrame(this.animateDrag);

    let contentCenterChildIndex = Math.floor(this.childXCenterPosList.length / 2);

    if (!isNaN(this.props.currentIndex)) {
      contentCenterChildIndex = this.props.currentIndex;
    }

    this.setState({
      contentPos: this.viewportCenter - this.childXCenterPosList[contentCenterChildIndex].clientXCenter,
      currentCenteredChildIndex: contentCenterChildIndex
    });
  }

  componentWillReceiveProps(nProps) {
    // Index state was changed in a component higher up.
    if (this.props.currentIndex !== nProps.currentIndex) {
      this.positionViewByChildIndex(nProps.currentIndex);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.updateViewMetrics();

    if (prevState.currentCenteredChildIndex === this.state.currentCenteredChildIndex) {
      return;
    }

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(this.state.currentCenteredChildIndex);
    }
  }

  shouldComponentUpdate(nProp, nState) {
    return true;
  }

  componentWillUnmount() {
    this.cancelAnimationFrame = true;
  }

  /**
   * Update components properties to keep track of the DOM elements metrics used when swiping.
   */
  updateViewMetrics() {
    this.leftLimit = 0;
    this.viewportWidth = this.viewport.offsetWidth;
    this.viewportCenter = this.viewportWidth / 2;
    this.rightLimit = this.viewportWidth - this.content.offsetWidth;

    // If last child is lesser than the viewport, allow it to be dragged a bit further.
    if (this.content.childNodes[0].offsetWidth < this.viewportWidth) {
      const slack = this.viewportWidth / 2;

      this.leftLimit = slack;
      this.rightLimit = (this.viewportWidth - this.content.offsetWidth) - slack;
    }

    this.determineChildrensMainAxisCenter();
  }

  /**
   * Calculate the center position for `content` children.
   */
  determineChildrensMainAxisCenter() {
    if (!this.content.childNodes.length) {
      throw new Error('Child `node`(s) must be passed to the swipeable component.');
    }

    const childCount = this.content.childNodes.length;

    let childXCenterPosList = [];

    this.childLength = this.content.offsetWidth / childCount;

    // Determine center x cordinate of each child.
    for (let i = 0, childStartXCoordinate = 0; i < childCount; i++) {
      let clientXCenter,
        childCenter,
        currentChild;

      currentChild = this.content.childNodes[i];
      childCenter = currentChild.offsetWidth / 2;
      clientXCenter = childStartXCoordinate + childCenter;
      childStartXCoordinate += currentChild.offsetWidth;

      childXCenterPosList.push({
        node: currentChild,
        clientXCenter
      });
    }

    this.childXCenterPosList = childXCenterPosList;
  }

  /**
   * Position nearest `content` child in `viewport` center.
   */
  repositionToClosestChildCenter() {
    const nearestChild = this.getClosestViewportChild();

    this.setState({
      contentPos: this.viewportCenter - nearestChild.clientXCenter,
      currentCenteredChildIndex: this.childXCenterPosList.indexOf(nearestChild)
    });
  }

  /**
   * Finds the nearset child relative to `viewportCenter`.
   *
   * @return most centered child element in `content`.
   */
  getClosestViewportChild() {
    // Get content center cordinate relative to viewport.
    const realativeContentCenterPos = this.viewportCenter - this.state.contentPos;

    const findClosestChild = function(preChild, curChild) {
      const prePos = preChild.clientXCenter,
        curPos = curChild.clientXCenter;

      return (Math.abs(realativeContentCenterPos - curPos) > Math.abs(realativeContentCenterPos - prePos))
        ? preChild : curChild;
    };

    return this.childXCenterPosList.reduce(findClosestChild);
  }

  /**
   * Calcualtes the drag velocity from start until end.
   *
   * @return Number pixels traveld by ms.
   */
  getDragVelocity() {
    const { clientStartX, clientEndX, timeFromStart } = this.state,
      timeTraveled =  Date.now() - timeFromStart;

    return Math.abs(clientEndX - clientStartX) / timeTraveled;
  }

  /**
   * Position view by child index.
   */
  positionViewByChildIndex(targetIndex) {
    // Limit targetIndex bounds.
    if (targetIndex < 0 ) {
      targetIndex = 0;
    } else if (targetIndex === this.childXCenterPosList.length) {
      targetIndex = this.childXCenterPosList.length - 1;
    }

    this.setState({
      contentPos: this.viewportCenter - this.childXCenterPosList[targetIndex].clientXCenter,
      currentCenteredChildIndex: targetIndex
    });
  }

  onDown(e) {
    let newCordinates = {};

    if (e.type === 'touchstart') {

        newCordinates = {
          clientX: e.touches[0].clientX,
          oldClientX: e.touches[0].clientX,
          clientStartX: e.touches[0].clientX,
          clientY: e.touches[0].clientY,
          oldClientY: e.touches[0].clientY
        };
    } else {
      newCordinates = {
        clientX: e.clientX,
        oldClientX: e.clientX,
        clientStartX: e.clientX
      };
    }

    this.setState({
      ...newCordinates,
      dragging: true,
      timeFromStart: Date.now()
    });
  }

  onMove(e) {
    if (!this.state.dragging) {
      return;
    }

    let nextState,
      clientX,
      clientY;

    if(e.type === 'touchmove') {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;

      const { oldClientY, oldClientX } = this.state;

      // Compute inclination and decide if x-drag should be ignored.
      if (oldClientX && oldClientY) {
        const k = (oldClientY - clientY) / ( oldClientX - clientX),
          slopeDegree = Math.atan(k) * (180 / Math.PI);

          if (Math.abs(slopeDegree) > this.props.slopeLimit) {
            this.setState({
              oldClientY: clientY,
              oldClientX: clientX
            });

            return;
          }
      }
    } else {
      clientX = e.clientX;
    }

    e.preventDefault();

    const distance = clientX - this.state.oldClientX,
      direction = distance > 0 ? Swipeable.RIGHT : Swipeable.LEFT;

    nextState = {
      oldClientX: clientX,
      oldClientY: clientY,
      direction
    };

    // Check that drag doesn't exceeds view limitations,
    // if so limit to specified right/left limits.
    if (this.state.contentPos >= this.leftLimit && direction === Swipeable.RIGHT) {
      nextState.contentPos = this.leftLimit;
    } else if (this.state.contentPos <= this.rightLimit && direction === Swipeable.LEFT) {
      nextState.contentPos = this.rightLimit;
    } else {
      nextState.contentPos = this.state.contentPos + distance;
    }

    this.setState(nextState);
  }

  onUp(e) {
    let clientEndX = (e.type === 'touchend') ?
      clientEndX = this.state.oldClientX : clientEndX = e.clientX;

    this.setState({
      dragging: false,
      clientEndX
    }, this.handleUp);
  }

  handleUp() {
    let currentChildIndex = this.state.currentCenteredChildIndex;

    const distance = this.state.clientEndX - this.state.clientStartX;

    if (distance === 0) {
      return;
    }

    let nextTarget = this.state.direction === Swipeable.LEFT ? ++currentChildIndex : --currentChildIndex;

    if (nextTarget < 0 ) {
      nextTarget = 0;
    } else if (nextTarget === this.childXCenterPosList.length) {
      nextTarget = this.childXCenterPosList.length - 1;
    }

    if (
      this.getDragVelocity() > this.props.flickSensitivity &&
      Math.abs(distance) <= this.content.childNodes[0].offsetWidth
    ) {
        this.positionViewByChildIndex(nextTarget);
    } else {
      this.repositionToClosestChildCenter();
    }
  }

  onLeave() {
    this.setState({ dragging: false }, this.repositionToClosestChildCenter());
  }

  animateDrag() {
    const translateStr = `translate3d(${this.state.contentPos}px, 0, 0)`,
      style = {
        transform: translateStr
      },
      prefixStyles = autoprefixer(style);

    for (let prefix in prefixStyles) {
      if (prefixStyles.hasOwnProperty(prefix)) {
        this.content.style[prefix] = prefixStyles[prefix];
      }
    }

    let rafId = requestAnimationFrame(this.animateDrag);

    if (this.cancelAnimationFrame) {
      cancelAnimationFrame(rafId);
    }
  }

  setViewportNode(node) {
    this.viewport = node;
  }

  setContentNode(node) {
    this.content = node;
  }

  setStyle() {
    let style = styles.swipeableContent;

    if (!this.state.dragging) {
      style = {
        ...style,
        ...styles.animate
      }
    }

    return style;
  }

  render() {
    return (
      <div
        style={ styles.swipeable }
        ref={ this.setViewportNode }
        onMouseDown={ this.onDown }
        onMouseMove={ this.onMove }
        onMouseUp={ this.onUp }
        onMouseLeave={ this.onLeave }
        onTouchStart={ this.onDown }
        onTouchMove={ this.onMove }
        onTouchEnd={ this.onUp }
        onTouchCancel={ this.onLeave }
      >
        <div
          style={ this.setStyle() }
          ref={ this.setContentNode }
        >
          { this.props.children }
        </div>
      </div>
    );
  }
}

Swipeable.LEFT = 'LEFT';
Swipeable.RIGHT = 'RIGHT';
Swipeable.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element).isRequired,
  className: PropTypes.string,
  flickSensitivity: PropTypes.number,
  slopeLimit: PropTypes.number
};
Swipeable.defaultProps = {
  flickSensitivity: 0.3,
  slopeLimit: 45
};

export default Swipeable;
