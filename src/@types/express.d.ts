import { SessionData } from './session-data';

export interface RequestWithSession extends Request {
  session: SessionData;
}
