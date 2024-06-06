const moment = require('moment-timezone');

function timeCheck(req, res, next) {
  // Get current time in IST
  const currentTime = moment.tz('Asia/Kolkata');
  const currentHour = currentTime.hour();
  const currentMinute = currentTime.minute();

  // Define the allowed time fra0me
  const startHour = 10;
  const startMinute = 0;
  const endHour = 23;
  const endMinute = 0;

  // Check if current time is within the allowed time frame
  if ((currentHour > startHour || (currentHour === startHour && currentMinute >= startMinute)) &&
      (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute))) {
    next(); // Proceed with the subscription process
  } else {
    res.status(403).json({ message: 'Payments are only allowed between 10:00 AM to 11:00 PM IST' });
  }
}


module.exports = timeCheck