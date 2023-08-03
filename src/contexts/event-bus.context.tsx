import { FC, createContext, useContext, useState } from 'react';
import { EventBusContextType, EventType } from '../types/Event';

interface EventBusProviderProps {
  children?: React.ReactNode;
}

const EventBusContext = createContext<EventBusContextType>({
  subscribe: () => {},
  trigger: () => {}
});

export const EventBusProvider: FC<EventBusProviderProps> = (props) => {
  const [event, setEvents] = useState<Record<EventType, ((data: any) => void)[]>>({} as any);

  const subscribe = (eventType: EventType, callback: (data: any) => void) => {
    if (!event[eventType]) {
      setEvents((prev) => ({ ...prev, [eventType]: [] }));
    }

    setEvents((prev) => ({ ...prev, [eventType]: [...prev[eventType], callback] }));
  };

  const trigger = (eventType: EventType, data: any) => {
    if (event[eventType]) {
      event[eventType].forEach((callback) => callback(data));
    }
  };

  return <EventBusContext.Provider value={{ subscribe, trigger }}>{props.children}</EventBusContext.Provider>;
};

export const useEventBus = () => {
  return useContext(EventBusContext);
};
