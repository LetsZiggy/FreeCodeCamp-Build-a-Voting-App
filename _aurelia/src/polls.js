import {bindable, bindingMode} from 'aurelia-framework';
import {state} from './resources/state';

export class Polls {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor() {
    this.message = 'Polls';
  }
}