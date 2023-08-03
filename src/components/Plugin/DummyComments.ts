import { Comment, User } from './FileComment';

const user0: User = {
  _id: '10a3daf6-c632-4f0b-ac92-c2ab4252e064',
  name: 'John Doe',
  email: 'john.doe@mail.com'
};

const user1: User = {
  _id: '2feb8536-64fe-4357-9456-e9255d5a9c96',
  name: 'Adam Smith',
  email: 'adam.smith@bu.edu'
};

const user2: User = {
  _id: '2feb8536-64fe-4357-9456-e9255d5a9c96',
  name: 'Cindy Lou',
  email: 'cindy.lou@ma.gov'
};

export const dummyComments: Comment[] = [
  {
    _id: '1d1ef9ec-83d8-440b-a25b-c2285274e54a',
    user: user0,
    date: new Date(2019, 8, 3),
    content: 'Starting a new thread',
    replies: [
      {
        _id: '2feb8536-64fe-4357-9456-e9255d5a9c96',
        user: user1,
        date: new Date(2019, 8, 4),
        content:
          'Heat oil in a (14- to 16-inch) paella pan or a large, deep skillet over medium-high heat. Add chicken, shrimp and chorizo, and cook, stirring occasionally until lightly browned, 6 to 8 minutes. Transfer shrimp to a large plate and set aside, leaving chicken and chorizo in the pan. Add pimentón, bay leaves, garlic, tomatoes, onion, salt and pepper, and cook, stirring often until thickened and fragrant, about 10 minutes. Add saffron broth and remaining 4 1/2 cups chicken broth; bring to a boil.',
        replies: []
      },
      {
        _id: 'b3ac5185-7218-4dcc-8d26-d118904539b8',
        user: user0,
        date: new Date(2019, 8, 5),
        content:
          'Add rice and stir very gently to distribute. Top with artichokes and peppers, and cook without stirring, until most of the liquid is absorbed, 15 to 18 minutes. Reduce heat to medium-low, add reserved shrimp and mussels, tucking them down into the rice, and cook again without stirring, until mussels have opened and rice is just tender, 5 to 7 minutes more. (Discard any mussels that don&apos;t open.)',
        replies: []
      }
    ]
  },
  {
    _id: 'e457933f-facd-4307-ba34-39f372ba7860',
    user: user2,
    date: new Date(2019, 8, 6),
    content: 'Starting a new thread again',
    replies: []
  },
  {
    _id: '2a1d34f4-fa73-4b3f-90dc-244237eb4d65',
    user: user1,
    date: new Date(2019, 8, 7),
    content: 'Last comment',
    replies: [
      {
        _id: 'd00b5ede-13f8-46ec-8a8d-79740e691494',
        user: user2,
        date: new Date(2019, 8, 8),
        content: 'Last reply',
        replies: []
      }
    ]
  }
];
