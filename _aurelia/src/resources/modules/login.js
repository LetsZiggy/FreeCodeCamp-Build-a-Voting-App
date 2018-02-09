import {inject, bindable, bindingMode} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {state} from '../state';

@inject(Router)
export class Login {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(Router) {
    this.router = Router;
    this.message = 'Login';
  }

  canActivate() {
    if(this.state.login) {
      // handle logout process
      this.state.login = null;
      document.getElementById('login').classList.remove('active');
      document.getElementById('home').classList.add('active');
      this.router.navigate('home');
    }
  }

  attached() {
  }

  clearForm(form) {
    form = document.getElementById(form);
    form.reset();
    Array.from(form.children).forEach((v, i, a) => {
      if(v.children[0].hasAttribute('data-length') && v.children[0].getAttribute('data-length') !== '0') {
        v.children[0].setAttribute('data-length', 0);
      }
    });
    return(true);
  }

  // testPassword(form) {
  //   form = document.getElementById(form);
  //   if(form.children[1].children[0].value === form.children[2].children[0].value) {

  //   }
  // }
}