import autoprefixer from 'react-prefixer';

export default autoprefixer({
  swipeable: {
    height: 'auto',
    width: 'auto',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },

  animate: {
    transition: 'transform .3s'
  },

  swipeableContent: {
     willChange: 'transform, transition'
  }
});
