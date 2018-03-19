import {inject, bindable, bindingMode} from 'aurelia-framework';
import {Router, Redirect} from 'aurelia-router';
import {state} from '../services/state';

@inject(Router)
export class Login {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(Router) {
    this.router = Router;
    this.checkNameValue = null;
    // this.errors = { username: false, password: false, repassword: false, taken: false, matching: false };
    this.radio = null;
  }

  canActivate(params, routeConfig, navigationInstruction) {
    if(this.state.user) {
      // handle logout process (not done)
      this.state.user = null;
      if(this.router.history.previousLocation === '/home' || this.router.history.previousLocation === '/polls') {
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
    
    // this.errors = { username: false, password: false, repassword: false, taken: false, matching: false };
  }

  async checkName(event, input) {
    let taken = false;
    let value = document.getElementById(input).value;
    if(value !== this.checkNameValue) {
      this.checkNameValue = value;
      // taken = await this.api.checkName(this.checkNameValue);
      taken = true;
      document.getElementById('wrong-login').innerHTML = 'The username is already in use.';
      document.getElementById('wrong-login').style.display = taken ? 'block' : 'none';
      document.getElementById('signup-submit').disabled = taken ? true : false;
      // if(taken) {
      //   if(document.getElementById('username-taken').style.display !== 'block') {
      //     document.getElementById('username-taken').style.display = 'block';
      //   }
      // }
      // else {
      //   if(document.getElementById('username-taken').style.display !== 'none') {
      //     document.getElementById('username-taken').style.display = 'none';
      //   }
      // }
    }
  }
/*
  checkInputLength(input, check=null) {
    let inputElem = document.getElementById(input);
    inputElem.dataset.length = inputElem.value.length;

    if(check) {
      this.checkPassword(input, check);
    }
  }

  checkPassword(input, check) {
    let formName = input.split('-')[0];
    let inputElem = document.getElementById(input);
    let checkElem = document.getElementById(check);

    document.getElementById('wrong-login').innerHTML = inputElem.value !== checkElem.value ? 'Your password doesn\'t match.' : '';
    document.getElementById('wrong-login').style.display = inputElem.value !== checkElem.value ? 'block' : 'none';
    document.getElementById(`${formName}-submit`).disabled = inputElem.value !== checkElem.value ? true : false;
    // document.getElementById(`${formName}-submit`).disabled = inputElem.value ? true : false;
  }
*/
  async checkInput(event, form) {
    let errors = { inputLength: false, taken: false, matching: false };
    let inputs = document.getElementById(form).getElementsByTagName('input');
    inputs = Array.from(inputs);

    inputs.forEach((v, i, a) => {
      v.dataset.length = v.value.length;
      let min = v.getAttribute('minlength');
      if(v.value.length < min) {
        errors.inputLength = true;
      }
    });

    if(event.type === 'blur' && form === 'signup' && inputs[0].value !== this.checkNameValue) {
      this.checkNameValue = inputs[0].value;
      errors.taken = await this.api.checkName(this.checkNameValue);
    }

    if(inputs.length === 3 && inputs[1].value !== inputs[2].value) {
      errors.matching = true;
    }

    this.setError(form, errors);
  }

  setError(form, errors) {
    if(errors.taken && errors.matching) {
      document.getElementById('wrong-login').innerHTML = 'The username is already in use.<br>Your password doesn\'t match.';
    }
    else if(errors.taken) {
      document.getElementById('wrong-login').innerHTML = 'The username is already in use.';
    }
    else if(errors.matching) {
      document.getElementById('wrong-login').innerHTML = 'Your password doesn\'t match.';
    }
    else {
      document.getElementById('wrong-login').innerHTML = 'Username needs at least 4 characters.<br>Password needs at least 8 characters.';
    }

    if(errors.inputLength || errors.taken || errors.matching) {
      document.getElementById(`${form}-submit`).disabled = true;
      document.getElementById('wrong-login').style.display = 'block';
    }
    else {
      document.getElementById(`${form}-submit`).disabled = false;
      document.getElementById('wrong-login').style.display = 'none';
    }
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
        document.getElementById('wrong-login').innerHTML = 'You have typed in the wrong credentials.';
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