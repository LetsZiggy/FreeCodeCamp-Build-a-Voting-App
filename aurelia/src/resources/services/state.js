export const state = {
  login: {
    chance: 2,
    delay: 0,
    timer: 0,
    interval: null
  },
  user: {
    username: null,
    expire: null,
    interval: null
  },
  toUpdatePolls: {
    now: null,
    updated: false
  },
  votes: {},
  polls: []
};