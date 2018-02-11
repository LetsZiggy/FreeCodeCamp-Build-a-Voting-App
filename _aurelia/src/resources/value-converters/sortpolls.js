export class SortpollsValueConverter {
  toView(arr, type, direction) {
    let result = arr.map(x => x);

    if(type === 'date' && direction === 'descending') {
      result = result.sort((a, b) => b.date - a.date);
      return(result);
    }
    else if(type === 'date' && direction === 'ascending') {
      result = result.sort((a, b) => a.date - b.date);
      return(result);
    }
    else if(type === 'participated' && direction === 'descending') {
      result = result.sort((a, b) => b.participated - a.participated);
      return(result);
    }
    else if(type === 'participated' && direction === 'ascending') {
      result = result.sort((a, b) => a.participated - b.participated);
      return(result);
    }
  }

  fromView(arr) {

  }
}