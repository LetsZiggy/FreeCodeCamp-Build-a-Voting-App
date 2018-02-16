export const state = {
  login: true,
  user: {
    createdList: ['a1'],
    participatedList: ['a2'],
    created: [
      {
        id: 'a1',
        date: 1,
        name: 'created 1',
        choices: [
          {
            title: 'createdchoice01',
            votes: 3,
            voters: []
          },
          {
            title: 'createdchoice02',
            votes: 6,
            voters: []
          },
          {
            title: 'createdchoice03',
            votes: 10,
            voters: []
          },
        ],
      }
    ],
    participated: [
      {
        id: 'a2',
        date: 1,
        name: 'participated 1',
        choices: [
          {
            title: 'participatedchoice01',
            votes: 4,
            voters: []
          },
        ],
      }
    ],
  },
  polls: [
    {
      id: 'b2',
      name: 'poll 2',
      date: 2,
      choices: [
        {
          title: '01',
          votes: 4,
          voters: []
        },
        {
          title: '02',
          votes: 13,
          voters: []
        },
      ],
    },
    {
      id: 'b8',
      name: 'poll 8',
      date: 8,
      choices: [
        {
          title: '01',
          votes: 14,
          voters: []
        },
        {
          title: '02',
          votes: 3,
          voters: []
        },
      ],
    },
    {
      id: 'b6',
      name: 'poll 6',
      date: 6,
      choices: [
        {
          title: '01',
          votes: 7,
          voters: []
        },
        {
          title: '02',
          votes: 13,
          voters: []
        },
        {
          title: '03',
          votes: 7,
          voters: []
        },
        {
          title: '04',
          votes: 13,
          voters: []
        },
      ],
    },
    {
      id: 'b3',
      name: 'poll 3',
      date: 3,
      choices: [
        {
          title: '01',
          votes: 6,
          voters: []
        },
        {
          title: '02',
          votes: 31,
          voters: []
        },
      ],
    },
    {
      id: 'b10',
      name: 'poll 10',
      date: 10,
      choices: [
        {
          title: '01',
          votes: 41,
          voters: []
        },
        {
          title: '02',
          votes: 2,
          voters: []
        },
      ],
    },
    {
      id: 'b4',
      name: 'poll 4',
      date: 4,
      choices: [
        {
          title: '01',
          votes: 23,
          voters: []
        },
        {
          title: '02',
          votes: 23,
          voters: []
        },
      ],
    },
    {
      id: 'b9',
      name: 'poll 9',
      date: 9,
      choices: [
        {
          title: '01',
          votes: 9,
          voters: []
        },
        {
          title: '02',
          votes: 7,
          voters: []
        },
      ],
    },
    {
      id: 'b1',
      name: 'poll 1',
      date: 1,
      choices: [
        {
          title: '01',
          votes: 12,
          voters: []
        },
        {
          title: '02',
          votes: 15,
          voters: []
        },
      ],
    },
    {
      id: 'b5',
      name: 'poll 5',
      date: 5,
      choices: [
        {
          title: '01',
          votes: 35,
          voters: []
        },
        {
          title: '02',
          votes: 46,
          voters: []
        },
      ],
    },
    {
      id: 'b7',
      name: 'poll 7',
      date: 7,
      choices: [
        {
          title: '01',
          votes: 1,
          voters: []
        },
        {
          title: '02',
          votes: 4,
          voters: []
        },
      ],
    },
    {
      id: 'b12',
      name: 'poll 12',
      date: 12,
      choices: [
        {
          title: '01',
          votes: 4,
          voters: []
        },
        {
          title: '02',
          votes: 13,
          voters: []
        },
      ],
    },
    {
      id: 'b18',
      name: 'poll 18',
      date: 18,
      choices: [
        {
          title: '01',
          votes: 14,
          voters: []
        },
        {
          title: '02',
          votes: 3,
          voters: []
        },
      ],
    },
    {
      id: 'b16',
      name: 'poll 16',
      date: 16,
      choices: [
        {
          title: '01',
          votes: 7,
          voters: []
        },
        {
          title: '02',
          votes: 13,
          voters: []
        },
        {
          title: '03',
          votes: 7,
          voters: []
        },
        {
          title: '04',
          votes: 13,
          voters: []
        },
      ],
    },
    {
      id: 'b13',
      name: 'poll 13',
      date: 13,
      choices: [
        {
          title: '01',
          votes: 6,
          voters: []
        },
        {
          title: '02',
          votes: 31,
          voters: []
        },
      ],
    },
    {
      id: 'b20',
      name: 'poll 20',
      date: 20,
      choices: [
        {
          title: '01',
          votes: 41,
          voters: []
        },
        {
          title: '02',
          votes: 2,
          voters: []
        },
      ],
    },
    {
      id: 'b14',
      name: 'poll 14',
      date: 14,
      choices: [
        {
          title: '01',
          votes: 23,
          voters: []
        },
        {
          title: '02',
          votes: 23,
          voters: []
        },
      ],
    },
    {
      id: 'b19',
      name: 'poll 19',
      date: 19,
      choices: [
        {
          title: '01',
          votes: 9,
          voters: []
        },
        {
          title: '02',
          votes: 7,
          voters: []
        },
      ],
    },
    {
      id: 'b11',
      name: 'poll 11',
      date: 11,
      choices: [
        {
          title: '01',
          votes: 12,
          voters: []
        },
        {
          title: '02',
          votes: 15,
          voters: []
        },
      ],
    },
    {
      id: 'b15',
      name: 'poll 15',
      date: 15,
      choices: [
        {
          title: '01',
          votes: 35,
          voters: []
        },
        {
          title: '02',
          votes: 46,
          voters: []
        },
      ],
    },
    {
      id: 'b17',
      name: 'poll 17',
      date: 17,
      choices: [
        {
          title: '01',
          votes: 1,
          voters: []
        },
        {
          title: '02',
          votes: 4,
          voters: []
        },
      ],
    },
  ],
};