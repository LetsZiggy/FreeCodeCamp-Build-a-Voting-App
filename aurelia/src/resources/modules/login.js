import {inject, bindable, bindingMode} from 'aurelia-framework';
import {Router, Redirect} from 'aurelia-router';
import {state} from '../services/state';

@inject(Router)
export class Login {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(Router) {
    this.router = Router;
    this.radio = null;
  }

  canActivate(params, routeConfig, navigationInstruction) {
    if(this.state.user.id) {
      // handle logout process (not done)
      this.state.user = { id: null, name: null };
      if(this.router.history.previousLocation) {
        return(false);
      }
      else {
        return(new Redirect('home'));
      }
    }
  }

  attached() {
    if(this.state.login.timer) {
      this.radio = 'radio-signin';
      document.getElementById('radio-delay').checked = true;
      setTimerInterval(this.state, this.radio, 'signin');
    }
  }

  detached() {
    if(this.state.login.timer) {
      clearInterval(this.state.login.interval);
    }
  }

  checkName() {
    // Submit name check if name taken
    // if(taken) {
    //  document.getElementById('username-taken').style.display = 'none';
    // }
    // else {
    //   document.getElementById('username-taken').style.display = 'block';
    // }
  }

  clearForm(form) {
    document.getElementById('wrong-login').style.display = 'none';
    resetForm(document.getElementById(form));
    return(true);
  }

  handleForm(form) {
    if(form !== 'signup') {
      if(this.state.login.chance) {
        this.state.login.chance--;
        document.getElementById('wrong-login').style.display = 'block';
        resetForm(document.getElementById(form));
      }
      else {
        this.radio = `radio-${form}`;
        this.state.login.chance = 2;
        this.state.login.delay++;
        this.state.login.timer = 30 * this.state.login.delay;
        document.getElementById('radio-delay').checked = true;

        setTimerInterval(this.state, this.radio, form);
      }
    }

    // If user submit wrong signin, delay next available signin at Fibonacci number seconds
    // If user signup with used username, inform user
    // If user Reset Password, pass form as long as user meets form requirements even if user not valid. This allow user to not farm for accounts

    // (form.children[1].children[0].value === form.children[2].children[0].value) // checking repeat password
  }
}

function resetForm(form) {
  form.reset();
  Array.from(form.children).forEach((v, i, a) => {
    if(v.children[0].hasAttribute('data-length') && v.children[0].getAttribute('data-length') !== '0') {
      v.children[0].setAttribute('data-length', 0);
    }
  });
}

function setTimerInterval(state, radio, form) {
  state.login.interval = setInterval(() => {
    state.login.timer--;
    if(state.login.timer === 0) {
      document.getElementById(radio).checked = true;
      document.getElementById('wrong-login').style.display = 'none';
      resetForm(document.getElementById(form));
      clearInterval(state.login.interval);
    }
  }, 1000);
}