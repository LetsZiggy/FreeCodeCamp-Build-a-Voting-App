import {bindable, bindingMode} from 'aurelia-framework';
import {state} from './resources/services/state';

export class App {
  @bindable({ defaultBindingMode: bindingMode.oneWay }) state = state;

  attached() {
    let data = JSON.parse(localStorage.getItem("freecodecamp-build-a-voting-app")) || null;

    if(data && data.expire > Date.now()) {
      this.state.user = data.user;
      this.state.expire = data.expire;
    }
  }

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