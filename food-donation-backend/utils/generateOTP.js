const generateOTP = () => {
  // Generate 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const isOTPExpired = (otpExpiry) => {
  if (!otpExpiry) return true;
  return new Date() > new Date(otpExpiry);
};

module.exports = { generateOTP, isOTPExpired };