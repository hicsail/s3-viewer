export type EventType = 'objectCreated' | 'objectUploaded' | 'objectDeleted' | 'objectUpdated';

export type EventBusContextType = {
  subscribe: (event: EventType, callback: (data: any) => void) => void;
  trigger: (event: EventType, data: any) => void;
};
