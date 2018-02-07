export class App {
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
      // {
      //   route: 'user',
      //   name: 'user',
      //   moduleId: './user',
      //   title: 'User',
      //   nav: true,
      // },
      // {
      //   route: 'voting',
      //   name: 'voting',
      //   moduleId: './voting',
      //   title: 'Voting',
      //   nav: true,
      // },
    ]);
  }
}