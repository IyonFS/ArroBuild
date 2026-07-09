import type { InterviewSession, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { CreditService, CreditServiceError } from "@/lib/services/credit.service";
import { logger } from "@/lib/logger";
import {
  INTERVIEW_CREDIT_ESTIMATE,
  INTERVIEW_FREE_SESSIONS_PER_MONTH,
  INTERVIEW_GREETING,
  type InterviewFilledFields,
  type InterviewMessage,
} from "@/lib/ai/interview";

export { INTERVIEW_CREDIT_ESTIMATE, INTERVIEW_FREE_SESSIONS_PER_MONTH };

export class InterviewServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "InterviewServiceError";
  }
}

export interface InterviewQuotaInfo {
  usedThisMonth: number;
  freeRemaining: number;
  isPaidSession: boolean;
  estimatedCredits: number;
  creditBalance: number;
}

function monthWindow(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

function parseFilledFields(value: Prisma.JsonValue): InterviewFilledFields {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as InterviewFilledFields;
}

function parseMessages(value: Prisma.JsonValue): InterviewMessage[] {
  if (!Array.isArray(value)) return [];
  const result: InterviewMessage[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const role = item.role;
    const content = item.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") {
      continue;
    }
    result.push({
      role,
      content: content.slice(0, 2000),
    });
  }
  return result;
}

export const InterviewService = {
  async getQuota(userId: string): Promise<InterviewQuotaInfo> {
    const { start, end } = monthWindow();
    const usedThisMonth = await prisma.interviewSession.count({
      where: {
        userId,
        createdAt: { gte: start, lt: end },
        status: { not: "ABANDONED" },
      },
    });

    const balance = await CreditService.getBalance(userId);
    const freeRemaining = Math.max(
      0,
      INTERVIEW_FREE_SESSIONS_PER_MONTH - usedThisMonth
    );
    const isPaidSession = freeRemaining <= 0;

    return {
      usedThisMonth,
      freeRemaining,
      isPaidSession,
      estimatedCredits: isPaidSession ? INTERVIEW_CREDIT_ESTIMATE : 0,
      creditBalance: balance.available,
    };
  },

  async startSession(userId: string): Promise<{
    session: InterviewSession;
    quota: InterviewQuotaInfo;
    greeting: string;
  }> {
    const quota = await this.getQuota(userId);

    if (quota.isPaidSession && quota.creditBalance < INTERVIEW_CREDIT_ESTIMATE) {
      throw new InterviewServiceError(
        "INSUFFICIENT_CREDITS",
        `Sesi ke-${quota.usedThisMonth + 1} bulan ini memakai ~${INTERVIEW_CREDIT_ESTIMATE} kredit. Saldo kamu ${quota.creditBalance}.`,
        402
      );
    }

    let reservationId: string | null = null;
    let creditsCharged = 0;
    let credited = false;

    if (quota.isPaidSession) {
      const reservation = await CreditService.reserveCredit(
        userId,
        INTERVIEW_CREDIT_ESTIMATE,
        `interview-${userId}-${Date.now()}`,
        { toolId: "interview", reason: "interview_session_start" }
      );
      reservationId = reservation.reservationId;
      creditsCharged = INTERVIEW_CREDIT_ESTIMATE;
      credited = true;
    }

    const greeting = INTERVIEW_GREETING;
    const messages: InterviewMessage[] = [
      { role: "assistant", content: greeting },
    ];

    try {
      const session = await prisma.interviewSession.create({
        data: {
          userId,
          status: "ACTIVE",
          turnCount: 0,
          filledFields: {},
          messages: messages as unknown as Prisma.InputJsonValue,
          credited,
          creditsCharged,
          reservationId,
        },
      });

      logger.info("interview_session_started", {
        userId,
        sessionId: session.id,
        isPaidSession: quota.isPaidSession,
        creditsCharged,
      });

      return {
        session,
        quota: await this.getQuota(userId),
        greeting,
      };
    } catch (error) {
      if (reservationId) {
        await CreditService.releaseReservation(
          userId,
          reservationId,
          "interview_start_failed"
        );
      }
      throw error;
    }
  },

  async getOwnedSession(sessionId: string, userId: string) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.userId !== userId) {
      throw new InterviewServiceError(
        "SESSION_NOT_FOUND",
        "Sesi wawancara tidak ditemukan",
        404
      );
    }
    return session;
  },

  getSessionMessages(session: InterviewSession): InterviewMessage[] {
    return parseMessages(session.messages);
  },

  getSessionFields(session: InterviewSession): InterviewFilledFields {
    return parseFilledFields(session.filledFields);
  },

  async updateAfterTurn(params: {
    sessionId: string;
    userId: string;
    turnCount: number;
    filledFields: InterviewFilledFields;
    messages: InterviewMessage[];
    status: "ACTIVE" | "FALLBACK" | "COMPLETED";
  }) {
    return prisma.interviewSession.update({
      where: { id: params.sessionId },
      data: {
        turnCount: params.turnCount,
        filledFields: params.filledFields as unknown as Prisma.InputJsonValue,
        messages: params.messages as unknown as Prisma.InputJsonValue,
        status: params.status,
      },
    });
  },

  async settleSessionCredits(session: InterviewSession): Promise<void> {
    if (!session.credited || !session.reservationId) return;
    if (session.creditsCharged <= 0) return;

    // Convert hold into TOOL_USAGE spend
    try {
      await CreditService.releaseReservation(
        session.userId,
        session.reservationId,
        "interview_settling"
      );
    } catch {
      // Hold may already be released; continue to charge actual usage
    }

    const balance = await CreditService.getBalance(session.userId);
    if (balance.available < session.creditsCharged) {
      throw new CreditServiceError(
        "INSUFFICIENT_CREDITS",
        "Kredit tidak cukup untuk menyelesaikan sesi wawancara",
        402
      );
    }

    const currentBalance = balance.available;
    await prisma.$transaction(async (tx) => {
      const entry = await tx.creditLedger.create({
        data: {
          userId: session.userId,
          type: "TOOL_USAGE",
          amount: -session.creditsCharged,
          toolId: "interview",
          balanceAfter: currentBalance - session.creditsCharged,
          metadata: {
            sessionId: session.id,
            reason: "interview_session",
          },
        },
      });

      await tx.user.update({
        where: { id: session.userId },
        data: { creditBalance: entry.balanceAfter },
      });

      await tx.interviewSession.update({
        where: { id: session.id },
        data: { reservationId: null },
      });
    });
  },

  async releaseSessionCredits(session: InterviewSession, reason: string) {
    if (!session.reservationId) return;
    await CreditService.releaseReservation(
      session.userId,
      session.reservationId,
      reason
    );
    await prisma.interviewSession.update({
      where: { id: session.id },
      data: { reservationId: null, credited: false, creditsCharged: 0 },
    });
  },

  async abandonSession(sessionId: string, userId: string) {
    const session = await this.getOwnedSession(sessionId, userId);
    if (session.status !== "ACTIVE") {
      return session;
    }

    if (session.reservationId) {
      await this.releaseSessionCredits(session, "interview_abandoned");
    }

    return prisma.interviewSession.update({
      where: { id: sessionId },
      data: { status: "ABANDONED" },
    });
  },

  async completeSession(
    sessionId: string,
    userId: string,
    status: "COMPLETED" | "FALLBACK"
  ) {
    const session = await this.getOwnedSession(sessionId, userId);
    if (session.status !== "ACTIVE" && session.status !== status) {
      // allow idempotent complete
      return {
        session,
        filledFields: this.getSessionFields(session),
      };
    }

    if (session.credited && session.reservationId) {
      await this.settleSessionCredits(session);
    }

    const updated = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { status },
    });

    logger.info("interview_session_finished", {
      userId,
      sessionId,
      status,
      turnCount: updated.turnCount,
      creditsCharged: updated.creditsCharged,
    });

    return {
      session: updated,
      filledFields: this.getSessionFields(updated),
    };
  },
};
