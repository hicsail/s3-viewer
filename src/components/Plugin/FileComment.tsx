import { ChangeEvent, FC, ReactNode, useEffect, useState } from 'react';
import { S3Object } from '../..';
import { SideNavPlugin } from '../../types/SideNavPlugin';
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

export class FileComment implements SideNavPlugin {
  name: string;
  description: string;
  icon: ReactNode;
  fileExtensions: string[];

  constructor() {
    this.name = 'Comment';
    this.description = 'Comment on documents';
    this.icon = <CommentIcon />;
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
      // TODO: api call to get comments
      console.log('get comments for', object);
      setComments([]);
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
