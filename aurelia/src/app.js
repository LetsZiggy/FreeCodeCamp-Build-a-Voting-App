import {bindable, bindingMode} from 'aurelia-framework';
import {state} from './resources/state';

export class App {
  @bindable({ defaultBindingMode: bindingMode.oneWay }) state = state;

  configureRouter(config, router) {
    this.router = router;
    config.title = 'FreeCodeCamp - Build a Voting App';
    config.map([
      {
        route: '',
        redirect: 'home'
      },
      {
        route: 'home',
        name: 'home',
        moduleId: './resources/modules/home',
        title: 'Home',
        nav: true,
      },
      {
        route: 'polls',
        name: 'polls',
        moduleId: './resources/modules/polls',
        title: 'Polls',
        nav: true,
      },
      {
        route: 'poll/:id',
        name: 'poll',
        moduleId: './resources/modules/poll',
        title: '',
        nav: false,
      },
      {
        route: 'user',
        name: 'user',
        moduleId: './resources/modules/user',
        title: 'User',
        nav: true,
      },
      {
        route: 'login',
        name: 'login',
        moduleId: './resources/modules/login',
        title: 'Login',
        nav: true,
      },
    ]);
  }
}