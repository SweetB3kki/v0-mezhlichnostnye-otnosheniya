export const TEST_SUBMIT_URL = "/api/test"

export interface TestPayload {
  studentId: string
  classId: string
  responses: Array<{
    questionId?: string
    key?: string
    answer: string | string[] | number
  }>
  meta: {
    durationSeconds: number
    startedAt: string
  }
  type: "SOCIOMETRY" | "FIRO" | "COMBINED"
}

export async function submitTest(payload: TestPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(TEST_SUBMIT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error("Failed to submit test")
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
