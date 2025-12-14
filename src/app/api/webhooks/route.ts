import { db } from "@/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import OrderReceivedEmail from "@/components/emails/OrderReceived";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");

    if (!signature) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    if (event.type === "checkout.session.completed") {
      if (!event.data.object.customer_details?.email) {
        throw new Error("Missing user email");
      }

      const session = event.data.object as Stripe.Checkout.Session;

      const { userId, orderId } = session.metadata || {
        userId: null,
        orderId: null,
      };

      if (!userId || !orderId) {
        throw new Error("Invalid request metadata");
      }

      const billingAddress = session.customer_details!.address;

      // Access shipping details from event data with proper typing
      const eventSession = event.data.object as Stripe.Checkout.Session & {
        shipping_details?: {
          address?: Stripe.Address;
          name?: string | null;
          phone?: string | null;
        } | null;
      };

      const shippingAddress = eventSession.shipping_details?.address;

      if (!shippingAddress) {
        throw new Error("Missing shipping address");
      }

      const shippingAddressData = {
        name: session.customer_details!.name!,
        city: shippingAddress.city!,
        country: shippingAddress.country!,
        postalCode: shippingAddress.postal_code!,
        street: shippingAddress.line1!,
        state: shippingAddress.state || null,
        phoneNumber: eventSession.shipping_details?.phone || null,
      };

      const updatedOrder = await db.order.update({
        where: {
          id: orderId,
        },
        data: {
          isPaid: true,
          shippingAddress: {
            create: shippingAddressData,
          },
          billingAddress: {
            create: {
              name: session.customer_details!.name!,
              city: billingAddress!.city!,
              country: billingAddress!.country!,
              postalCode: billingAddress!.postal_code!,
              street: billingAddress!.line1!,
              state: billingAddress!.state || null,
              phoneNumber: null,
            },
          },
        },
        include: {
          shippingAddress: true,
        },
      });

      if (!updatedOrder.shippingAddress) {
        throw new Error("Failed to create shipping address");
      }

      await resend.emails.send({
        from: "CasePenguin <anasgets111@gmail.com>",
        to: [event.data.object.customer_details.email],
        subject: "Thanks for your order!",
        react: OrderReceivedEmail({
          orderId,
          orderDate: updatedOrder.createdAt.toLocaleDateString(),
          shippingAddress: updatedOrder.shippingAddress,
        }),
      });
    }

    return NextResponse.json({ result: event, ok: true });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { message: "Something went wrong", ok: false },
      { status: 500 },
    );
  }
}
