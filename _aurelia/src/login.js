import {bindable, bindingMode} from 'aurelia-framework';
import {state} from './resources/state';

export class Login {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor() {
    this.message = 'Login';
  }
}

