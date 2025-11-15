import request from "supertest";
import { createServer } from "http";
import app from "../../app"; // adjust import if necessary

describe("POST /api/session", () => {
  let server;

  beforeAll(() => {
    server = createServer(app);
  });

  afterAll(() => {
    server.close();
  });

  it("should create a new session and return a UUID", async () => {
    const res = await request(server).post("/api/session").send();
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ok", true);
    expect(res.body.sessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });
});
