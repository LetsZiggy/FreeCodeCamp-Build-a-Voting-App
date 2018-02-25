export class UppercaseValueConverter {
  toView(value) {
    console.log(value);
    return(value.toUpperCase());
  }

  fromView(value) {

  }
}