import { Webhook, WebhookRequiredHeaders } from "svix";
import { headers } from "next/headers";
import { IncomingHttpHeaders } from "http";
import { NextResponse } from "next/server";

import {
    addMemberToRift,
    createRift,
    deleteRift,
    removeUserFromRift,
    updateRiftInfo,
} from "@/lib/actions/rift.actions";

/**
 * IMPORTANT: Clerk webhooks must run on Node (not Edge)
 */
export const runtime = "nodejs";

type EventType =
    | "organization.created"
    | "organizationInvitation.created"
    | "organizationMembership.created"
    | "organizationMembership.deleted"
    | "organization.updated"
    | "organization.deleted";

type Event = {
    data: any;
    object: "event";
    type: EventType;
};

export async function POST(request: Request) {
    console.log("📨 Clerk webhook received");

    const payload = await request.text();

    const headerList = await headers();

    const svixHeaders = {
        "svix-id": headerList.get("svix-id"),
        "svix-timestamp": headerList.get("svix-timestamp"),
        "svix-signature": headerList.get("svix-signature"),
    };

    if (
        !svixHeaders["svix-id"] ||
        !svixHeaders["svix-timestamp"] ||
        !svixHeaders["svix-signature"]
    ) {
        return NextResponse.json(
            { error: "Missing Svix headers" },
            { status: 400 }
        );
    }

    /* ------------------------------------------------------------------ */
    /* 3. Verify webhook signature                                        */
    /* ------------------------------------------------------------------ */
    const webhookSecret = process.env.NEXT_CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error("❌ Missing NEXT_CLERK_WEBHOOK_SECRET");
        return NextResponse.json(
            { error: "Webhook secret not configured" },
            { status: 500 }
        );
    }

    const wh = new Webhook(webhookSecret);

    let event: Event;

    try {
        event = wh.verify(
            payload,
            svixHeaders as IncomingHttpHeaders & WebhookRequiredHeaders
        ) as Event;
    } catch (err) {
        console.error("❌ Webhook verification failed:", err);
        return NextResponse.json(
            { error: "Invalid webhook signature" },
            { status: 400 }
        );
    }

    console.log("✅ Webhook verified:", event.type);

    /* ------------------------------------------------------------------ */
    /* 4. Handle events                                                   */
    /* ------------------------------------------------------------------ */

    const eventType = event.type;
    const data = event.data;

    try {
        if (eventType === "organization.created") {
            const { id, name, slug, logo_url, image_url, created_by } = data;

            await createRift(
                id,
                name,
                slug,
                logo_url || image_url,
                "org bio",
                created_by
            );

            return NextResponse.json({ message: "Organization created" }, { status: 201 });
        }

        if (eventType === "organizationInvitation.created") {
            console.log("📩 Invitation created:", data);
            return NextResponse.json({ message: "Invitation created" }, { status: 201 });
        }

        if (eventType === "organizationMembership.created") {
            const { organization, public_user_data } = data;

            await addMemberToRift(
                organization.id,
                public_user_data.user_id
            );

            return NextResponse.json(
                { message: "Member added" },
                { status: 201 }
            );
        }

        if (eventType === "organizationMembership.deleted") {
            const { organization, public_user_data } = data;

            await removeUserFromRift(
                public_user_data.user_id,
                organization.id
            );

            return NextResponse.json(
                { message: "Member removed" },
                { status: 201 }
            );
        }

        if (eventType === "organization.updated") {
            const { id, logo_url, name, slug } = data;

            await updateRiftInfo(id, name, slug, logo_url);

            return NextResponse.json(
                { message: "Organization updated" },
                { status: 201 }
            );
        }

        if (eventType === "organization.deleted") {
            const { id } = data;

            await deleteRift(id);

            return NextResponse.json(
                { message: "Organization deleted" },
                { status: 201 }
            );
        }
    } catch (err) {
        console.error("❌ Webhook handler error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }

    /* ------------------------------------------------------------------ */
    /* 5. REQUIRED fallback (prevents 405)                                 */
    /* ------------------------------------------------------------------ */
    return NextResponse.json(
        { message: "Event received but not handled" },
        { status: 200 }
    );
}
