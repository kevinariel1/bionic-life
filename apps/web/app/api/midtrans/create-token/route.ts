/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require('midtrans-client')

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
})

type CartItem = {
  product_id: string
  name: string
  quantity: number
  price: number
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items, shippingAddress } = body as {
      items: CartItem[]
      shippingAddress: string
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shippingFee = 15000
    const totalAmount = subtotal + shippingFee
    const midtransOrderId = `BIONIC-${Date.now()}-${user.id.slice(0, 8)}`

    const admin = createAdminClient() as any

    // 1. Create the order
    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total_amount: totalAmount,
        shipping_fee: shippingFee,
        midtrans_order_id: midtransOrderId,
        shipping_address: shippingAddress,
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Order creation error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // 2. Insert order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.price,
    }))

    await admin.from('order_items').insert(orderItems)

    // 3. Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // 4. Create Midtrans Snap transaction
    const transaction = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: totalAmount,
      },
      customer_details: {
        first_name: profile?.full_name ?? user.email?.split('@')[0] ?? 'Customer',
        email: user.email,
      },
      item_details: [
        ...items.map((item) => ({
          id: item.product_id,
          price: item.price,
          quantity: item.quantity,
          name: item.name.slice(0, 50),
        })),
        { id: 'SHIPPING', price: shippingFee, quantity: 1, name: 'Ongkos Kirim' },
      ],
    }

    const snapToken = await snap.createTransactionToken(transaction)

    // 5. Save snap token
    await admin
      .from('orders')
      .update({ midtrans_token: snapToken })
      .eq('id', order.id)

    return NextResponse.json({ snapToken, orderId: order.id, midtransOrderId })
  } catch (err) {
    console.error('Create token error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
