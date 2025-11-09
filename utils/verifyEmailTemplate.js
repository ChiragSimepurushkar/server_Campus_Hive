const VerificationEmail = (username, otp) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Campus Hive: Email Verification</title>
      <style>
        /* General Reset and Container */
        .container {
          max-width: 600px;
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px; /* Softer look */
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          background-color: #ffffff;
        }
        /* Header/Branding */
        .header {
          text-align: center;
          border-bottom: 2px solid #ffc107; /* Primary brand color - Yellow/Orange for "Hive" */
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .header h1 {
          color: #ffc107; /* Campus Hive Yellow */
          font-size: 24px;
          margin: 0;
        }
        /* Main Content */
        .content {
          text-align: left;
          color: #333;
        }
        .content p {
          font-size: 16px;
          line-height: 1.6;
        }
        /* OTP Display */
        .otp-section {
          text-align: center;
          margin: 30px 0;
        }
        .otp {
          font-size: 28px;
          font-weight: 700;
          color: #28a745; /* Green for action/success */
          letter-spacing: 5px;
          padding: 15px 30px;
          border: 2px solid #28a745;
          border-radius: 6px;
          display: inline-block;
          background-color: #f7fff7;
        }
        /* Important Note */
        .note {
          margin-top: 25px;
          padding: 15px;
          background-color: #f8f9fa;
          border-left: 5px solid #007bff; /* Blue for importance/info */
          font-size: 14px;
          color: #555;
        }
        /* Footer */
        .footer {
          text-align: center;
          font-size: 12px;
          color: #999;
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Campus Hive Verification</h1>
        </div>
        <div class="content">
          <p>Hello ${username},</p>
          <p>
            Welcome to **Campus Hive**, your central hub for collaboration! We're excited to have you join the student community.
            To complete your registration and gain access to projects and team matchmaking,
            please use the One-Time Password (OTP) below to verify your email address:
          </p>
        </div>
        <div class="otp-section">
          <p style="font-size: 14px; color: #555; margin-bottom: 10px;">Your Verification Code is:</p>
          <div class="otp">${otp}</div>
        </div>
        <div class="content">
          <p>
            This code is valid for a limited time. Please return to the application and enter it immediately.
          </p>
          <div class="note">
            **Important:** If you did not attempt to sign up for Campus Hive, please ignore this email.
            Do not share this code with anyone.
          </div>
        </div>
        <div class="footer">
          <p>&copy; 2024 Campus Hive | A Student Collaboration Initiative.</p>
          <p>You are receiving this email because a new account registration was initiated using this address.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default VerificationEmail;