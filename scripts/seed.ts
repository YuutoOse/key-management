import "dotenv/config";
import { auth } from "../src/server/lib/auth";
import { db } from "../src/server/lib/db";
import { keys } from "../src/server/lib/db/schema/app";

const users = [
  {
    name: "田中 管理",
    email: "admin@example.com",
    password: "password",
    role: "admin" as const,
  },
];

const initialKeys = [{ name: "書庫左" }, { name: "書庫右" }];

async function main() {
  for (const u of users) {
    const res = await auth.api.createUser({ body: u });
    console.log(`✓ ${u.name} (${u.email})`, res.user?.id ?? "failed");
  }

  const existing = await db.select().from(keys);
  if (existing.length === 0) {
    await db.insert(keys).values(initialKeys);
    console.log(`✓ 鍵データを ${initialKeys.length} 件追加しました`);
  } else {
    console.log(`  鍵データは既に存在します (${existing.length} 件)`);
  }

  console.log("\n初回ログイン後にパスワードを変更してください。");
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
