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

  // handleForm(form) {
  //   // If user submit wrong signin, delay next available signin at Fibonacci number seconds
  //   // If user signup with used username, inform user
  //   // If user Reset Password, pass form as long as user meets form requirements even if user not valid. This allow user to not farm for accounts

  //   (form.children[1].children[0].value === form.children[2].children[0].value) // checking repeat password
  // }
}