export class SortpollsValueConverter {
  toView(arr, type, direction) {
    let result = arr.map(x => x);

    if(type === 'date' && direction === 'descending') {
      result = result.sort((a, b) => b.created - a.created);
      return(result);
    }
    else if(type === 'date' && direction === 'ascending') {
      result = result.sort((a, b) => a.created - b.created);
      return(result);
    }
    else if(type === 'votes' && direction === 'descending') {
      result = getTotalVotes(result);
      result = result.sort((a, b) => b.totalvotes - a.totalvotes);
      return(result);
    }
    else if(type === 'votes' && direction === 'ascending') {
      result = getTotalVotes(result);
      result = result.sort((a, b) => a.totalvotes - b.totalvotes);
      return(result);
    }
  }

  fromView(arr) {

  }
}

function getTotalVotes(list) {
  list.forEach((v, i, a) => {
    let totalvotes = 0;
    v.choices.forEach((cv, ci, ca) => {
      totalvotes += cv.votes;
    })
    v.totalvotes = totalvotes;
  });

  return(list);
}