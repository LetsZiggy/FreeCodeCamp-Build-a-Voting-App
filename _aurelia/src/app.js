import {bindable, bindingMode} from 'aurelia-framework';
import {state} from './resources/state';

export class App {
  @bindable({ defaultBindingMode: bindingMode.oneWay }) state = state;

  configureRouter(config, router) {
    this.router = router;
    config.title = 'FreeCodeCamp - Build a Voting App';
    config.map([
      {
        route: ['', 'home'],
        name: 'home',
        moduleId: './home',
        title: 'Home',
        nav: true,
      },
      {
        route: 'polls',
        name: 'polls',
        moduleId: './polls',
        title: 'Polls',
        nav: true,
      },
      {
        route: 'user',
        name: 'user',
        moduleId: './user',
        title: 'User',
        nav: true,
      },
      {
        route: 'login',
        name: 'login',
        moduleId: './login',
        title: 'Login',
        nav: false,
      },
    ]);
  }
}