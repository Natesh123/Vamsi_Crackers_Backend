const nodemailer = require('nodemailer');
const path = require('path');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('EMAIL_USER or EMAIL_PASS not set. Skipping email.');
    return false;
  }

  const transporter = createTransporter();
  const mailOptions = {
    from: `"Sri Dhakshina Crackers" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments: [{
      filename: 'sri_dhakshina_logo.jpg',
      path: path.join(__dirname, 'sri_dhakshina_logo.jpg'),
      cid: 'companylogo'
    }]
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message);
    return false;
  }
};

// Common Styles
const primaryColor = "#16052b";
const accentColor = "#d97706"; // festive gold
const redColor = "#dc2626";

const emailHeader = `
  <div style="background-color: ${primaryColor}; padding: 25px 20px; text-align: center; border-bottom: 4px solid ${accentColor};">
    <div style="margin-bottom: 12px;">
      <img src="cid:companylogo" alt="Sri Dhakshina Crackers" style="width: 70px; height: 70px; object-fit: contain; border-radius: 12px; border: 2px solid ${accentColor}; background-color: #ffffff; padding: 2px; display: inline-block;" />
    </div>
    <h1 style="color: #ffffff; margin: 0; font-size: 26px; text-transform: uppercase; letter-spacing: 2px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      Sri Dhakshina <span style="color: ${accentColor};">Crackers</span>
    </h1>
    <p style="color: ${accentColor}; margin: 5px 0 0 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">Sivakasi's Pride</p>
  </div>
`;

const emailFooter = `
  <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; margin-top: 30px;">
    <p style="margin: 0;">Thank you for choosing Sri Dhakshina Crackers!</p>
    <p style="margin: 5px 0 0 0;">123 Fireworks Street, Sivakasi, Tamil Nadu</p>
  </div>
`;

// Templates
const getAdminOrderTemplate = (orderId, customer, items, total, savings) => {
  const itemsHtml = items.map(i => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${i.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${i.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">Rs. ${i.price * i.quantity}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb;">
      ${emailHeader}
      <div style="padding: 20px;">
        <h2 style="color: ${primaryColor}; margin-top: 0;">New Order Received! 🎉</h2>
        <p style="color: #4b5563;">You have received a new order <strong>#${orderId}</strong>.</p>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h3 style="color: ${primaryColor}; margin-top: 0; font-size: 16px;">Customer Details:</h3>
          <p style="margin: 5px 0; color: #4b5563;"><strong>Name:</strong> ${customer.name}</p>
          <p style="margin: 5px 0; color: #4b5563;"><strong>Phone:</strong> ${customer.phone}</p>
          <p style="margin: 5px 0; color: #4b5563;"><strong>Email:</strong> ${customer.email || 'N/A'}</p>
          <p style="margin: 5px 0; color: #4b5563;"><strong>City:</strong> ${customer.city}</p>
          <p style="margin: 5px 0; color: #4b5563;"><strong>Address:</strong> ${customer.address}</p>
        </div>

        <h3 style="color: ${primaryColor}; font-size: 16px;">Order Summary:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left; color: #374151;">Item</th>
              <th style="padding: 10px; text-align: center; color: #374151;">Qty</th>
              <th style="padding: 10px; text-align: right; color: #374151;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; color: ${primaryColor};">Grand Total:</td>
              <td style="padding: 10px; text-align: right; font-weight: bold; color: ${redColor}; font-size: 18px;">Rs. ${total}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      ${emailFooter}
    </div>
  `;
};

const getCustomerConfirmationTemplate = (orderId, customerName, items, total, savings) => {
  const itemsHtml = items.map(i => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${i.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${i.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">Rs. ${i.price * i.quantity}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb;">
      ${emailHeader}
      <div style="padding: 20px;">
        <h2 style="color: ${primaryColor}; margin-top: 0;">Thank You for Your Order! 🎆</h2>
        <p style="color: #4b5563; font-size: 16px;">Dear ${customerName},</p>
        <p style="color: #4b5563; line-height: 1.5;">We have successfully received your order <strong>#${orderId}</strong>. Our team is currently reviewing it and will contact you shortly regarding delivery and payment confirmation.</p>
        
        <div style="background-color: #fffbeb; border-left: 4px solid ${accentColor}; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e; font-weight: bold;">Order Status: Pending Confirmation</p>
        </div>

        <h3 style="color: ${primaryColor}; font-size: 16px;">Your Order Details:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left; color: #374151;">Item</th>
              <th style="padding: 10px; text-align: center; color: #374151;">Qty</th>
              <th style="padding: 10px; text-align: right; color: #374151;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; color: ${primaryColor}; border-top: 2px solid #e5e7eb;">Grand Total:</td>
              <td style="padding: 10px; text-align: right; font-weight: bold; color: ${redColor}; font-size: 18px; border-top: 2px solid #e5e7eb;">Rs. ${total}</td>
            </tr>
            ${savings > 0 ? `
            <tr>
              <td colspan="2" style="padding: 5px 10px; text-align: right; font-weight: bold; color: #10b981;">Total Savings:</td>
              <td style="padding: 5px 10px; text-align: right; font-weight: bold; color: #10b981;">Rs. ${savings}</td>
            </tr>` : ''}
          </tfoot>
        </table>
        
        <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">If you have any questions or need to make changes to your order, please contact our support team immediately.</p>
      </div>
      ${emailFooter}
    </div>
  `;
};

const getCustomerStatusUpdateTemplate = (orderId, customerName, newStatus) => {
  let statusColor = "#3b82f6"; // blue
  let statusMessage = "Your order status has been updated.";
  
  if (newStatus === "Processing") {
    statusColor = "#f59e0b"; // amber
    statusMessage = "Good news! We are now processing your order and getting your fireworks ready.";
  } else if (newStatus === "Shipped" || newStatus === "Dispatched") {
    statusColor = "#8b5cf6"; // purple
    statusMessage = "Your order has been dispatched and is on its way to you!";
  } else if (newStatus === "Completed" || newStatus === "Delivered") {
    statusColor = "#10b981"; // green
    statusMessage = "Your order has been completed successfully. We hope you have a fantastic celebration!";
  } else if (newStatus === "Cancelled") {
    statusColor = "#ef4444"; // red
    statusMessage = "Your order has been cancelled. If you have any questions, please contact our support team.";
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb;">
      ${emailHeader}
      <div style="padding: 20px;">
        <h2 style="color: ${primaryColor}; margin-top: 0;">Order Status Update</h2>
        <p style="color: #4b5563; font-size: 16px;">Dear ${customerName},</p>
        <p style="color: #4b5563; line-height: 1.5;">This is an update regarding your order <strong>#${orderId}</strong>.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 5px solid ${statusColor}; padding: 20px; margin: 25px 0; text-align: center;">
          <p style="margin: 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Current Status</p>
          <h1 style="margin: 10px 0; color: ${statusColor}; font-size: 28px; text-transform: uppercase;">${newStatus}</h1>
          <p style="margin: 0; color: #334155; font-size: 15px;">${statusMessage}</p>
        </div>

        <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">Thank you for shopping with us! If you need any assistance, feel free to reply to this email.</p>
      </div>
      ${emailFooter}
    </div>
  `;
};

module.exports = {
  sendEmail,
  getAdminOrderTemplate,
  getCustomerConfirmationTemplate,
  getCustomerStatusUpdateTemplate
};
