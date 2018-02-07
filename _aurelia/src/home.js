import {bindable, bindingMode} from 'aurelia-framework';
import {state} from './resources/state';

export class Home {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor() {
    this.message = 'Home';
  }
}