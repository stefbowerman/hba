import BaseView from './base';
import ImageCampaignSection from '../sections/imageCampaign';

export default class IndexView extends BaseView {
  constructor($el, type) {
    super($el, type);

    this.sectionManager.register('image-campaign', ImageCampaignSection);
  }
}
