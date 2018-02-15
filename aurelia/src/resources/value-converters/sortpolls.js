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
    else if(type === 'votes' && direction === 'descending') {
      result = result.sort((a, b) => b.totalvotes - a.totalvotes);
      return(result);
    }
    else if(type === 'votes' && direction === 'ascending') {
      result = result.sort((a, b) => a.totalvotes - b.totalvotes);
      return(result);
    }
  }

  fromView(arr) {

  }
}