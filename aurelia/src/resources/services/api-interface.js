import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@inject(HttpClient)
export class ApiInterface {
  constructor(HttpClient) {
    HttpClient.configure(config => {
      // config.withBaseUrl('http://localhost:4000')
      config.withBaseUrl('http://localhost:3000/api')
            .withInterceptor({
              request(request) {
                return request;
              },
              requestError(requestError) {
                console.log(requestError);
                return requestError;
              },
              response(response) {
                return response;
              },
              responseError(responseError) {
                console.log(responseError);
                return responseError;
              }
      });
    });
    this.http = HttpClient;
  }
/*
  createUser() {
    // Get new ID
    // Check if ID taken
    // Create User
    
    let test = { "content": "testing content 1" }
    return this.http.fetch(`/user/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(test)
    })
    .then(response => response.json())
    .then(data => console.log(data));
   }

  updateUser(id) {
    let test = { "content": "testing content 1" }
    return this.http.fetch(`/user/1/`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(test)
    })
    .then(response => response.json())
    .then(data => console.log(data));
  }

  deleteUser(id) {

  }
*/
  getPolls() {
    return(
      this.http.fetch(`/polls`, { method: 'GET' })
               .then(response => response.json())
               .then(data => data.polls)
    );
  }
}