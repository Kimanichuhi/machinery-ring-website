import { describe, it, expect, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const hasEnv = !!url && !!anonKey;
const d = hasEnv ? describe : describe.skip;

const anon = hasEnv ? createClient(url!, anonKey!, { auth: { persistSession: false } }) : (null as any);

d("RLS policies (anonymous role)", () => {
  beforeAll(() => {
    expect(anon).toBeTruthy();
  });

  it("blocks anonymous delete on profiles", async () => {
    const { error, data } = await anon.from("profiles").delete().neq("id", "00000000-0000-0000-0000-000000000000").select();
    expect(error || (data ?? []).length === 0).toBeTruthy();
  });

  it("blocks anonymous delete on team members", async () => {
    const { data, error } = await anon.from("team_members").delete().neq("name", "__none__").select();
    expect(error || (data ?? []).length === 0).toBeTruthy();
  });

  it("blocks anonymous delete on resources", async () => {
    const { data, error } = await anon.from("resources").delete().neq("title", "__none__").select();
    expect(error || (data ?? []).length === 0).toBeTruthy();
  });

  it("blocks anonymous insert on team members", async () => {
    const { error } = await anon.from("team_members").insert({ name: "rls-test" }).select();
    expect(error).toBeTruthy();
  });

  it("blocks anonymous role self-assignment", async () => {
    const { error } = await anon
      .from("user_roles")
      .insert({ user_id: "00000000-0000-0000-0000-000000000000", role: "admin" })
      .select();
    expect(error).toBeTruthy();
  });

  it("hides security scan history from anonymous users", async () => {
    const { data, error } = await anon.from("security_scans").select("*");
    expect(error || (data ?? []).length === 0).toBeTruthy();
  });

  it("hides security findings from anonymous users", async () => {
    const { data, error } = await anon.from("security_findings").select("*");
    expect(error || (data ?? []).length === 0).toBeTruthy();
  });

  it("allows anonymous read of public resources", async () => {
    const { error } = await anon.from("resources").select("id").limit(1);
    expect(error).toBeNull();
  });
});

d("Storage policies (anonymous role)", () => {
  it("does not allow listing objects in the images bucket", async () => {
    const { data, error } = await anon.storage.from("images").list();
    expect(error || (data ?? []).length === 0).toBeTruthy();
  });

  it("does not allow uploading to the images bucket", async () => {
    const { error } = await anon.storage
      .from("images")
      .upload(`rls-test-${Date.now()}.txt`, new Blob(["x"]), { contentType: "text/plain" });
    expect(error).toBeTruthy();
  });

  it("does not allow deleting objects in the images bucket", async () => {
    const { data, error } = await anon.storage.from("images").remove(["does-not-exist.txt"]);
    expect(error || (data ?? []).length === 0).toBeTruthy();
  });
});
