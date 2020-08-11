import BaseZoomController from './base';

const classes = {
  zoomReady: 'is-zoomable',
  zoomedIn: 'is-zoomed'
};

export default class DesktopZoomController extends BaseZoomController {
  constructor($el, options) {
    super($el, options);
  }

  initHoverZoom($el) {
    if (!this.enabled) return;

    this.destroyHoverZoom($el);

    const $link = $el.find('a');

    // Prevents us from following the link while the zoom image loads
    $link.on('click', (e) => {
      e.preventDefault();
      return false;
    });     

    $el.zoom({
      url: $link.attr('href'),
      on: 'click',
      touch: false,
      escToClose: true,
      magnify: 1.2,
      duration: 0,
      callback: () => {
        $el.addClass(classes.zoomReady);
      },
      onZoomIn: () => {
        $el.addClass(classes.zoomedIn);
      },
      onZoomOut: () => {
        $el.removeClass(classes.zoomedIn);
      }
    });
  }

  destroyHoverZoom($el) {
    $el.trigger('zoom.destroy');
  }
}
