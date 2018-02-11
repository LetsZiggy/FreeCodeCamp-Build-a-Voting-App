import {bindable, bindingMode} from 'aurelia-framework';
import {state} from '../state';

export class Home {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  attached() {
  }
}