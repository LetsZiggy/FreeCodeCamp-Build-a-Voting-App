export function configure(config) {
  config.globalResources([
    './value-converters/lowercase',
    './value-converters/repeatlimit',
    './value-converters/sortpolls',
    './elements/nav.html',
    './elements/footer.html'
  ]);
}