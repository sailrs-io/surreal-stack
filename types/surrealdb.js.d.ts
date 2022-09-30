declare module "surrealdb.js" {

  type Credentials = {
    user: string;
    pass: string;
  }

  type Data = Record<string, unknown>;

  type QueryResult<T extends Data = Data> = {
    result: Array<T>;
    status: string;
    time: string;
  }

  export class Surreal {
    constructor(url?: string, token?: string);
    Instance(): Surreal;

    signin(credentials: Credentials): Promise<void>;
    use(namespace: string, database: string): Promise<void>;
    create<T extends Data>(thing: string, data: Data): Promise<T>;
    change<T extends Data>(thing: string, data: Data): Promise<T>;
    delete(thing: string): Promise<void>;
    select<T extends Data>(thing: string): Promise<Array<T>>;
    query<T extends Data>(query: string, params?: any): Promise<QueryResult<T>>;
  }

  export default Surreal;
}
