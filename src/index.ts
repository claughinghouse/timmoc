/// <reference types="@cloudflare/workers-types" />
import {
  drizzle,
  type DrizzleSqliteDODatabase,
} from "drizzle-orm/durable-sqlite";
import { DurableObject } from "cloudflare:workers";
import { migrate } from "drizzle-orm/durable-sqlite/migrator";
import migrations from "../drizzle/migrations";
import { usersTable } from "./db/schema";

export class TimmocDurableObject extends DurableObject {
  storage: DurableObjectStorage;
  db: DrizzleSqliteDODatabase;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.storage = ctx.storage;
    this.db = drizzle(this.storage, { logger: false });

    // Make sure all migrations complete before accepting queries.
    // Otherwise you will need to run `this.migrate()` in any function
    // that accesses the Drizzle database `this.db`.
    ctx.blockConcurrencyWhile(async () => {
      await this._migrate();
    });
  }

  async insertAndList(user: typeof usersTable.$inferInsert) {
    await this.insert(user);
    return this.select();
  }

  async insert(user: typeof usersTable.$inferInsert) {
    await this.db.insert(usersTable).values(user);
  }

  async select() {
    return this.db.select().from(usersTable);
  }

  async _migrate() {
    migrate(this.db, migrations);
  }
}

export default {
  /**
   * This is the standard fetch handler for a Cloudflare Worker
   *
   * @param request - The request submitted to the Worker from the client
   * @param env - The interface to reference bindings declared in wrangler.toml
   * @param ctx - The execution context of the Worker
   * @returns The response to be sent back to the client
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    const id: DurableObjectId =
      env.TIMMOC_DURABLE_OBJECT.idFromName("durable-object");
    const stub = env.TIMMOC_DURABLE_OBJECT.get(id);

    // Option A - Maximum performance.
    // Prefer to bundle all the database interaction within a single Durable Object call
    // for maximum performance, since database access is fast within a DO.
    // const usersAll = await stub.insertAndList({
    //   name: "John",
    //   age: 30,
    //   email: "john@example.com",
    // });
    // console.log(
    //   "New user created. Getting all users from the database: ",
    //   usersAll,
    // );

    const users = await stub.select();
    console.log("Getting all users from the database: ", users);

    return Response.json(users);
  },
};
