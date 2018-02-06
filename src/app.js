export class App {
  configureRouter(config, router) {
    this.router = router;
    config.title = 'FreeCodeCamp - Build a Voting App';
    config.map([
      {
        route: ['', 'home'],
        name: 'home',
        moduleId: './modules/home',
        title: 'Home',
        nav: true,
      },
      {
        route: 'user',
        name: 'user',
        moduleId: './modules/user',
        title: 'User',
        nav: true,
      },
      {
        route: 'voting',
        name: 'voting',
        moduleId: './modules/voting',
        title: 'Voting',
        nav: true,
      },
    ]);
  }
}