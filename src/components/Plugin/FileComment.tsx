import { ChangeEvent, FC, ReactNode, useEffect, useState } from 'react';
import { S3Object } from '../..';
import { Plugin } from '../../types/Plugin';
import {
  Avatar,
  Badge,
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  ClickAwayListener,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import AddCommentIcon from '@mui/icons-material/AddComment';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import ReplyIcon from '@mui/icons-material/Reply';

type Comment = {
  _id: string;
  user: User;
  date: Date;
  content: string;
  replies: Comment[];
};

type User = {
  _id: string;
  name: string;
  email: string;
};

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

const dummyComments: Comment[] = [
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

export class FileComment implements Plugin {
  name: string;
  description: string;
  fileExtensions: string[];

  constructor() {
    this.name = 'Comment';
    this.description = 'Comment on documents';
    this.fileExtensions = ['*']; // wildcard. support all files
  }

  getView(object: S3Object): ReactNode {
    return <FileCommentPanel object={object} />;
  }
}

const FileCommentPanel: FC<{ object: S3Object }> = ({ object }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const initExpandThreadState = comments.reduce((acc, _, index) => {
    acc[index] = false;
    return acc;
  }, {} as { [key: number]: boolean });
  const initExpandReplyState = comments.reduce((acc, _, index) => {
    acc[index] = false;
    return acc;
  }, {} as { [key: number]: boolean });

  const [expandThread, setExpandThread] = useState<{ [key: number]: boolean }>(initExpandThreadState);
  const [expandReply, setExpandReply] = useState<{ [key: number]: boolean }>(initExpandReplyState);
  const [replyTo, setReplyTo] = useState<User | null>(null);
  const [replyContents, setReplyContents] = useState<{ [key: number]: string }>({});
  const [newComment, setNewComment] = useState<string>('');

  const handleExpandThread = (index: number) => {
    setExpandThread((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleExpandReply = (replyTo: User | null, index: number) => {
    setReplyTo(replyTo);
    setExpandReply((_) => {
      const newState = comments.reduce((acc, _, index) => {
        acc[index] = false;
        return acc;
      }, {} as { [key: number]: boolean });

      newState[index] = true;

      return newState;
    });
  };

  const handleCollapseReply = (index: number) => {
    setReplyTo(null);
    setExpandReply((prev) => ({ ...prev, [index]: false }));
  };

  const handleReply = async (user: User | null, content: string, index: number, commentId?: string) => {
    // api call to post comment
    console.log('post comment', user, content, index, commentId);

    setReplyTo(null);
    setReplyContents((prev) => ({ ...prev, [index]: '' }));
    setExpandReply((prev) => ({ ...prev, [index]: false }));
  };

  const handleReplyInput = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, index: number) => {
    setReplyContents((prev) => ({ ...prev, [index]: event.target.value }));
  };

  const handleCommentInput = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setNewComment(event.target.value);
  };

  useEffect(() => {
    const getComments = async (object: S3Object) => {
      // api call to get comments
      console.log('get comments for', object);
      setComments(dummyComments);
    };

    getComments(object);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: `calc(100vh - 120px)`, width: '100%' }}>
      <Grid sx={{ padding: 1, flexGrow: 1, overflowY: 'auto', margin: 0 }}>
        {comments.map((comment, index) => (
          <Grid key={comment._id} item marginBottom={1}>
            <Card>
              <CardHeader
                avatar={<Avatar>{comment.user.name.split(' ')[0].charAt(0) + comment.user.name.split(' ')[1].charAt(0)}</Avatar>}
                title={comment.user.name}
                subheader={formatDate(comment.date)}
                sx={{ paddingBottom: '8px' }}
              />
              <CardContent sx={{ paddingY: '8px' }}>
                <Typography variant="body2">{comment.content}</Typography>
              </CardContent>
              <CardActions disableSpacing>
                <Box marginLeft="auto">
                  <IconButton onClick={() => handleExpandReply(null, index)}>
                    <AddCommentIcon />
                  </IconButton>
                  <IconButton disabled={comment.replies.length === 0} onClick={() => handleExpandThread(index)}>
                    <Badge badgeContent={comment.replies.length} color="primary">
                      <CommentIcon />
                    </Badge>
                  </IconButton>
                </Box>
              </CardActions>
              <Collapse in={expandThread[index]} timeout="auto" unmountOnExit>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%'
                    }}
                  >
                    <Divider orientation="vertical" variant="middle" flexItem sx={{ border: 1, borderColor: '#E0E0E0', marginRight: 2 }} />
                    <Box width="100%">
                      {comment.replies.map((reply, replyIndex) => (
                        <Stack key={reply._id} spacing={1}>
                          {replyIndex !== 0 && <Divider sx={{ paddingTop: 1 }} />}
                          <Box display="flex">
                            <Box marginRight="16px">
                              <Avatar>{reply.user.name.split(' ')[0].charAt(0) + reply.user.name.split(' ')[1].charAt(0)}</Avatar>
                            </Box>
                            <Box>
                              <Typography variant="body2">{reply.user.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(reply.date)}
                              </Typography>
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant="body2">{reply.content}</Typography>
                          </Box>
                          <Box textAlign="end">
                            <IconButton size="small" onClick={() => handleExpandReply(reply.user, index)}>
                              <ReplyIcon fontSize="small" sx={{ margin: 0 }} />
                            </IconButton>
                          </Box>
                        </Stack>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Collapse>
              <Collapse in={expandReply[index]} timeout="auto" unmountOnExit>
                <ClickAwayListener onClickAway={() => handleCollapseReply(index)}>
                  <CardContent sx={{ paddingY: '8px' }}>
                    <TextField
                      placeholder={replyTo ? `Reply to ${replyTo.name}:` : ''}
                      variant="standard"
                      sx={{ width: 'calc(100% - 40px)' }}
                      value={replyContents[index]}
                      onChange={() => handleReplyInput(event, index)}
                      multiline
                    />
                    <IconButton onClick={() => handleReply(replyTo, replyContents[index], index, comment._id)}>
                      <SendIcon />
                    </IconButton>
                  </CardContent>
                </ClickAwayListener>
              </Collapse>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box
        sx={{
          display: 'flex',
          padding: '10px',
          width: 'calc(100% - 20px)',
          borderTop: 1,
          borderColor: 'rgba(0, 0, 0, 0.12)',
          backgroundColor: 'white'
        }}
      >
        <TextField sx={{ width: 'calc(100% - 40px)' }} value={newComment} size="small" onChange={handleCommentInput} multiline />
        <IconButton sx={{ alignItems: 'center' }}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

  const zeroPad = (num: number, places: number = 2) => String(num).padStart(places, '0');

  const monthName = months[date.getMonth()];
  const day = zeroPad(date.getDate());
  const year = date.getFullYear();

  const hours = zeroPad(date.getHours());
  const minutes = zeroPad(date.getMinutes());
  const seconds = zeroPad(date.getSeconds());

  return `${monthName} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
}
