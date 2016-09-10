'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactPrefixer = require('react-prefixer');

var _reactPrefixer2 = _interopRequireDefault(_reactPrefixer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _reactPrefixer2.default)({
  swipeable: {
    display: 'flex',
    width: '100%',
    overflow: 'hidden'
  },

  animate: {
    transition: 'transform .3s'
  },

  swipeableContent: {
    willChange: 'transform, transition',
    display: 'flex',
    flexDirection: 'row',
    flexShrink: '0'
  }
});