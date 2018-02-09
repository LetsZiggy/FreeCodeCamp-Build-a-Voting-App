import {bindable, bindingMode} from 'aurelia-framework';
import {state} from '../state';

export class Polls {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor() {
    this.message = 'Polls';
  }
}