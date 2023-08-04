export enum EventType {
  OBJECT_UPLOADED = 'objectUploaded',
  OBJECT_UPDATED = 'objectUpdated',
  OBJECT_DELETED = 'objectDeleted'
}

export type EventBusContextType = {
  subscribe: (event: EventType, callback: (data: any) => void) => void;
  trigger: (event: EventType, data: any) => void;
};
