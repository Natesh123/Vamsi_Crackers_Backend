const { getPool } = require('../config/db');
const { 
  sendEmail, 
  getAdminOrderTemplate, 
  getCustomerConfirmationTemplate, 
  getCustomerStatusUpdateTemplate 
} = require('../utils/emailService');

exports.createOrder = async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_email, customer_city, customer_address, total_amount, total_savings, items, source } = req.body;

    if (!customer_name || !customer_phone || !customer_city || !customer_address || !items) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    const pool = getPool();
    const itemsJson = JSON.stringify(items);

    const orderSource = source || 'Website';
    const initialStatus = orderSource === 'POS' ? 'Completed' : 'Pending';
    const initialPaymentStatus = orderSource === 'POS' ? 'Paid' : 'Unpaid';

    const [result] = await pool.query(
      `INSERT INTO orders (customer_name, customer_phone, customer_email, customer_city, customer_address, total_amount, total_savings, items, source, status, is_read, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, ?)`,
      [customer_name, customer_phone, customer_email || '', customer_city, customer_address, total_amount, total_savings, itemsJson, orderSource, initialStatus, initialPaymentStatus]
    );

    const orderId = result.insertId;
    let emailSent = false;
    
    // 1. Send Branded Email to Admin
    const adminEmail = process.env.EMAIL_USER;
    if (adminEmail) {
      const adminHtml = getAdminOrderTemplate(
        orderId, 
        { name: customer_name, phone: customer_phone, email: customer_email, city: customer_city, address: customer_address },
        items,
        total_amount,
        total_savings
      );
      // Fire and forget
      sendEmail(adminEmail, `New Order Received - #${orderId}`, adminHtml)
        .then(adminSuccess => { if (adminSuccess) console.log('Admin email sent'); })
        .catch(err => console.error('Admin email error:', err));
      emailSent = true;
    }

    // 2. Send Branded Order Confirmation Email to Customer (if email is provided)
    if (customer_email) {
      console.log(`Attempting to send Customer Email to: ${customer_email}`);
      const customerHtml = getCustomerConfirmationTemplate(orderId, customer_name, items, total_amount, total_savings);
      // Fire and forget
      sendEmail(customer_email, `Order Confirmation - #${orderId}`, customerHtml)
        .then(custSuccess => console.log(`Customer email sent success status: ${custSuccess}`))
        .catch(err => console.error('Customer email error:', err));
    } else {
      console.log('No customer_email provided, skipping customer email step.');
    }
      
    // Emit socket event for new order notification ONLY for Website orders
    const io = req.app.get('io');
    if (io && orderSource === 'Website') {
      io.emit('new-order', {
        id: orderId,
        customer_name,
        customer_phone,
        customer_city,
        total_amount,
        total_savings,
        items: items,
        created_at: new Date(),
        source: orderSource
      });
    }

    // Send Telegram notification
    let telegramSent = false;
    const teleToken = process.env.TELEGRAM_BOT_TOKEN;
    const teleChatId = process.env.TELEGRAM_CHAT_ID;
    
    if (teleToken && teleChatId) {
      try {
        const itemsText = items.map(i => `🔸 ${i.name} (x${i.quantity}) - Rs. ${i.price * i.quantity}`).join('\n');
        const messageText = `🎉 NEW ORDER RECEIVED! 🎉\n\n📦 Order ID: #${orderId}\n👤 Customer: ${customer_name}\n📞 Phone: ${customer_phone}\n📍 City: ${customer_city}\n💰 Total Amount: Rs. ${total_amount}\n\n🛒 ITEMS:\n${itemsText}\n\nCheck Admin Panel for more details.`;
        
        // Fire and forget
        fetch(`https://api.telegram.org/bot${teleToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: teleChatId,
            text: messageText
          })
        })
        .then(() => console.log(`Telegram notification sent successfully for order #${orderId}`))
        .catch(teleErr => console.error('Failed to send Telegram notification:', teleErr.message));
        
        telegramSent = true;
      } catch (teleErr) {
        console.error('Failed to send Telegram notification:', teleErr.message);
      }
    } else {
      console.warn('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set in .env. Skipping Telegram notification.');
    }

    // Send Fast2SMS Notification to Admin
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    const adminMobile = process.env.ADMIN_MOBILE_NUMBER;
    if (fast2smsKey && adminMobile) {
      const paddedOrderId = String(orderId).padStart(4, '0');
      const smsMessage = `Vamsi Crackers - New Order Placed!
Order No: ${paddedOrderId}
Name: ${customer_name}
City: ${customer_city}
Total: Rs.${total_amount}
Check panel for items.`;
      
      const params = new URLSearchParams();
      params.append("message", smsMessage);
      params.append("language", "english");
      params.append("route", "q");
      params.append("numbers", adminMobile);
      
      // Fire and forget Fast2SMS
      fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          "authorization": fast2smsKey,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
      })
      .then(res => res.json())
      .then(data => console.log("Fast2SMS Sent successfully:", data))
      .catch(err => console.error("Fast2SMS Error:", err));
    }

    res.status(201).json({ success: true, message: 'Order created successfully', orderId: orderId, emailSent, telegramSent });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    
    // Parse the JSON items back to an array for the frontend
    const orders = rows.map(row => ({
      ...row,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
    }));

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

exports.markOrdersAsRead = async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('UPDATE orders SET is_read = TRUE WHERE is_read = FALSE');
    res.json({ success: true, message: 'Orders marked as read' });
  } catch (error) {
    console.error('Error marking orders as read:', error);
    res.status(500).json({ error: 'Failed to mark orders as read' });
  }
};

exports.markSingleOrderAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    await pool.query('UPDATE orders SET is_read = TRUE WHERE id = ?', [id]);
    res.json({ success: true, message: `Order #${id} marked as read` });
  } catch (error) {
    console.error(`Error marking order as read:`, error);
    res.status(500).json({ error: 'Failed to mark order as read' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const pool = getPool();
    
    // Fetch order details before updating to get customer info for email
    const [orders] = await pool.query('SELECT customer_name, customer_email, status FROM orders WHERE id = ?', [id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orders[0];
    
    // Update the status
    let query = 'UPDATE orders SET status = ? WHERE id = ?';
    let queryParams = [status, id];
    
    if (status === 'Processing') {
      query = 'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?';
      queryParams = [status, 'Paid', id];
    }
    
    await pool.query(query, queryParams);
    
    // If status changed and customer provided an email, send status update email
    if (order.status !== status && order.customer_email) {
      console.log(`Status changed from ${order.status} to ${status}. Sending email to ${order.customer_email}...`);
      const statusHtml = getCustomerStatusUpdateTemplate(id, order.customer_name, status);
      // Fire and forget so the API responds instantly
      sendEmail(order.customer_email, `Order Status Update - #${id}`, statusHtml)
        .then(updateSuccess => console.log(`Status update email sent success: ${updateSuccess}`))
        .catch(err => console.error(`Error sending status update email:`, err));
    } else {
      console.log(`Not sending status email. Status changed: ${order.status !== status}. Customer Email: ${order.customer_email}`);
    }
    
    res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;
    
    if (!payment_status) {
      return res.status(400).json({ error: 'Payment status is required' });
    }

    const pool = getPool();
    await pool.query('UPDATE orders SET payment_status = ? WHERE id = ?', [payment_status, id]);
    
    res.json({ success: true, message: 'Payment status updated' });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
};

exports.updateOrderItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, total_amount, total_savings } = req.body;
    
    if (!items || total_amount === undefined || total_savings === undefined) {
      return res.status(400).json({ error: 'Missing required order update fields' });
    }

    const pool = getPool();
    const itemsJson = JSON.stringify(items);
    
    const [result] = await pool.query(
      'UPDATE orders SET items = ?, total_amount = ?, total_savings = ? WHERE id = ?',
      [itemsJson, total_amount, total_savings, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ success: true, message: 'Order items updated successfully' });
  } catch (error) {
    console.error('Error updating order items:', error);
    res.status(500).json({ error: 'Failed to update order items' });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};
