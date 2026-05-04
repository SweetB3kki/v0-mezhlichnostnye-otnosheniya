export const TEST_SUBMIT_URL = "/api/submit";

export type ResponseItem = {
  kind: "SOCIOMETRY" | "FIRO";
  key: string;
  answer: unknown;
};

export type SubmitPayload = {
  studentId: string;
  classId?: string;
  type?: "COMBINED";
  meta: {
    durationSeconds: number;
    startedAt: string;
  };
  responses: ResponseItem[];
};

export async function submitTest(
  payload: SubmitPayload
): Promise<{ success: boolean; error?: string; sessionId?: string }> {
  try {
    const response = await fetch(TEST_SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // ВАЖНО: читаем как текст, чтобы увидеть реальные ошибки сервера (в т.ч. HTML/пустой ответ)
    const raw = await response.text();

    let data: { error?: string; sessionId?: string } = {};
    try {
      const parsed = raw ? (JSON.parse(raw) as unknown) : {};
      if (parsed && typeof parsed === "object") {
        data = parsed as { error?: string; sessionId?: string };
      }
    } catch {
      data = {};
    }

    if (!response.ok) {
      return {
        success: false,
        error: data?.error || raw || `HTTP ${response.status}`,
      };
    }

    return { success: true, sessionId: data?.sessionId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
