export function configure(config) {
  config.globalResources([
    './value-converters/repeatlimit',
    './value-converters/sortpolls',
    './elements/header.html',
    './elements/footer.html'
  ]);
}