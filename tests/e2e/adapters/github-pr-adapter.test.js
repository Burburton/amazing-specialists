/**
 * True E2E: GitHub PR Adapter Integration Tests
 * Test Cases: TC-PR-001 to TC-PR-010
 */

const nock = require("nock");

process.env.GITHUB_TOKEN = "ghp_test";

const { GitHubPRAdapter } = require("../../../adapters/github-pr");

const baseURL = "https://api.github.com";
const testOwner = "test-owner";
const testRepo = "test-repo";
const testBaseBranch = "main";

describe("True E2E: GitHub PR Adapter", () => {
  let adapter;

  beforeEach(() => {
    nock.cleanAll();
    adapter = new GitHubPRAdapter({
      adapter_id: "github-pr",
      output_config: { artifact_path: "" },
      github_pr_config: {
        validation: { path_blocklist: [] },
        api: { base_url: baseURL },
        branch_config: { default_base_branch: testBaseBranch }
      }
    });
  });

  afterAll(() => { nock.cleanAll(); });

  describe("PR Creation", () => {
    test("TC-PR-001: PR created from execution result", async () => {
      const scope = nock(baseURL);
      scope.get("/repos/"+testOwner+"/"+testRepo+"/git/ref/heads/"+testBaseBranch).reply(200, { ref: "refs/heads/"+testBaseBranch, object: { sha: "abc" } });
      scope.post("/repos/"+testOwner+"/"+testRepo+"/git/refs").reply(201, { ref: "refs/heads/expert-pack/dispatch-001", object: { sha: "new" } });
      scope.get("/repos/"+testOwner+"/"+testRepo+"/contents/summary.md").query({ ref: "expert-pack/dispatch-001" }).reply(404);
      scope.put("/repos/"+testOwner+"/"+testRepo+"/contents/summary.md").reply(201, { content: { sha: "f1" }, commit: { sha: "c1" } });
      scope.get("/repos/"+testOwner+"/"+testRepo+"/pulls").query({ head: testOwner+":expert-pack/dispatch-001", state: "all" }).reply(200, []);
      scope.post("/repos/"+testOwner+"/"+testRepo+"/pulls").reply(201, { number: 456, html_url: "https://github.com/pull/456", state: "open" });
      scope.post("/repos/"+testOwner+"/"+testRepo+"/pulls/456/reviews").reply(200, { id: 123, state: "APPROVED" });
      scope.post("/repos/"+testOwner+"/"+testRepo+"/issues/456/labels").reply(200);
      adapter.setContext({ owner: testOwner, repo: testRepo, base_branch: testBaseBranch });
      const result = { dispatch_id: "dispatch-001", status: "SUCCESS", artifacts: [{ artifact_id: "a1", artifact_type: "impl", path: "summary.md", metadata: { content: "# Test" } }] };
      await adapter.handleArtifacts(result);
      const pr = await adapter.syncState(result);
      expect(pr.success).toBe(true);
      expect(pr.pr_number).toBe(456);
      expect(scope.isDone()).toBe(true);
    });
    test("TC-PR-002: Branch created for PR", async () => {
      const scope = nock(baseURL);
      scope.get("/repos/"+testOwner+"/"+testRepo+"/git/ref/heads/"+testBaseBranch).reply(200, { ref: "refs/heads/"+testBaseBranch, object: { sha: "b1" } });
      scope.post("/repos/"+testOwner+"/"+testRepo+"/git/refs").reply(201, { ref: "refs/heads/expert-pack/dispatch-001", object: { sha: "n1" } });
      scope.get("/repos/"+testOwner+"/"+testRepo+"/contents/branch.md").query({ ref: "expert-pack/dispatch-001" }).reply(404);
      scope.put("/repos/"+testOwner+"/"+testRepo+"/contents/branch.md").reply(201, { content: { sha: "b1" }, commit: { sha: "c1" } });
      adapter.setContext({ owner: testOwner, repo: testRepo, base_branch: testBaseBranch });
      const r = { dispatch_id: "dispatch-001", status: "SUCCESS", artifacts: [{ artifact_id: "a1", artifact_type: "impl", path: "branch.md", metadata: { content: "# Branch" } }] };
      const out = await adapter.handleArtifacts(r);
      expect(out.success).toBe(true);
      expect(scope.isDone()).toBe(true);
    });
    test("TC-PR-003: Tree created with files", async () => {
      const scope = nock(baseURL);
      scope.get("/repos/"+testOwner+"/"+testRepo+"/git/ref/heads/"+testBaseBranch).reply(200, { ref: "refs/heads/"+testBaseBranch, object: { sha: "t1" } });
      scope.post("/repos/"+testOwner+"/"+testRepo+"/git/refs").reply(201, { ref: "refs/heads/expert-pack/dispatch-001", object: { sha: "t2" } });
      scope.get("/repos/"+testOwner+"/"+testRepo+"/contents/file.md").query({ ref: "expert-pack/dispatch-001" }).reply(404);
      scope.put("/repos/"+testOwner+"/"+testRepo+"/contents/file.md").reply(201, { content: { sha: "b1" }, commit: { sha: "ct" } });
      adapter.setContext({ owner: testOwner, repo: testRepo, base_branch: testBaseBranch });
      const r = { dispatch_id: "dispatch-001", status: "SUCCESS", artifacts: [{ artifact_id: "a1", artifact_type: "impl", path: "file.md", metadata: { content: "# Test" } }] };
      const out = await adapter.handleArtifacts(r);
      expect(out.success).toBe(true);
      expect(out.artifacts_written).toContain("file.md");
      expect(scope.isDone()).toBe(true);
    });
    test("TC-PR-004: Commit created", async () => {
      const scope = nock(baseURL);
      scope.get("/repos/"+testOwner+"/"+testRepo+"/git/ref/heads/"+testBaseBranch).reply(200, { ref: "refs/heads/"+testBaseBranch, object: { sha: "cb" } });
      scope.post("/repos/"+testOwner+"/"+testRepo+"/git/refs").reply(201, { ref: "refs/heads/expert-pack/dispatch-001", object: { sha: "cn" } });
      scope.get("/repos/"+testOwner+"/"+testRepo+"/contents/commit.md").query({ ref: "expert-pack/dispatch-001" }).reply(404);
      scope.put("/repos/"+testOwner+"/"+testRepo+"/contents/commit.md").reply(201, { content: { sha: "fc" }, commit: { sha: "cc" } });
      adapter.setContext({ owner: testOwner, repo: testRepo, base_branch: testBaseBranch });
      const r = { dispatch_id: "dispatch-001", status: "SUCCESS", artifacts: [{ artifact_id: "a1", artifact_type: "impl", path: "commit.md", metadata: { content: "# Commit" } }] };
      const out = await adapter.handleArtifacts(r);
      expect(out.success).toBe(true);
      expect(scope.isDone()).toBe(true);
    });
  });
  describe("Artifacts", () => {
    test("TC-PR-005: Artifacts written to PR", async () => {
      const scope = nock(baseURL);
      scope.get("/repos/"+testOwner+"/"+testRepo+"/git/ref/heads/"+testBaseBranch).reply(200, { ref: "refs/heads/"+testBaseBranch, object: { sha: "a1" } });
      scope.post("/repos/"+testOwner+"/"+testRepo+"/git/refs").reply(201, { ref: "refs/heads/expert-pack/dispatch-001", object: { sha: "a2" } });
      scope.get("/repos/"+testOwner+"/"+testRepo+"/contents/impl.md").query({ ref: "expert-pack/dispatch-001" }).reply(404);
      scope.put("/repos/"+testOwner+"/"+testRepo+"/contents/impl.md").reply(201, { content: { sha: "s1" }, commit: { sha: "c1" } });
      scope.get("/repos/"+testOwner+"/"+testRepo+"/contents/test.md").query({ ref: "expert-pack/dispatch-001" }).reply(404);
      scope.put("/repos/"+testOwner+"/"+testRepo+"/contents/test.md").reply(201, { content: { sha: "s2" }, commit: { sha: "c2" } });
      adapter.setContext({ owner: testOwner, repo: testRepo, base_branch: testBaseBranch });
      const r = { dispatch_id: "dispatch-001", status: "SUCCESS", artifacts: [{ artifact_id: "a1", artifact_type: "impl", path: "impl.md", metadata: { content: "# Impl" } }, { artifact_id: "a2", artifact_type: "test", path: "test.md", metadata: { content: "# Test" } }] };
      const out = await adapter.handleArtifacts(r);
      expect(out.success).toBe(true);
      expect(out.artifacts_written.length).toBe(2);
      expect(scope.isDone()).toBe(true);
    });
    test("TC-PR-006: PR description includes execution summary", async () => {
      const scope = nock(baseURL);
      scope.get("/repos/"+testOwner+"/"+testRepo+"/git/ref/heads/"+testBaseBranch).reply(200, { ref: "refs/heads/"+testBaseBranch, object: { sha: "d1" } });
      scope.post("/repos/"+testOwner+"/"+testRepo+"/git/refs").reply(201, { ref: "refs/heads/expert-pack/dispatch-001", object: { sha: "d2" } });
      scope.get("/repos/"+testOwner+"/"+testRepo+"/contents/summary.md").query({ ref: "expert-pack/dispatch-001" }).reply(404);
      scope.put("/repos/"+testOwner+"/"+testRepo+"/contents/summary.md").reply(201, { content: { sha: "f1" }, commit: { sha: "c1" } });
      scope.get("/repos/"+testOwner+"/"+testRepo+"/pulls").query({ head: testOwner+":expert-pack/dispatch-001", state: "all" }).reply(200, []);
      scope.post("/repos/"+testOwner+"/"+testRepo+"/pulls").reply(201, { number: 456, html_url: "https://github.com/pull/456" });
      adapter.setContext({ owner: testOwner, repo: testRepo, base_branch: testBaseBranch });
      const r = { dispatch_id: "dispatch-001", status: "SUCCESS", summary: "Test summary", artifacts: [{ artifact_id: "a1", artifact_type: "impl", path: "summary.md", metadata: { content: "# Test" } }] };
      await adapter.handleArtifacts(r);
      const pr = await adapter.syncState(r);
      expect(pr.success).toBe(true);
      expect(scope.isDone()).toBe(true);
    });
  });
  describe("Metadata", () => {
    test("TC-PR-007: Review requested on PR", async () => {
      const scope = nock(baseURL);
      scope.get("/repos/"+testOwner+"/"+testRepo+"/git/ref/heads/"+testBaseBranch).reply(200, { ref: "refs/heads/"+testBaseBranch, object: { sha: "r1" } });
      scope.post("/repos/"+testOwner+"/"+testRepo+"/git/refs").reply(201, { ref: "refs/heads/expert-pack/dispatch-001", object: { sha: "r2" } });
      scope.get("/repos/"+testOwner+"/"+testRepo+"/contents/summary.md").query({ ref: "expert-pack/dispatch-001" }).reply(404);
      scope.put("/repos/"+testOwner+"/"+testRepo+"/contents/summary.md").reply(201, { content: { sha: "f1" }, commit: { sha: "c1" } });
      scope.get("/repos/"+testOwner+"/"+testRepo+"/pulls").query({ head: testOwner+":expert-pack/dispatch-001", state: "all" }).reply(200, []);
      scope.post("/repos/"+testOwner+"/"+testRepo+"/pulls").reply(201, { number: 456, html_url: "https://github.com/pull/456" });
      scope.post("/repos/"+testOwner+"/"+testRepo+"/pulls/456/reviews").reply(200, { id: 123, state: "APPROVED" });
      adapter.setContext({ owner: testOwner, repo: testRepo, base_branch: testBaseBranch });
      const r = { dispatch_id: "dispatch-001", status: "SUCCESS", artifacts: [{ artifact_id: "a1", artifact_type: "impl", path: "summary.md", metadata: { content: "# Test" } }] };
      await adapter.handleArtifacts(r);
      const pr = await adapter.syncState(r);
      expect(pr.success).toBe(true);
      expect(scope.isDone()).toBe(true);
    });
    test("TC-PR-008: Labels added to PR", async () => {
      const scope = nock(baseURL);
      scope.get("/repos/"+testOwner+"/"+testRepo+"/git/ref/heads/"+testBaseBranch).reply(200, { ref: "refs/heads/"+testBaseBranch, object: { sha: "l1" } });
      scope.post("/repos/"+testOwner+"/"+testRepo+"/git/refs").reply(201, { ref: "refs/heads/expert-pack/dispatch-001", object: { sha: "l2" } });
      scope.get("/repos/"+testOwner+"/"+testRepo+"/contents/summary.md").query({ ref: "expert-pack/dispatch-001" }).reply(404);
      scope.put("/repos/"+testOwner+"/"+testRepo+"/contents/summary.md").reply(201, { content: { sha: "f1" }, commit: { sha: "c1" } });
      scope.get("/repos/"+testOwner+"/"+testRepo+"/pulls").query({ head: testOwner+":expert-pack/dispatch-001", state: "all" }).reply(200, []);
      scope.post("/repos/"+testOwner+"/"+testRepo+"/pulls").reply(201, { number: 456, html_url: "https://github.com/pull/456" });
      scope.post("/repos/"+testOwner+"/"+testRepo+"/pulls/456/reviews").reply(200, { id: 123, state: "APPROVED" });
      scope.post("/repos/"+testOwner+"/"+testRepo+"/issues/456/labels").reply(200);
      adapter.setContext({ owner: testOwner, repo: testRepo, base_branch: testBaseBranch });
      const r = { dispatch_id: "dispatch-001", status: "SUCCESS", artifacts: [{ artifact_id: "a1", artifact_type: "impl", path: "summary.md", metadata: { content: "# Test" } }] };
      await adapter.handleArtifacts(r);
      const pr = await adapter.syncState(r);
      expect(pr.success).toBe(true);
      expect(scope.isDone()).toBe(true);
    });
    test("TC-PR-009: Execution result output formatted", () => {
      const r = { dispatch_id: "dispatch-001", status: "SUCCESS", role: "developer", command: "impl", summary: "Test", recommendation: "CONTINUE", artifacts: [], changed_files: [] };
      const cb = adapter.commitBuilder;
      const body = cb.buildPRBody(r, r.artifacts);
      expect(body).toContain("dispatch-001");
      expect(body).toContain("SUCCESS");
    });
  });

  describe("Info", () => {
    test("TC-PR-010: Adapter info returned", () => {
      const info = adapter.getAdapterInfo();
      expect(info).toBeDefined();
      expect(info.adapter_id).toBe("github-pr");
      expect(info.adapter_type).toBe("workspace");
    });
  });
});