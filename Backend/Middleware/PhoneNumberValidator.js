const { parsePhoneNumberFromString } = require("libphonenumber-js");

function cleanInput(input) {
  return String(input).replace(/\D/g, "");
}

function PhoneNumberValidator(rawInput) {
  if (!rawInput) return { isValid: false, formatted: null };

  const cleaned = cleanInput(rawInput);
  let formattedNumber;

  if (cleaned.length === 10) {
    formattedNumber = `+91${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("0")) {
    formattedNumber = `+91${cleaned.slice(1)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
    formattedNumber = `+${cleaned}`;
  } else if (cleaned.length === 13 && cleaned.startsWith("091")) {
    formattedNumber = `+91${cleaned.slice(3)}`;
  } else {
    return { isValid: false, formatted: null };
  }

  const phoneNumber = parsePhoneNumberFromString(formattedNumber, "IN");

  console.log("Valid Phone:", phoneNumber?.isValid());

  if (phoneNumber && phoneNumber.isValid() && phoneNumber.country === "IN") {
    return {
      isValid: true,
      formatted: phoneNumber.format("E.164"),
      national: phoneNumber.formatNational(),
    };
  }

  return { isValid: false, formatted: null };
}

module.exports = PhoneNumberValidator;
