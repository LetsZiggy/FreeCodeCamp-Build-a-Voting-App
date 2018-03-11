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

  // Done
  getPolls() {
    return(
      this.http.fetch(`/polls`, {
                 method: 'GET'
               })
               .then(response => response.json())
               .then(data => data.polls)
    );
  }

  // Done
  getPollID() {
    return(
      this.http.fetch(`/poll/id`, {
                 method: 'POST',
                 credentials: 'same-origin'
               })
               .then(response => response.json())
               .then(data => data.id)
    );
  }

  createPoll(poll) {
    return(
      this.http.fetch(`/poll/create`, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json'
                 },
                 body: JSON.stringify(poll)
               })
               .then(response => response.json())
               .then(data => data)
    );
  }

  updatePoll(poll) {
    return(
      this.http.fetch(`/poll/update/${poll.id}`, {
                 method: 'PUT',
                 credentials: 'same-origin',
                 headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json'
                 },
                 body: JSON.stringify(poll)
               })
               .then(response => response.json())
               .then(data => data)
    );
  }

  deletePoll(poll) {
    return(
      this.http.fetch(`/poll/delete/${poll}`, {
                 method: 'DELETE',
                 credentials: 'same-origin',
                 headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json'
                 },
                 body: JSON.stringify(/*polldata*/)
               })
               .then(response => response.json())
               .then(data => data)
    );
  }
}