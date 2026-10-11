import { pathToFileURL } from "node:url";

export function homepageAiRoute(env = process.env) {
  return {
    provider: String(env.HOMEPAGE_AI_PROVIDER || "opencode-go").trim(),
    model: String(env.HOMEPAGE_AI_MODEL || "").trim(),
  };
}

export function missingHomepageAiConfiguration(env = process.env) {
  const missing = [];
  if (!String(env.HOMEPAGE_AI_API_KEY || "").trim()) missing.push("HOMEPAGE_AI_API_KEY");
  if (!String(env.HOMEPAGE_AI_MODEL || "").trim()) missing.push("HOMEPAGE_AI_MODEL");
  if (!String(env.OPENCODE_SDK_ENTRY || "").trim()) missing.push("OPENCODE_SDK_ENTRY");
  return missing;
}

function structuredOutputFrom(result) {
  const response = result?.data ?? result;
  const info = response?.info;

  if (info?.error?.name === "StructuredOutputError") {
    throw new Error("structured_output_failed");
  }

  const output = info?.structured ?? info?.structured_output;
  if (!output || typeof output !== "object" || Array.isArray(output)) {
    throw new Error("structured_output_missing");
  }

  return output;
}

async function disposeOpenCode(instance, timeoutMs = 5_000) {
  const dispose = instance.client?.instance?.dispose;

  if (typeof dispose === "function") {
    const controller = new AbortController();
    let timeout;
    const disposeTimedOut = new Promise((resolve) => {
      timeout = setTimeout(() => {
        controller.abort();
        resolve(undefined);
      }, timeoutMs);
    });

    try {
      await Promise.race([
        Promise.resolve(
          dispose.call(instance.client.instance, { signal: controller.signal }),
        ).catch(() => undefined),
        disposeTimedOut,
      ]);
    } finally {
      clearTimeout(timeout);
    }
  }

  instance.server?.close?.();
}

export async function runHomepageStructuredPrompt({
  title,
  prompt,
  schema,
  retryCount = 1,
}) {
  const missing = missingHomepageAiConfiguration();
  if (missing.length > 0) return null;

  const route = homepageAiRoute();
  const apiKey = process.env.HOMEPAGE_AI_API_KEY.trim();
  const sdkEntry = process.env.OPENCODE_SDK_ENTRY.trim();

  const managedEnvKeys = [
    "OPENCODE_DISABLE_PROJECT_CONFIG",
    "OPENCODE_DISABLE_CLAUDE_CODE",
    "OPENCODE_PURE",
    "OPENCODE_AUTH_CONTENT",
  ];
  const previousEnv = Object.fromEntries(
    managedEnvKeys.map((key) => [key, process.env[key]]),
  );

  process.env.OPENCODE_DISABLE_PROJECT_CONFIG = "1";
  process.env.OPENCODE_DISABLE_CLAUDE_CODE = "1";
  process.env.OPENCODE_PURE = "1";
  process.env.OPENCODE_AUTH_CONTENT = JSON.stringify({
    [route.provider]: { type: "api", key: apiKey },
  });

  let instance;
  try {
    const sdk = await import(pathToFileURL(sdkEntry).href);
    if (typeof sdk.createOpencode !== "function") {
      throw new Error("opencode_runtime_unavailable");
    }

    instance = await sdk.createOpencode({
    hostname: "127.0.0.1",
    timeout: 15_000,
    config: {
      model: `${route.provider}/${route.model}`,
      enabled_providers: [route.provider],
      share: "disabled",
      autoupdate: false,
      snapshot: false,
      instructions: [],
      mcp: {},
      formatter: false,
      lsp: false,
      permission: {
        edit: "deny",
        bash: "deny",
        webfetch: "deny",
        doom_loop: "deny",
        external_directory: "deny",
      },
      tools: {
        read: false,
        glob: false,
        grep: false,
        bash: false,
        edit: false,
        write: false,
        patch: false,
        apply_patch: false,
        webfetch: false,
        websearch: false,
        task: false,
        skill: false,
      },
    },
  });

    const created = await instance.client.session.create({
      body: { title: title || "Tomz.io Homepage AI" },
    });
    const session = created?.data ?? created;
    const sessionId = session?.id;
    if (!sessionId) throw new Error("opencode_session_create_failed");

    const result = await instance.client.session.prompt({
      path: { id: sessionId },
      body: {
        model: {
          providerID: route.provider,
          modelID: route.model,
        },
        parts: [{ type: "text", text: prompt }],
        format: {
          type: "json_schema",
          schema,
          retryCount,
        },
      },
    });

    return structuredOutputFrom(result);
  } finally {
    if (instance) await disposeOpenCode(instance);
    for (const key of managedEnvKeys) {
      const previous = previousEnv[key];
      if (previous === undefined) delete process.env[key];
      else process.env[key] = previous;
    }
  }
}
