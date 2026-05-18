// app/api/newsletter/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendConfirmationEmail } from "@/lib/newsletter";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().max(100).optional(),
  categories: z.array(z.string()).optional(),
  frequency: z.enum(["REALTIME", "DAILY", "WEEKLY"]).default("DAILY"),
});

export async function POST(req: NextRequest) {
  try {
    const body = subscribeSchema.parse(await req.json());

    const existing = await prisma.subscriber.findUnique({
      where: { email: body.email },
    });

    if (existing?.status === "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "Already subscribed" },
        { status: 409 }
      );
    }

    const subscriber = await prisma.subscriber.upsert({
      where: { email: body.email },
      create: {
        email: body.email,
        name: body.name,
        frequency: body.frequency,
        status: "PENDING",
      },
      update: {
        name: body.name,
        frequency: body.frequency,
        status: "PENDING",
      },
    });

    await sendConfirmationEmail(body.email, subscriber.token);

    return NextResponse.json({
      success: true,
      message: "Check your email to confirm your subscription",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Subscription failed" },
      { status: 500 }
    );
  }
}

// GET /api/newsletter?email=x — public subscriber count
export async function GET() {
  const count = await prisma.subscriber.count({ where: { status: "ACTIVE" } });
  return NextResponse.json({ count });
}
