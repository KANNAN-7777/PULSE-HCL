export function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (password.length >= 12) score++;

  if (score <= 2) {
    return {
      label: "Weak",
      width: "20%",
      className: "bg-red-500",
      textClass: "text-red-400",
    };
  }

  if (score === 3) {
    return {
      label: "Fair",
      width: "40%",
      className: "bg-orange-500",
      textClass: "text-orange-400",
    };
  }

  if (score === 4) {
    return {
      label: "Good",
      width: "70%",
      className: "bg-yellow-500",
      textClass: "text-yellow-400",
    };
  }

  return {
    label: "Strong",
    width: "100%",
    className: "bg-emerald-500",
    textClass: "text-emerald-400",
  };
}

export function getPasswordChecks(password) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export function isStrongPassword(password) {
  const checks = getPasswordChecks(password);

  return (
    checks.length &&
    checks.uppercase &&
    checks.lowercase &&
    checks.number &&
    checks.special
  );
}