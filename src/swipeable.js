import React, { Component, PropTypes } from 'react';
import { Motion, spring, presets } from 'react-motion';

import prefixAll from 'inline-style-prefixer/static';
import styles from './style';

class Swipeable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contentPos: 0,
      dragging: false,
      timeFromStart: 0,
      direction: null,
      clientX: 0,
      oldClientX: 0,
      clientStartX: 0,
      clientEndX: 0,
      clientY: 0,
      oldClientY: 0,
      leftLimit: 0,
      rightLimit: 0,
      viewportWidth: 0,
      viewportCenter: 0,
      totalWidth: 0,
      slack: 0,
      currentCenteredChildIndex: 0
    };

    this.onDown = this.onDown.bind(this);
    this.onUp = this.onUp.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.onMove = this.onMove.bind(this);
    this.setViewportNode = this.setViewportNode.bind(this);
    this.setContentNode = this.setContentNode.bind(this);
    this.determineChildrensMainAxisCenter = this.determineChildrensMainAxisCenter.bind(this);
  }

  componentDidMount() {
    this.updateViewMetrics().then(() => {
      let contentCenterChildIndex = Math.floor(this.childXCenterPosList.length / 2);

      // Center by props index or select the "most" centered child.
      if (!isNaN(this.props.currentIndex)) {
        contentCenterChildIndex = this.props.currentIndex;
      }

      const contentPos = this.state.viewportCenter - this.childXCenterPosList[contentCenterChildIndex].clientXCenter;

      this.setState({
        contentPos,
        currentCenteredChildIndex: contentCenterChildIndex
      });

      this.applyDisplayRuleToChildNodes();
    });
  }

  componentWillReceiveProps(nProps) {
    // Index state was changed by a component containing the `Swipeable`.
    if (this.props.currentIndex !== nProps.currentIndex) {
      this.positionViewByChildIndex(nProps.currentIndex);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.childXCenterPosList) {
      return;
    }

    const currentIndex = this.props.currentIndex,
      childLimitLength = this.childXCenterPosList.length - 1;

    // Prevent external index management to step out of bounds.
    if (currentIndex < 0) {
      this.props.onChange(0);
    } else if (currentIndex > childLimitLength) {
      this.props.onChange(childLimitLength);
    }

    if (prevState.currentCenteredChildIndex === this.state.currentCenteredChildIndex) {
      return;
    }

    // Trigger `onChange` cb if it's defined.
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(this.state.currentCenteredChildIndex);
    }
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

    const childCenter = this.state.childWidth / 2;

    // Determine center x cordinate of each child.
    for (let i = 0, childStartXCoordinate = 0; i < childCount; i++) {
      let clientXCenter;
      let currentChild;

      currentChild = this.content.childNodes[i];
      clientXCenter = childStartXCoordinate + childCenter;
      childStartXCoordinate += this.state.childWidth;

      childXCenterPosList.push({
        node: currentChild,
        clientXCenter
      });
    }

    this.childXCenterPosList = childXCenterPosList;
  }

  /**
   * Update components properties to keep track of the DOM elements metrics used when swiping.
   */
  updateViewMetrics() {
    return new Promise((resolve, reject) => {
      requestAnimationFrame(() => {
        const childWidth = this.content.children[0].offsetWidth;
        const contentWidth = this.content.childWidth;
        const viewportWidth = this.viewport.offsetWidth;
        const viewportCenter = viewportWidth / 2;
        const slack = viewportWidth / 2;
        const leftLimit = slack;
        const totalWidth = - (childWidth * this.content.children.length);
        const rightLimit = totalWidth + slack;

        this.setState({
          childWidth,
          viewportWidth,
          viewportCenter,
          leftLimit,
          rightLimit,
          totalWidth,
          slack,
          contentWidth
        }, () => {
          this.determineChildrensMainAxisCenter()
          resolve();
        });
      });
    });
  }

  /**
   * Finds the nearset child relative to `viewportCenter`.
   *
   * @return most centered child element in `content`.
   */
  getClosestViewportChild() {
    // Get content center cordinate relative to viewport.
    const realativeContentCenterPos = this.state.viewportCenter - this.state.contentPos;

    const findClosestChild = function(preChild, curChild) {
      const prePos = preChild.clientXCenter,
        curPos = curChild.clientXCenter;

      return (Math.abs(realativeContentCenterPos - curPos) > Math.abs(realativeContentCenterPos - prePos))
        ? preChild : curChild;
    };

    return this.childXCenterPosList.reduce(findClosestChild);
  }

  /**
   * Position nearest `content` child in `viewport` center.
   */
  repositionToClosestChildCenter() {
    const nearestChild = this.getClosestViewportChild();
    console.log('closest', this.state.viewportCenter - nearestChild.clientXCenter);
    this.setState({
      contentPos: this.state.viewportCenter - nearestChild.clientXCenter,
      currentCenteredChildIndex: this.childXCenterPosList.indexOf(nearestChild)
    });
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
      contentPos: this.state.viewportCenter - this.childXCenterPosList[targetIndex].clientXCenter,
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

    if (nextTarget < 0) {
      nextTarget = 0;
    } else if (nextTarget === this.childXCenterPosList.length) {
      nextTarget = this.childXCenterPosList.length - 1;
    }

    // If velocity of a swipe is greater than the specified flick sensitivity
    // and the drag ditance is lesser or equal to the first child width.
    // A flick gesture has been initiated.
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

  setViewportNode(node) {
    this.viewport = node;
  }

  setContentNode(node) {
    this.content = node;
  }

  /**
   * This adds 'display: inline-block' to all childnodes to spare users the
   * trouble of doing it manually and, also, prevent them from setting it to
   * anything else
   */
  applyDisplayRuleToChildNodes() {
    for (let i = 0; i < this.content.childNodes.length; i++) {
      this.content.childNodes[i].style.display = 'inline-block';
    }
  }

  setStyle({ pos }) {
    let style = styles.swipeableContent;

    const translateStr = `translate3d(${pos}px, 0, 0)`;

    return {
      ...style,
      transform: translateStr
    };
  }

  render() {
    const { siffness, damping } = this.props;
    const { dragging, contentPos } = this.state;
    let style;

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
      { (() => {
        if (dragging) {
          style = {
            translateX: contentPos
          }
        } else {
          style = {
            translateX: spring(contentPos, {
              siffness,
              damping
            })
          }
        }

        return (
          <Motion
            defaultStyle={ {translateX: 0} }
            style={ style }
          >
            { ({ translateX }) => (
              <div
                style={ {
                  display: 'flex',
                  transform: `translate3d(${translateX}px, 0px, 0)`
                } }
                ref={ this.setContentNode }
              >
                { this.props.children }
              </div>
            ) }
          </Motion>
        );
      })() }
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
  slopeLimit: 45,
  stiffness: 120,
  damping: 14
};

export default Swipeable;
