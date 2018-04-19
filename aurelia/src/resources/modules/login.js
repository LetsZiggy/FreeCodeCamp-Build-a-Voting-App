import {inject, bindable, bindingMode} from 'aurelia-framework';
import {Router, Redirect} from 'aurelia-router';
import {state} from '../services/state';
import {ApiInterface} from '../services/api-interface';

@inject(Router, ApiInterface)
export class Login {
  @bindable({ defaultBindingMode: bindingMode.twoWay }) state = state;

  constructor(Router, ApiInterface) {
    this.router = Router;
    this.api = ApiInterface;
    this.checkNameValue = null;
    this.checkNameTaken = false;
    this.radio = null;
  }

  async canActivate(params, routeConfig, navigationInstruction) {
    if(this.state.user.username) {
      let data = JSON.parse(localStorage.getItem('freecodecamp-build-a-voting-app')) || {};
      let logout = await this.api.logoutUser();

      if(this.state.user.interval) {
        clearInterval(this.state.user.interval);
        this.state.user.interval = null;
      }

      this.state.user.username = null;
      this.state.user.expire = null;

      data.username = this.state.user.username;
      data.userexpire = this.state.user.expire;
      localStorage.setItem('freecodecamp-build-a-voting-app', JSON.stringify(data));

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

    this.checkNameValue = null;
  }

  async checkInput(event, form) {
    let errors = { inputLength: false, matching: false };
    let inputs = document.getElementById(form).getElementsByTagName('input');
    inputs = Array.from(inputs);

    inputs.forEach((v, i, a) => {
      v.dataset.length = v.value.length;
      let min = v.getAttribute('minlength');
      if(v.value.length < min) {
        errors.inputLength = true;
      }
    });

    if(inputs[0].value.length >= inputs[0].getAttribute('minlength') && form === 'signup' && inputs[0].value !== this.checkNameValue) {
      this.checkNameValue = inputs[0].value;
      this.checkNameTaken = await this.api.getUserNames(this.checkNameValue);
    }

    if(inputs.length === 3 && inputs[1].value !== inputs[2].value) {
      errors.matching = true;
    }

    setError(form, errors, this.checkNameTaken);
    return(true);
  }

  clearForm(form) {
    document.getElementById('wrong-login').style.display = 'none';
    document.getElementById(`${form}-submit`).disabled = true;
    resetForm(document.getElementById(form));
    return(true);
  }

  async handleForm(form) {
    let result = null;
    let formSuccess = false;

    if(form === 'signup') {
      result = await this.api.createUser({ username: document.getElementById(`${form}-username`).value, password: document.getElementById(`${form}-password`).value });
      formSuccess = result.create;
    }
    else if(form === 'signin') {
      result = await this.api.getUser({ username: document.getElementById(`${form}-username`).value, password: document.getElementById(`${form}-password`).value });
      formSuccess = result.get;
    }
    else {
      result = await this.api.editUser({ username: document.getElementById(`${form}-username`).value, password: document.getElementById(`${form}-password`).value });
      formSuccess = result.update;
    }

    // check results
    if(!formSuccess && form === 'signup') {
      document.getElementById('wrong-login').innerHTML = 'Sorry, we weren\'t able to process your signup.<br>Please try again.';
      document.getElementById('wrong-login').style.display = 'block';
      resetForm(document.getElementById(form));
    }
    else if(!formSuccess && (form === 'signin' || form === 'signreset')) {
      if(this.state.login.chance) {
        this.state.login.chance--;

        if(form === 'signin') {
          document.getElementById('wrong-login').innerHTML = 'You have typed in the wrong credentials.';
        }
        else {
          document.getElementById('wrong-login').innerHTML = 'You have typed in the wrong username.';
        }
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
    else {
      this.state.user.expire = result.expire;
      this.state.user.username = document.getElementById(`${form}-username`).value;

      this.state.user.interval = setTimeout(async () => {
        let logout = await this.api.logoutUser();

        if(this.state.user.interval) {
          clearInterval(this.state.user.interval);
          this.state.user.interval = null;
        }

        this.state.user.username = null;
        this.state.user.expire = null;
        console.log('logout');
      }, (this.state.user.expire - Date.now()));

      this.router.navigateToRoute('home');
    }
  }
}

function setError(form, errors, checkNameTaken) {
  if(checkNameTaken && errors.matching) {
    document.getElementById('wrong-login').innerHTML = 'The username is already in use.<br>Your password doesn\'t match.';
  }
  else if(checkNameTaken) {
    document.getElementById('wrong-login').innerHTML = 'The username is already in use.';
  }
  else if(errors.matching) {
    document.getElementById('wrong-login').innerHTML = 'Your password doesn\'t match.';
  }
  else {
    document.getElementById('wrong-login').innerHTML = 'Username needs at least 6 characters.<br>Password needs at least 8 characters.';
  }

  if(errors.inputLength || checkNameTaken || errors.matching) {
    document.getElementById(`${form}-submit`).disabled = true;
    document.getElementById('wrong-login').style.display = 'block';
  }
  else {
    document.getElementById(`${form}-submit`).disabled = false;
    document.getElementById('wrong-login').style.display = 'none';
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