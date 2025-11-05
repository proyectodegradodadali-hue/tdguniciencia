import { WhereFilterOp } from "firebase/firestore";

export namespace ModelsFirebase {
    export type whereQuery = WhereFilterOp[] | string[] | any[];
  
    export interface extrasQuery {
      limit?: number | null;
      orderParam?: string | null;
      directionSort?: 'asc' | 'desc';
      startAfter?: any;
      group?: boolean;
    }
  
    export const defaultExtrasQuery: extrasQuery = {
      limit: null,
      orderParam: null,
      directionSort: 'asc',
      startAfter: null,
      group: false
    };
  }